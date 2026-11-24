"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import type { MouseState } from "@/hooks/useMouse";
import { EYE_HEIGHT, HUB, getTourRoom, type RoomId, type TourRoom } from "@/data/tour";
import { tourLive } from "@/lib/tourLive";

/**
 * Hero camera: orbits around the towers following the mouse (smoothly lerped),
 * and dollies in as `progress` (0..1, driven by ScrollTrigger) increases.
 * On touch devices a horizontal drag orbits the towers (vertical swipes still scroll);
 * until the visitor drags, the camera drifts gently. Reduced motion: no automatic motion.
 */
export function HeroCameraRig({
  mouse,
  progress,
  touch,
  reducedMotion,
}: {
  mouse: MutableRefObject<MouseState>;
  progress: MutableRefObject<number>;
  touch: boolean;
  reducedMotion: boolean;
}) {
  const { camera, size, gl } = useThree();
  const target = useRef(new THREE.Vector3(0, 8, 0));
  const current = useRef({ az: 0, el: 0, p: 0 });
  const drag = useRef({ az: 0, used: false, startX: 0, startAz: 0, active: false });

  // Touch: horizontal drag to orbit. `touch-action: pan-y` keeps vertical page scrolling native.
  useEffect(() => {
    if (!touch) return;
    const el = gl.domElement;
    el.style.touchAction = "pan-y";
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.startX = e.clientX;
      drag.current.startAz = drag.current.az;
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = (e.clientX - drag.current.startX) / el.clientWidth;
      drag.current.az = THREE.MathUtils.clamp(drag.current.startAz - dx * 1.6, -0.9, 0.9);
      drag.current.used = true;
    };
    const up = () => (drag.current.active = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl, touch]);

  useFrame((state, delta) => {
    const c = current.current;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.0015, delta); // frame-rate independent smoothing

    let wantAz = 0;
    let wantEl = 0;
    if (touch) wantAz = drag.current.used ? drag.current.az : reducedMotion ? 0 : Math.sin(t * 0.12) * 0.35;
    else if (!reducedMotion) {
      wantAz = mouse.current.nx * 0.42;
      wantEl = -mouse.current.ny * 0.12;
    }
    c.az += (wantAz - c.az) * k;
    c.el += (wantEl - c.el) * k;
    c.p += ((reducedMotion ? 0 : progress.current) - c.p) * k;

    // Narrow screens need the camera further back to fit both towers.
    const aspectBoost = size.width < 768 ? 1.55 : 1;
    const radius = THREE.MathUtils.lerp(44, 17, c.p) * aspectBoost;
    const baseEl = THREE.MathUtils.lerp(0.13, 0.22, c.p);
    const az = c.az + c.p * 0.35;
    const el = baseEl + c.el;

    // On wide screens aim left of the towers so they sit to the right of the headline.
    const offsetX = size.width >= 1024 ? THREE.MathUtils.lerp(-7.5, 0, c.p) : 0;
    target.current.set(offsetX, THREE.MathUtils.lerp(10.5, 13.5, c.p), -0.8);
    camera.position.set(
      target.current.x + Math.sin(az) * Math.cos(el) * radius,
      target.current.y + Math.sin(el) * radius - 2,
      target.current.z + Math.cos(az) * Math.cos(el) * radius,
    );
    camera.lookAt(target.current);
  });

  return null;
}

/* ------------------------------------------------------------------------ */
/* Virtual tour camera                                                       */
/* ------------------------------------------------------------------------ */

const keyOf = (p: [number, number]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;

/** Builds a route between two rooms that passes through doorways instead of walls. */
export function buildRoute(from: TourRoom, to: TourRoom): [number, number][] {
  const la: [number, number][] = [from.spot, ...from.exits];
  const lb: [number, number][] = [to.spot, ...to.exits];
  const lbKeys = lb.map(keyOf);
  for (let i = 0; i < la.length; i++) {
    const j = lbKeys.indexOf(keyOf(la[i]));
    if (j !== -1) return [...la.slice(0, i + 1), ...lb.slice(0, j).reverse()];
  }
  const viaHub = from.exits.length > 0 || to.exits.length > 0;
  return [...la, ...(viaHub ? [HUB] : []), ...lb.slice().reverse()];
}

function shortestAngle(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}

/**
 * First-person camera for the apartment:
 *  - mouse move  → gentle look-around (limited angles)
 *  - drag        → rotate freely (pitch clamped)
 *  - wheel       → slight zoom (FOV)
 *  - arrow keys  → rotate (accessibility)
 *  - room change → smooth GSAP glide along a door-aware spline
 */
export function TourCameraRig({
  room,
  mouse,
  touch,
  reducedMotion,
  onMoving,
}: {
  room: RoomId;
  mouse: MutableRefObject<MouseState>;
  touch: boolean;
  reducedMotion: boolean;
  onMoving: (moving: boolean) => void;
}) {
  const { camera, gl } = useThree();
  const start = getTourRoom(room);
  const pose = useRef({ x: start.spot[0], z: start.spot[1], yaw: start.yaw });
  const look = useRef({ dragYaw: 0, dragPitch: 0, mouseYaw: 0, mousePitch: 0, fov: 62, targetFov: 62 });
  const prevRoom = useRef<RoomId>(room);
  const dragging = useRef<{ x: number; y: number } | null>(null);

  // Pointer, wheel & keyboard controls
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      dragging.current = { x: e.clientX, y: e.clientY };
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragging.current.x;
      const dy = e.clientY - dragging.current.y;
      dragging.current = { x: e.clientX, y: e.clientY };
      const speed = touch ? 0.006 : 0.0035;
      look.current.dragYaw += dx * speed;
      look.current.dragPitch = THREE.MathUtils.clamp(look.current.dragPitch + dy * speed * 0.7, -0.55, 0.55);
    };
    const up = () => (dragging.current = null);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      look.current.targetFov = THREE.MathUtils.clamp(look.current.targetFov + e.deltaY * 0.02, 40, 72);
    };
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") look.current.dragYaw += 0.15;
      if (e.key === "ArrowRight") look.current.dragYaw -= 0.15;
      if (e.key === "ArrowUp") look.current.dragPitch = Math.min(0.55, look.current.dragPitch + 0.08);
      if (e.key === "ArrowDown") look.current.dragPitch = Math.max(-0.55, look.current.dragPitch - 0.08);
      if (e.key === "+" || e.key === "=") look.current.targetFov = Math.max(40, look.current.targetFov - 4);
      if (e.key === "-") look.current.targetFov = Math.min(72, look.current.targetFov + 4);
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, [gl, touch]);

  // Glide to a new room
  useEffect(() => {
    if (prevRoom.current === room) return;
    const from = getTourRoom(prevRoom.current);
    const to = getTourRoom(room);
    prevRoom.current = room;

    // Start the route from wherever the camera currently is.
    const route = buildRoute(from, to);
    route[0] = [pose.current.x, pose.current.z];
    const pts = route
      .filter((p, i) => i === 0 || Math.hypot(p[0] - route[i - 1][0], p[1] - route[i - 1][1]) > 0.05)
      .map((p) => new THREE.Vector3(p[0], EYE_HEIGHT, p[1]));
    const curve = pts.length > 1 ? new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.3) : null;

    const startYaw = pose.current.yaw + look.current.dragYaw;
    look.current.dragYaw = 0;
    pose.current.yaw = startYaw;
    const endYaw = shortestAngle(startYaw, to.yaw);
    const startPitch = look.current.dragPitch;

    if (!curve || reducedMotion) {
      pose.current.x = to.spot[0];
      pose.current.z = to.spot[1];
      pose.current.yaw = endYaw;
      look.current.dragPitch = 0;
      onMoving(false);
      return;
    }

    const length = curve.getLength();
    const prog = { t: 0 };
    onMoving(true);
    const tween = gsap.to(prog, {
      t: 1,
      duration: THREE.MathUtils.clamp(length / 3.2, 1.2, 4.2),
      ease: "power2.inOut",
      onUpdate: () => {
        const p = curve.getPointAt(prog.t);
        pose.current.x = p.x;
        pose.current.z = p.z;
        const e = prog.t * prog.t * (3 - 2 * prog.t);
        pose.current.yaw = startYaw + (endYaw - startYaw) * e;
        look.current.dragPitch = startPitch * (1 - e);
      },
      onComplete: () => onMoving(false),
    });
    return () => {
      tween.kill();
    };
  }, [room, reducedMotion, onMoving]);

  useFrame((state, delta) => {
    const l = look.current;
    const k = 1 - Math.pow(0.002, delta);
    const allowMouse = !touch && !dragging.current && !reducedMotion;
    const wantYaw = allowMouse ? -mouse.current.nx * 0.32 : 0;
    const wantPitch = allowMouse ? -mouse.current.ny * 0.16 : 0;
    l.mouseYaw += (wantYaw - l.mouseYaw) * k * 0.6;
    l.mousePitch += (wantPitch - l.mousePitch) * k * 0.6;
    l.fov += (l.targetFov - l.fov) * k;

    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - l.fov) > 0.01) {
      cam.fov = l.fov;
      cam.updateProjectionMatrix();
    }
    // Subtle breathing so the view never feels static
    const bob = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.006;
    cam.position.set(pose.current.x, EYE_HEIGHT + bob, pose.current.z);
    cam.rotation.order = "YXZ";
    const yaw = pose.current.yaw + l.dragYaw + l.mouseYaw;
    cam.rotation.y = yaw;
    cam.rotation.x = THREE.MathUtils.clamp(l.dragPitch + l.mousePitch, -0.6, 0.6);
    cam.rotation.z = 0;

    tourLive.x = pose.current.x;
    tourLive.z = pose.current.z;
    tourLive.yaw = yaw;
  });

  return null;
}

/** Utility: keeps the R3F frameloop running only while `active` (e.g. canvas in view). */
export function FrameloopController({ active }: { active: boolean }) {
  const { setFrameloop, invalidate } = useThree();
  useEffect(() => {
    setFrameloop(active ? "always" : "never");
    if (active) invalidate();
  }, [active, setFrameloop, invalidate]);
  return null;
}
