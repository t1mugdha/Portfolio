import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type CameraControlsImpl from 'camera-controls';
import { useApp } from '@/lib/store';
import { OVERVIEW, SECTIONS } from '@/lib/sections';

/**
 * Overview: drag to look around, right-drag to pan, scroll/pinch to zoom in
 * towards whatever is under the cursor (down to a close-up of a shelf).
 * Section: fly to the object; the camera is offset sideways (desktop) or
 * upward (phones) so the object stays visible beside/above the panel.
 */
export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const section = useApp((s) => s.section);
  const phase = useApp((s) => s.phase);
  const reduced = useApp((s) => s.reducedMotion);
  const { size, camera } = useThree();
  const narrow = size.width / size.height < 0.9;
  const first = useRef(true);

  // Phones get a wider lens so the whole room fits the tall screen.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = narrow ? 50 : 34;
    cam.updateProjectionMatrix();
  }, [narrow, camera]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const smooth = !reduced;
    c.smoothTime = reduced ? 0 : 0.55;
    if (section) {
      const s = SECTIONS[section];
      c.enabled = false;
      // Phones: step back so the object fits above the bottom sheet.
      // Phones: keep the camera where it is but aim lower, so the object
      // sits in the top half of the screen, above the bottom sheet.
      const tgt: [number, number, number] = narrow ? [s.target[0], s.target[1] - 0.55, s.target[2]] : s.target;
      void c.setLookAt(...s.camera, ...tgt, smooth);
      // keep the object clear of the panel
      if (narrow) void c.setFocalOffset(0, 0, 0, smooth);
      else void c.setFocalOffset(size.width > 1100 ? 0.42 : 0.3, 0, 0, smooth);
      return;
    }
    const o = narrow ? OVERVIEW.narrow : OVERVIEW.wide;
    c.enabled = phase === 'room';
    void c.setFocalOffset(0, 0, 0, smooth);
    if (first.current && phase === 'room' && !reduced) {
      // intro: start high and far, then settle in
      first.current = false;
      void c.setLookAt(o.camera[0] * 1.9, o.camera[1] * 2.6, o.camera[2] * 1.9, ...o.target, false);
      c.smoothTime = 1.4;
    }
    void c.setLookAt(...o.camera, ...o.target, smooth);
  }, [section, phase, narrow, reduced, size.width]);

  // Panning (right-drag / two-finger drag) is allowed, but the point the
  // camera orbits around can't leave the room, so you can't lose it.
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-2.7, 0.2, -2.7), new THREE.Vector3(2.7, 2.4, 2.7)));
    c.boundaryFriction = 0.2;
  }, []);

  // Initial azimuth ≈ 0.75 rad; allow ±0.5 around it.
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minAzimuthAngle={0.2}
      maxAzimuthAngle={1.3}
      minPolarAngle={0.55}
      maxPolarAngle={1.32}
      minDistance={narrow ? 3.2 : 1.8}
      maxDistance={narrow ? 16 : 11}
      dollySpeed={0.6}
      dollyToCursor
      truckSpeed={1.2}
      draggingSmoothTime={0.12}
    />
  );
}
