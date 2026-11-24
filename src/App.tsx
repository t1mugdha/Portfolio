import { lazy, Suspense, useEffect } from 'react';
import { store, useApp } from '@/lib/store';
import { hasWebGL } from '@/lib/util';
import { listenHash } from '@/ui/navigation';
import { Boot } from '@/ui/Boot';
import { Hud } from '@/ui/Hud';
import { Panel } from '@/ui/Panel';
import { FlatSite } from '@/ui/FlatSite';
import { Tooltip, Toast } from '@/ui/Overlays';
import { MagicCursor } from '@/ui/MagicCursor';

// three.js and the room load in their own chunk while the boot screen shows.
const Experience = lazy(() => import('@/scene/Experience'));

export function App() {
  const phase = useApp((s) => s.phase);
  const reduced = useApp((s) => s.reducedMotion);

  useEffect(() => {
    const wantsFlat = new URLSearchParams(location.search).has('flat') || location.hash === '#flat';
    if (wantsFlat || !hasWebGL()) store.set({ phase: 'flat' });
    return listenHash();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);

  if (phase === 'flat')
    return (
      <>
        <FlatSite />
        <MagicCursor />
      </>
    );

  return (
    <>
      <div className="stage" aria-hidden={phase === 'boot'}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </div>
      {phase === 'boot' && <Boot />}
      <MagicCursor />
      {phase === 'room' && (
        <>
          <Hud />
          <Panel />
          <Tooltip />
          <Toast />
        </>
      )}
    </>
  );
}
