/**
 * Mutable, non-React state written by the 3D camera every frame and read by DOM
 * overlays (mini-map) in their own rAF loop — avoids re-rendering React at 60 fps.
 */
export const tourLive = {
  x: 0,
  z: 0,
  /** Total view yaw in radians (0 = north). */
  yaw: 0,
};
