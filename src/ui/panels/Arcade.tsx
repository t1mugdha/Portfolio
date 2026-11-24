import { useEffect, useRef, useState } from 'react';
import { interests } from '@/content/profile';
import { sfx } from '@/lib/audio';
import { writePref } from '@/lib/store';

/**
 * DUCK DASH — a tiny one-button game on the arcade cabinet.
 * Flap through the gaps in the walls of bugs. Space, click or tap.
 */
const W = 320, H = 420, GAP = 118, PIPE_W = 44, SPEED = 2.1;

function readBest() {
  try {
    return Number(localStorage.getItem('mugdha:duckdash')) || 0;
  } catch {
    return 0;
  }
}

function DuckDash() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'ready' | 'play' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const game = useRef({ y: H / 2, v: 0, pipes: [] as { x: number; gap: number; passed: boolean }[], t: 0, score: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;

  const flap = () => {
    if (stateRef.current === 'over') {
      game.current = { y: H / 2, v: 0, pipes: [], t: 0, score: 0 };
      setScore(0);
      setState('ready');
      return;
    }
    if (stateRef.current === 'ready') setState('play');
    game.current.v = -5.6;
    sfx.flap();
  };

  useEffect(() => {
    const ctx = canvas.current!.getContext('2d')!;
    let raf = 0;
    const draw = () => {
      const g = game.current;
      const s = stateRef.current;
      if (s === 'play') {
        g.t++;
        g.v += 0.32;
        g.y += g.v;
        if (g.t % 92 === 1) g.pipes.push({ x: W + 10, gap: 70 + Math.random() * (H - GAP - 140), passed: false });
        for (const p of g.pipes) {
          p.x -= SPEED;
          if (!p.passed && p.x + PIPE_W < 70) {
            p.passed = true;
            g.score++;
            setScore(g.score);
            sfx.coin();
          }
        }
        g.pipes = g.pipes.filter((p) => p.x > -PIPE_W);
        const hit =
          g.y < 0 || g.y > H - 22 ||
          g.pipes.some((p) => p.x < 96 && p.x + PIPE_W > 66 && (g.y - 12 < p.gap || g.y + 12 > p.gap + GAP));
        if (hit) {
          sfx.hit();
          setState('over');
          const b = Math.max(readBest(), g.score);
          setBest(b);
          writePref('duckdash', b);
          try {
            localStorage.setItem('mugdha:duckdash', String(b));
          } catch {
            /* ignore */
          }
        }
      } else if (s === 'ready') {
        g.y = H / 2 + Math.sin(performance.now() / 300) * 8;
      }

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0d1d2a');
      bg.addColorStop(1, '#13102e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = 'rgba(185,165,255,0.35)';
        ctx.fillRect(((i * 73 - g.t * 0.4) % W + W) % W, (i * 41) % (H - 60), 2, 2);
      }
      // bug walls
      for (const p of g.pipes) {
        for (const [y0, y1] of [[0, p.gap], [p.gap + GAP, H]] as const) {
          ctx.fillStyle = '#ff5d73';
          ctx.fillRect(p.x, y0, PIPE_W, y1 - y0);
          ctx.fillStyle = '#c93a52';
          for (let y = y0 + 8; y < y1 - 8; y += 26) {
            // little bug glyphs
            ctx.fillRect(p.x + 14, y, 16, 10);
            ctx.fillRect(p.x + 10, y + 2, 4, 2);
            ctx.fillRect(p.x + 30, y + 2, 4, 2);
            ctx.fillRect(p.x + 10, y + 7, 4, 2);
            ctx.fillRect(p.x + 30, y + 7, 4, 2);
          }
        }
      }
      // duck
      const dy = g.y;
      ctx.save();
      ctx.translate(80, dy);
      ctx.rotate(Math.max(-0.5, Math.min(0.9, g.v / 10)));
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(-14, -8, 28, 18);
      ctx.fillRect(2, -18, 16, 14);
      ctx.fillStyle = '#ff8a3d';
      ctx.fillRect(18, -12, 8, 5);
      ctx.fillStyle = '#121018';
      ctx.fillRect(11, -14, 3, 3);
      ctx.fillStyle = '#f0b92c';
      ctx.fillRect(-10, -2, 12, 6);
      ctx.restore();
      // ground
      ctx.fillStyle = '#3fc7ad';
      ctx.fillRect(0, H - 8, W, 8);
      // HUD
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(g.score), W / 2, 44);
      ctx.font = '10px "Press Start 2P", monospace';
      if (s === 'ready') ctx.fillText('CLICK / SPACE TO FLAP', W / 2, H / 2 + 70);
      if (s === 'over') {
        ctx.fillStyle = 'rgba(7,6,15,0.7)';
        ctx.fillRect(30, H / 2 - 60, W - 60, 120);
        ctx.fillStyle = '#ff8fb1';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('THE BUGS WON (THIS TIME)', W / 2, H / 2 + 10);
        ctx.fillText('FLAP TO RETRY', W / 2, H / 2 + 34);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="arcade">
      <canvas
        ref={canvas}
        width={W}
        height={H}
        className="arcade-canvas"
        tabIndex={0}
        role="img"
        aria-label={`Duck Dash mini-game. Press Space or click to flap. Score ${score}, best ${best}.`}
        onPointerDown={(e) => {
          e.preventDefault();
          flap();
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
            e.preventDefault();
            flap();
          }
        }}
      />
      <p className="arcade-score">
        SCORE {String(score).padStart(3, '0')} · BEST {String(best).padStart(3, '0')}
      </p>
    </div>
  );
}

export function ArcadePanel() {
  return (
    <>
      <p className="lead">Off the clock. The cabinet runs one game, and yes, the duck made it.</p>
      <DuckDash />
      <h3 className="sub">Beyond the screen</h3>
      <ul className="interests">
        {interests.map((i) => (
          <li key={i.id}>
            <h4>{i.title}</h4>
            <p>{i.note}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
