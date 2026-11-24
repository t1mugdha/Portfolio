/**
 * Canvas-drawn screens: the ultrawide (level select), the vertical monitor
 * (scrolling "code"), the arcade (attract mode) and the handheld.
 * Each redraws at ~12 fps into a CanvasTexture.
 */
import * as THREE from 'three';
import { projects } from '@/content/projects';
import { store } from '@/lib/store';

const PIXEL = '"Press Start 2P", monospace';

function make(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { canvas, ctx: canvas.getContext('2d')!, tex };
}

function scanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
}

export function createScreens() {
  const main = make(1024, 374);
  const side = make(256, 448);
  const arcade = make(320, 256);
  const hand = make(128, 80);
  const visible = projects.filter((p) => !p.hidden);
  let codeOffset = 0;
  const codeLines = Array.from({ length: 60 }, (_, i) => ({
    indent: [0, 1, 1, 2, 2, 1, 0][i % 7]!,
    parts: Array.from({ length: 1 + ((i * 7) % 4) }, (_, k) => ({ w: 14 + ((i * 13 + k * 29) % 60), c: ['#b9a5ff', '#7fe7d2', '#ff8fb1', '#ffd23f', '#a5a2b0'][(i + k) % 5]! })),
  }));

  function drawMain(t: number) {
    const { ctx } = main;
    const W = 1024, H = 374;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1b1446');
    g.addColorStop(1, '#0c0b24');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // starfield drift
    for (let i = 0; i < 60; i++) {
      const x = (i * 97 + t * (10 + (i % 5) * 8)) % W;
      const y = (i * 53) % H;
      ctx.fillStyle = i % 3 ? 'rgba(185,165,255,0.5)' : 'rgba(127,231,210,0.6)';
      ctx.fillRect(W - x, y, 3, 3);
    }
    ctx.textBaseline = 'top';
    ctx.font = `28px ${PIXEL}`;
    ctx.fillStyle = '#ffd23f';
    ctx.fillText('LEVEL SELECT', 48, 34);
    ctx.font = `14px ${PIXEL}`;
    ctx.fillStyle = '#a5a2b0';
    ctx.fillText(`${visible.length} WORLDS UNLOCKED`, 50, 76);
    const sel = store.get().project;
    const blink = Math.floor(t * 2.5) % 2 === 0;
    visible.slice(0, 4).forEach((p, i) => {
      const x = 48 + i * 236, y = 122;
      const on = sel === p.slug || (!sel && i === Math.floor(t / 1.6) % Math.min(visible.length, 4));
      ctx.fillStyle = on ? p.color : '#2a2550';
      ctx.fillRect(x, y, 210, 150);
      ctx.fillStyle = on ? '#14112e' : '#1a1638';
      ctx.fillRect(x + 12, y + 12, 186, 92);
      ctx.fillStyle = p.color;
      ctx.font = `40px ${PIXEL}`;
      ctx.fillText(String(i + 1).padStart(2, '0'), x + 62, y + 36);
      ctx.font = `12px ${PIXEL}`;
      ctx.fillStyle = on ? '#14112e' : '#e9e2f2';
      ctx.fillText((p.cartridge ?? p.title).slice(0, 15).toUpperCase(), x + 12, y + 118);
    });
    ctx.font = `16px ${PIXEL}`;
    ctx.fillStyle = blink ? '#7fe7d2' : 'rgba(127,231,210,0.25)';
    ctx.fillText(store.get().section === 'projects' ? '▶ CHOOSE A WORLD' : '▶ CLICK TO PLAY', 48, 306);
    scanlines(ctx, W, H);
    main.tex.needsUpdate = true;
  }

  function drawSide(t: number) {
    const { ctx } = side;
    ctx.fillStyle = '#0b1418';
    ctx.fillRect(0, 0, 256, 448);
    codeOffset = (t * 14) % (codeLines.length * 16);
    codeLines.forEach((l, i) => {
      const y = i * 16 - codeOffset;
      const yy = y < -16 ? y + codeLines.length * 16 : y;
      if (yy > 448) return;
      ctx.fillStyle = '#3a4a50';
      ctx.fillRect(8, yy + 5, 10, 5);
      let x = 28 + l.indent * 16;
      for (const p of l.parts) {
        ctx.fillStyle = p.c;
        ctx.fillRect(x, yy + 4, p.w, 7);
        x += p.w + 8;
      }
    });
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#7fe7d2';
      ctx.fillRect(30, 430, 8, 12);
    }
    side.tex.needsUpdate = true;
  }

  function drawArcade(t: number) {
    const { ctx } = arcade;
    ctx.fillStyle = '#061615';
    ctx.fillRect(0, 0, 320, 256);
    // scrolling "bug" pillars + bobbing duck: the attract mode for Duck Dash
    for (let i = 0; i < 4; i++) {
      const x = ((i * 110 - t * 60) % 440 + 440) % 440 - 60;
      const gap = 70 + ((i * 37) % 60);
      ctx.fillStyle = '#ff5d73';
      ctx.fillRect(x, 0, 26, gap);
      ctx.fillRect(x, gap + 80, 26, 256);
    }
    const dy = 110 + Math.sin(t * 3) * 26;
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(70, dy, 26, 20);
    ctx.fillRect(84, dy - 12, 16, 14);
    ctx.fillStyle = '#ff8a3d';
    ctx.fillRect(100, dy - 6, 8, 5);
    ctx.textBaseline = 'top';
    ctx.font = `22px ${PIXEL}`;
    ctx.fillStyle = '#3fe0c0';
    ctx.fillText('DUCK DASH', 62, 26);
    ctx.font = `11px ${PIXEL}`;
    ctx.fillStyle = Math.floor(t * 2) % 2 ? '#ffffff' : 'rgba(255,255,255,0.2)';
    ctx.fillText('INSERT COIN', 100, 214);
    scanlines(ctx, 320, 256);
    arcade.tex.needsUpdate = true;
  }

  function drawHand(t: number) {
    // A tiny side-scrolling platformer: dusk sky, hills, a hopping hero, coins.
    const { ctx } = hand;
    const W = 128,
      H = 80;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#2a1b5e');
    sky.addColorStop(1, '#ff7a8a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd9a0';
    ctx.fillRect(92, 12, 10, 10); // sun
    const scroll = (t * 18) % 64;
    ctx.fillStyle = '#5b3d8f';
    for (let i = -1; i < 4; i++) {
      const x = i * 64 - scroll * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 62);
      ctx.lineTo(x + 32, 36);
      ctx.lineTo(x + 64, 62);
      ctx.fill();
    }
    // ground tiles
    for (let x = -16; x < W + 16; x += 8) {
      const gx = x - (scroll % 8);
      ctx.fillStyle = '#3fbf6a';
      ctx.fillRect(gx, 62, 8, 3);
      ctx.fillStyle = (Math.floor((x + scroll) / 8) & 1) ? '#7a4a2c' : '#6a3f25';
      ctx.fillRect(gx, 65, 8, 15);
    }
    // coins
    ctx.fillStyle = '#ffd23f';
    for (let i = 0; i < 3; i++) {
      const cx = ((i * 48 + 90 - t * 18) % 144 + 144) % 144 - 8;
      ctx.fillRect(cx, 40 + Math.sin(t * 5 + i) * 2, 4, 5);
    }
    // hero: hops every 1.2 s
    const ph = (t % 1.2) / 1.2;
    const y = 50 - Math.max(0, Math.sin(ph * Math.PI)) * 16;
    ctx.fillStyle = '#ff5d73';
    ctx.fillRect(28, y, 9, 8); // body
    ctx.fillStyle = '#f6dcb4';
    ctx.fillRect(29, y - 5, 7, 5); // head
    ctx.fillStyle = '#16171f';
    ctx.fillRect(33, y - 4, 1, 2); // eye
    ctx.fillStyle = '#3a63d8';
    ctx.fillRect(28, y + 8, 3, 4);
    ctx.fillRect(34, y + 8, 3, 4);
    // score
    ctx.fillStyle = '#ffffff';
    ctx.font = `7px ${PIXEL}`;
    ctx.textBaseline = 'top';
    ctx.fillText(`x${String(Math.floor(t) % 100).padStart(2, '0')}`, 4, 4);
    hand.tex.needsUpdate = true;
  }

  let last = -1;
  return {
    textures: { Screen: main.tex, Screen2: side.tex, ArcadeScreen: arcade.tex, Peg_HandheldScreen: hand.tex } as Record<string, THREE.CanvasTexture>,
    update(t: number) {
      if (t - last < 1 / 12) return;
      last = t;
      drawMain(t);
      drawSide(t);
      drawArcade(t);
      drawHand(t);
    },
  };
}
