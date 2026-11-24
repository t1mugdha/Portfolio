import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, useProgress } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { store, useApp } from '@/lib/store';
import { isLowPower } from '@/lib/util';
import { Room } from './Room';
import { Outside } from './Outside';
import { CameraRig } from './CameraRig';

function ProgressBridge() {
  const { progress } = useProgress();
  useEffect(() => store.set({ progress: progress / 100 }), [progress]);
  return null;
}

export default function Experience() {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, isLowPower() ? 1.25 : 1.75));
  const [fx, setFx] = useState(() => !isLowPower());
  const section = useApp((s) => s.section);

  return (
    <Canvas
      className="room-canvas"
      dpr={dpr}
      gl={{ antialias: true, stencil: true, powerPreference: 'high-performance' }}
      camera={{ fov: 34, near: 0.05, far: 80, position: [12, 12, 12] }}
      flat
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
        gl.setClearColor('#07060f', 1);
      }}
      onPointerMissed={() => store.set({ hovered: null })}
      aria-label="An interactive 3D gaming room. Use the menu buttons to visit each section."
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setFx(false);
        }}
        flipflops={2}
      />
      <ProgressBridge />
      <Suspense fallback={null}>
        <Room />
        <Outside />
      </Suspense>
      <CameraRig />
      {fx && (
        <EffectComposer multisampling={4} stencilBuffer>
          <Bloom intensity={0.85} luminanceThreshold={1.0} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
          <Vignette offset={0.25} darkness={section ? 0.55 : 0.4} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
