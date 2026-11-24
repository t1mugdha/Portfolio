/**
 * Loads the baked room once and returns its objects by name.
 * Uses the plain GLTFLoader: no Draco/Meshopt decoders to download.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const cache = new Map<string, Promise<Record<string, THREE.Object3D>>>();

async function load(url: string): Promise<Record<string, THREE.Object3D>> {
  const gltf = await new GLTFLoader().loadAsync(url);
  const nodes: Record<string, THREE.Object3D> = {};
  gltf.scene.traverse((o) => {
    if (o.name) nodes[o.name] = o;
  });
  return nodes;
}

export function roomPromise(url: string) {
  let p = cache.get(url);
  if (!p) {
    p = load(url);
    cache.set(url, p);
  }
  return p;
}
