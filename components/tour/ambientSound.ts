/**
 * Generative ambient soundscape built with the Web Audio API — no audio files.
 * A soft filtered "air" noise bed plus a slow, warm pad chord.
 */
export interface Ambient {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

export function createAmbient(): Ambient | null {
  if (typeof window === "undefined") return null;
  const AC: typeof AudioContext | undefined = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Brown-noise bed (distant city / air conditioning hush)
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 520;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.18;
  noise.connect(lp).connect(noiseGain).connect(master);

  // Warm pad: A major add9, gently breathing
  const padGain = ctx.createGain();
  padGain.gain.value = 0.05;
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  padGain.connect(padFilter).connect(master);
  const freqs = [110, 164.81, 220, 277.18, 329.63, 493.88];
  const oscs = freqs.map((f, i) => {
    const o = ctx.createOscillator();
    o.type = i % 2 ? "triangle" : "sine";
    o.frequency.value = f;
    o.detune.value = (Math.random() - 0.5) * 8;
    const g = ctx.createGain();
    g.gain.value = 0.18 / (i + 1);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05 + Math.random() * 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = g.gain.value * 0.8;
    lfo.connect(lfoGain).connect(g.gain);
    o.connect(g).connect(padGain);
    o.start();
    lfo.start();
    return [o, lfo];
  });
  noise.start();

  return {
    start() {
      void ctx.resume();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.55, now + 2.5);
    },
    stop() {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 1.2);
    },
    dispose() {
      oscs.flat().forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        noise.stop();
      } catch {
        /* already stopped */
      }
      void ctx.close();
    },
  };
}
