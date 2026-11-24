import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '@/lib/store';

/**
 * The night city outside the window.
 *
 * It only exists where you can see it through the window: an invisible
 * "portal" plane in the window opening writes 1 into the stencil buffer,
 * and everything outside draws only where the stencil is 1. So from the
 * overview camera nothing pokes out above the walls.
 */
const WINDOW = { x0: -0.3, x1: 1.9, y0: 1.15, y1: 2.45, z: -2.55 };

const stencilTest = {
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.EqualStencilFunc,
  stencilFail: THREE.KeepStencilOp,
  stencilZFail: THREE.KeepStencilOp,
  stencilZPass: THREE.KeepStencilOp,
};

const skyVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const skyFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  void main(){
    vec3 top = vec3(0.035,0.04,0.11), mid = vec3(0.09,0.06,0.2), low = vec3(0.32,0.16,0.42);
    float y = vUv.y;
    vec3 col = mix(low, mid, smoothstep(0.0, 0.45, y));
    col = mix(col, top, smoothstep(0.45, 1.0, y));
    // stars
    vec2 g = floor(vUv * vec2(160.0, 80.0));
    float h = hash(g);
    float tw = 0.6 + 0.4 * sin(uTime * (1.5 + h * 3.0) + h * 40.0);
    col += vec3(0.85,0.8,1.0) * step(0.985, h) * tw * smoothstep(0.25, 0.6, y);
    // moon + halo
    vec2 mp = vec2(0.66, 0.72);
    vec2 d = (vUv - mp) * vec2(2.0, 1.0);
    float r = length(d);
    col += vec3(1.0,0.93,0.82) * smoothstep(0.052, 0.046, r) * 1.6;
    col += vec3(0.55,0.45,0.9) * exp(-r * 9.0) * 0.6;
    // a shooting star every ~11 s
    float cyc = mod(uTime, 11.0);
    if (cyc < 0.9) {
      vec2 a = vec2(0.15 + cyc * 0.5, 0.92 - cyc * 0.22);
      vec2 dir = normalize(vec2(0.5, -0.22));
      vec2 rel = vUv - a;
      float along = dot(rel, -dir);
      float off = abs(dot(rel, vec2(-dir.y, dir.x)));
      col += vec3(1.0) * smoothstep(0.003, 0.0, off) * smoothstep(0.12, 0.0, along) * step(0.0, along) * (1.0 - cyc / 0.9);
    }
    gl_FragColor = vec4(col * 1.25, 1.0);
  }`;

const bldVert = /* glsl */ `
  varying vec3 vW; varying vec3 vN;
  void main(){
    vec4 w = modelMatrix * instanceMatrix * vec4(position,1.0);
    vW = w.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const bldFrag = /* glsl */ `
  uniform float uTime;
  varying vec3 vW; varying vec3 vN;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1))) * 15731.743); }
  void main(){
    vec3 base = vec3(0.05,0.05,0.1);
    // windows on the facades facing the room (+Z) and the sides
    vec2 f = abs(vN.z) > 0.5 ? vW.xy : vW.zy;
    vec2 cell = f * vec2(5.0, 4.0);
    vec2 id = floor(cell);
    vec2 inCell = fract(cell);
    float win = step(0.25, inCell.x) * step(inCell.x, 0.75) * step(0.3, inCell.y) * step(inCell.y, 0.8);
    float r = hash(id + floor(vW.z));
    float on = step(0.72, r);
    // a few windows switch on and off slowly
    on *= step(0.15, fract(r * 13.0 + uTime * 0.02 * step(0.9, fract(r * 7.0))));
    vec3 warm = mix(vec3(1.0,0.72,0.42), vec3(0.72,0.6,1.0), step(0.86, fract(r * 31.0)));
    vec3 col = base + warm * win * on * 1.6;
    if (vN.y > 0.5) col = vec3(0.07,0.06,0.14);
    gl_FragColor = vec4(col, 1.0);
  }`;

export function Outside() {
  const reduced = useApp((s) => s.reducedMotion);
  const sky = useRef<THREE.ShaderMaterial>(null!);
  const bld = useRef<THREE.ShaderMaterial>(null!);
  const beaconMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.15, 0.2), toneMapped: false, ...stencilTest }), []);

  const { inst, beaconPos } = useMemo(() => {
    // deterministic skyline
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const boxes: THREE.Matrix4[] = [];
    const tops: THREE.Vector3[] = [];
    for (let row = 0; row < 3; row++) {
      let x = -9;
      const z = -6.5 - row * 3.2;
      while (x < 11) {
        const w = 0.9 + rnd() * 1.6;
        const top = -1.2 + rnd() * (2.6 + row * 1.2);
        const h = top + 14;
        const m = new THREE.Matrix4().compose(
          new THREE.Vector3(x + w / 2, top - h / 2, z - rnd() * 1.2),
          new THREE.Quaternion(),
          new THREE.Vector3(w, h, 1.2 + rnd()),
        );
        boxes.push(m);
        if (top > 1.6 && rnd() > 0.4) tops.push(new THREE.Vector3(x + w / 2, top + 0.05, z));
        x += w + 0.1 + rnd() * 0.5;
      }
    }
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const im = new THREE.InstancedMesh(geo, undefined, boxes.length);
    boxes.forEach((m, i) => im.setMatrixAt(i, m));
    return { inst: im, beaconPos: tops };
  }, []);

  useFrame(({ clock }) => {
    const t = reduced ? 3 : clock.elapsedTime;
    if (sky.current) sky.current.uniforms.uTime!.value = t;
    if (bld.current) bld.current.uniforms.uTime!.value = t;
    beaconMat.color.setRGB(Math.sin(t * 3) > 0.2 ? 3 : 0.4, 0.15, 0.2);
  });

  const skyUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const bldUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  return (
    <group>
      {/* portal: writes stencil only, draws nothing */}
      <mesh position={[(WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, WINDOW.z]} renderOrder={1}>
        <planeGeometry args={[WINDOW.x1 - WINDOW.x0 + 0.02, WINDOW.y1 - WINDOW.y0 + 0.02]} />
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={false}
          stencilWrite
          stencilRef={1}
          stencilFunc={THREE.AlwaysStencilFunc}
          stencilZPass={THREE.ReplaceStencilOp}
        />
      </mesh>
      <mesh position={[1, 2, -20]} renderOrder={2}>
        <planeGeometry args={[60, 30]} />
        <shaderMaterial ref={sky} vertexShader={skyVert} fragmentShader={skyFrag} uniforms={skyUniforms} toneMapped={false} {...stencilTest} />
      </mesh>
      <primitive object={inst} renderOrder={2}>
        <shaderMaterial ref={bld} attach="material" vertexShader={bldVert} fragmentShader={bldFrag} uniforms={bldUniforms} toneMapped={false} {...stencilTest} />
      </primitive>
      {beaconPos.map((p, i) => (
        <mesh key={i} position={p} renderOrder={2} material={beaconMat}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}
