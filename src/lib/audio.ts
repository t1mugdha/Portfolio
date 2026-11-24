/**
 * All sound is synthesised with the Web Audio API — no audio files, nothing to license.
 * Off until the visitor presses Start (browsers require a gesture anyway).
 */
import { store } from './store';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambientStarted = false;

function ensure(): AudioContext | null {
  if (!store.get().sound) return null;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function env(g: GainNode, t: number, a: number, peak: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function tone(freq: number, type: OscillatorType, dur: number, vol = 0.12, slideTo?: number, delay = 0) {
  const c = ensure();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  env(g, t, 0.005, vol, dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    // brown-ish noise: softer than white
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  return b;
}

export const sfx = {
  hover: () => tone(880, 'triangle', 0.06, 0.035),
  click: () => tone(520, 'square', 0.08, 0.05, 780),
  back: () => tone(600, 'square', 0.08, 0.05, 380),
  start: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 'square', 0.12, 0.06, undefined, i * 0.08));
  },
  coin: () => {
    tone(988, 'square', 0.07, 0.06);
    tone(1319, 'square', 0.25, 0.06, undefined, 0.07);
  },
  squeak: () => {
    tone(700, 'square', 0.09, 0.07, 1400);
    tone(1300, 'square', 0.12, 0.05, 600, 0.09);
  },
  whoosh: () => {
    const c = ensure();
    if (!c || !master) return;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.6);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + 0.45);
    const g = c.createGain();
    env(g, t, 0.08, 0.25, 0.45);
    src.connect(f).connect(g).connect(master);
    src.start(t);
  },
  hiss: () => {
    const c = ensure();
    if (!c || !master) return;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.5);
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 3000;
    const g = c.createGain();
    env(g, t, 0.01, 0.2, 0.35);
    src.connect(f).connect(g).connect(master);
    src.start(t);
    tone(220, 'sine', 0.3, 0.05, 160, 0.05);
  },
  rev: () => tone(80, 'sawtooth', 1.1, 0.06, 420),
  flap: () => tone(420, 'triangle', 0.07, 0.06, 620),
  hit: () => tone(200, 'square', 0.3, 0.08, 60),
};

/**
 * Generative lo-fi ambience: a slow 4-chord loop on soft detuned
 * oscillators through a low-pass, plus vinyl-ish crackle.
 */
export function startAmbient() {
  const c = ensure();
  if (!c || !master || ambientStarted) return;
  ambientStarted = true;
  const bus = c.createGain();
  bus.gain.value = 0.0;
  bus.gain.linearRampToValueAtTime(0.11, c.currentTime + 3);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  lp.Q.value = 0.6;
  bus.connect(lp).connect(master);

  // crackle
  const crackle = c.createBufferSource();
  const b = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.6 : (Math.random() * 2 - 1) * 0.01;
  crackle.buffer = b;
  crackle.loop = true;
  const cg = c.createGain();
  cg.gain.value = 0.25;
  crackle.connect(cg).connect(bus);
  crackle.start();

  // Fmaj7 – Em7 – Dm7 – Cmaj7, two bars each at a lazy tempo
  const chords = [
    [174.61, 220.0, 261.63, 329.63],
    [164.81, 196.0, 246.94, 293.66],
    [146.83, 174.61, 220.0, 261.63],
    [130.81, 164.81, 196.0, 246.94],
  ];
  const len = 4.2;
  let i = 0;
  const play = () => {
    if (!ctx || !store.get().sound) return;
    const t = ctx.currentTime + 0.05;
    for (const f of chords[i % chords.length]!) {
      for (const det of [-6, 6]) {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = f;
        o.detune.value = det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + 1.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.8);
        o.connect(g).connect(bus);
        o.start(t);
        o.stop(t + len + 1);
      }
    }
    i++;
  };
  play();
  window.setInterval(play, len * 1000);
}

/** Mute/unmute everything. */
export function applySound(on: boolean) {
  if (!ctx || !master) {
    if (on) startAmbient();
    return;
  }
  master.gain.setTargetAtTime(on ? 0.6 : 0, ctx.currentTime, 0.1);
  if (on) {
    void ctx.resume();
    startAmbient();
  }
}
