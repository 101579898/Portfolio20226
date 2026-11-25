"use client";

// The shooting star, in real 3D (React Three Fiber). One faceted chrome star
// with a glowing core pulls a prism-coloured trail along a path: it flies in
// when the page opens, swings close to the camera as you scroll, then dives
// until it fades. Glass shards and dust drift past on the way.
// It reads its progress from lib/space.js and sleeps when off screen.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import WarmUp from "./WarmUp";
import { space, smoothstep } from "@/lib/space";

const BLUSH = new THREE.Color("#dcb1c2");
const VIOLET = new THREE.Color("#7c679e");
const BLUE = new THREE.Color("#35369c");
const PALE = new THREE.Color("#c8c793");

// The star's path. t < 0 is the fly-in, 0 is the hero, 1 is arrival.
// The same formula is repeated in the trail's vertex shader below.
const view = { x: 1 };
function starPath(t, out = new THREE.Vector3()) {
  const u = Math.max(t, -1);
  const a = 2.55 - u * 4.1;
  const r = 4.1 * Math.pow(Math.max(1 - u, 0), 0.85);
  const s = Math.sin(Math.PI * Math.min(Math.max(u, 0), 1));
  return out.set(Math.cos(a) * r * 0.95 * view.x, Math.sin(a) * r * 0.46 + (0.1 + (1 - view.x) * 2.1) * (1 - u), -3.5 + 5.6 * s * s - 11 * Math.max(u, 0) ** 4 + Math.min(u, 0) * 6);
}
const PATH_GLSL = `
uniform float uX;
vec3 starPath(float t){ float u=max(t,-1.); float a=2.55-u*4.1; float r=4.1*pow(max(1.-u,0.),.85); float s=sin(3.14159*clamp(u,0.,1.)); float m=max(u,0.);
 return vec3(cos(a)*r*.95*uX, sin(a)*r*.46+(.1+(1.-uX)*2.1)*(1.-u), -3.5+5.6*s*s-11.*m*m*m*m+min(u,0.)*6.); }`;

// Where the star is right now: fly-in first, then scroll.
const starT = () => (space.p > 0.001 ? space.p : -0.62 * (1 - space.intro));
const fade = () => smoothstep(0, 0.15, space.intro) * (1 - smoothstep(0.7, 0.97, space.p));

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.12, "rgba(240,228,255,.85)");
    r.addColorStop(0.3, "rgba(170,150,230,.34)");
    r.addColorStop(0.6, "rgba(90,86,190,.1)");
    r.addColorStop(1, "rgba(53,54,156,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
}
function useFlareTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 64;
    const g = c.getContext("2d");
    for (let i = 0; i < 64; i++) {
      const d = Math.abs(i - 32) / 32;
      const l = g.createLinearGradient(0, 0, 512, 0);
      const a = Math.pow(1 - d, 9);
      l.addColorStop(0, "rgba(220,177,194,0)");
      l.addColorStop(0.35, `rgba(200,180,255,${a * 0.25})`);
      l.addColorStop(0.5, `rgba(255,255,255,${a})`);
      l.addColorStop(0.65, `rgba(200,180,255,${a * 0.25})`);
      l.addColorStop(1, "rgba(220,177,194,0)");
      g.fillStyle = l;
      g.fillRect(0, i, 512, 1);
    }
    return new THREE.CanvasTexture(c);
  }, []);
}

// Soft studio lights (in the palette) for the chrome and glass to reflect.
function Reflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const env = new THREE.Scene();
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(20, 24, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: "varying vec3 v; void main(){ v=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
        fragmentShader: "varying vec3 v; void main(){ float t=v.y*.5+.5; vec3 c=mix(vec3(.05,.045,.2),vec3(.5,.4,.68),smoothstep(.1,.95,t)); c=mix(c,vec3(1.,.76,.84)*1.2,smoothstep(.1,.9,-v.x*.7+v.y*.4)); gl_FragColor=vec4(c,1.); }",
      })
    );
    env.add(sky);
    const panel = (color, k, x, y, z, w, h) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel("#ffffff", 9, -6, 5, 5, 6, 2.2);
    panel("#ffffff", 5, 1.5, 1, 9, 1.4, 6);
    panel("#dcb1c2", 5, -6, -2, 5, 3, 6);
    panel("#7c679e", 6, 6, 2, 4, 3, 7);
    panel("#35369c", 6, 3, -5, -2, 6, 2);
    panel("#c8c793", 1.5, 0, 5, -4, 2, 1);
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.02);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
      env.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
    };
  }, [gl, scene]);
  return null;
}

// A four-point star as a faceted solid: long thin points, a ridge down each one.
function starGeometry() {
  const tips = [];
  const N = 8;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 ? 0.17 : i % 4 === 0 ? 1.25 : 0.95;
    tips.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  const front = new THREE.Vector3(0, 0, 0.24);
  const back = new THREE.Vector3(0, 0, -0.24);
  const v = [];
  for (let i = 0; i < N; i++) {
    const a = tips[i];
    const b = tips[(i + 1) % N];
    v.push(...front.toArray(), ...a.toArray(), ...b.toArray(), ...back.toArray(), ...b.toArray(), ...a.toArray());
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function Star() {
  const group = useRef(null);
  const solid = useRef(null);
  const halo = useRef(null);
  const flareA = useRef(null);
  const flareB = useRef(null);
  const geo = useMemo(starGeometry, []);
  const glow = useGlowTexture();
  const flare = useFlareTexture();
  useEffect(() => () => { geo.dispose(); glow.dispose(); flare.dispose(); }, [geo, glow, flare]);

  const onScreen = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const t = starT();
    const a = fade();
    starPath(t, group.current.position);
    // Tell Kiwi where the star is, so she can tag along.
    onScreen.copy(group.current.position).project(state.camera);
    space.sx = ((onScreen.x + 1) / 2) * state.size.width;
    space.sy = ((1 - onScreen.y) / 2) * state.size.height;
    space.sa = a;
    const idle = 1 - smoothstep(0, 0.1, space.p);
    const time = state.clock.elapsedTime;
    group.current.position.y += Math.sin(time * 1.1) * 0.07 * idle;
    group.current.visible = a > 0.01;
    solid.current.rotation.y = Math.sin(time * 0.6) * 0.5 + t * 5;
    solid.current.rotation.z = Math.sin(time * 0.4) * 0.08 + t * 1.2;
    const s = (0.44 + 0.16 * view.x) * a;
    solid.current.scale.setScalar(s);
    const pulse = 1 + Math.sin(time * 2.2) * 0.05;
    halo.current.scale.setScalar(2.9 * pulse * a);
    halo.current.material.opacity = 0.5 * a;
    flareA.current.scale.set(5.4 * pulse * a, 0.34 * a, 1);
    flareB.current.scale.set(0.3 * a, 4 * pulse * a, 1);
    flareA.current.material.opacity = flareB.current.material.opacity = 0.85 * a;
  });

  return (
    <group ref={group}>
      <mesh ref={solid} geometry={geo}>
        <meshPhysicalMaterial color="#f3ecf8" metalness={1} roughness={0.2} emissive="#6f5f9e" emissiveIntensity={0.12} iridescence={0.8} iridescenceIOR={1.7} iridescenceThicknessMinimum={180} iridescenceThicknessMaximum={520} envMapIntensity={0.62} flatShading />
      </mesh>
      <sprite ref={halo} renderOrder={2}>
        <spriteMaterial map={glow} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} transparent />
      </sprite>
      <mesh ref={flareA} renderOrder={3}>
        <planeGeometry />
        <meshBasicMaterial map={flare} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} transparent />
      </mesh>
      <mesh ref={flareB} renderOrder={3}>
        <FlareUpright />
        <meshBasicMaterial map={flare} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} transparent />
      </mesh>
    </group>
  );
}
// The same flare picture turned upright (swap the UVs rather than rotate the mesh).
function FlareUpright() {
  const ref = useRef(null);
  useEffect(() => {
    const uv = ref.current.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), uv.getX(i));
    uv.needsUpdate = true;
  }, []);
  return <planeGeometry ref={ref} />;
}

// The trail: a fan of soft ribbons that follow the star's path and slowly twist round it.
function Trail() {
  const mesh = useRef(null);
  const { geo, mat } = useMemo(() => {
    const STRANDS = 22;
    const SEG = 90;
    const n = STRANDS * (SEG + 1) * 2;
    const along = new Float32Array(n);
    const side = new Float32Array(n);
    const seed = new Float32Array(n * 2);
    const tint = new Float32Array(n * 3);
    const index = [];
    const palette = [new THREE.Color("#ffffff"), BLUSH, VIOLET.clone().multiplyScalar(1.35), BLUE.clone().multiplyScalar(1.7), BLUE.clone().multiplyScalar(1.4), VIOLET, BLUSH, PALE.clone().multiplyScalar(0.7)];
    let k = 0;
    for (let s = 0; s < STRANDS; s++) {
      const c = palette[s % palette.length];
      const a = Math.random();
      const b = Math.random();
      for (let i = 0; i <= SEG; i++) {
        for (let e = -1; e <= 1; e += 2) {
          along[k] = i / SEG;
          side[k] = e;
          seed[k * 2] = s / STRANDS;
          seed[k * 2 + 1] = a * 0.7 + b * 0.3;
          tint.set([c.r, c.g, c.b], k * 3);
          k++;
        }
        if (i < SEG) {
          const o = k - 2;
          index.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute("along", new THREE.BufferAttribute(along, 1));
    geo.setAttribute("side", new THREE.BufferAttribute(side, 1));
    geo.setAttribute("seed", new THREE.BufferAttribute(seed, 2));
    geo.setAttribute("tint", new THREE.BufferAttribute(tint, 3));
    geo.setIndex(index);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uTime: { value: 0 }, uA: { value: 0 }, uLen: { value: 0.3 }, uX: { value: 1 } },
      vertexShader: `${PATH_GLSL}
        attribute float along; attribute float side; attribute vec2 seed; attribute vec3 tint;
        uniform float uT, uTime, uLen; varying float vA; varying float vS; varying vec3 vC; varying float vK;
        vec3 at(float q){ vec3 p=starPath(uT-q*uLen*(.55+.45*seed.y)); float open=pow(q,.7); float an=seed.x*6.283+q*2.4+uTime*.35; float rad=open*(.16+.62*seed.y); p+=vec3(cos(an),sin(an)*.8,sin(an)*.6)*rad; return p; }
        void main(){ vec3 p=at(along); vec3 d=normalize(at(along+.02)-p+1e-5); vec4 mv=viewMatrix*vec4(p,1.); vec3 dv=normalize((viewMatrix*vec4(d,0.)).xyz+1e-5); vec3 sv=normalize(cross(dv,normalize(-mv.xyz)));
          float wid=(.018+.15*seed.y)*(1.-.35*along)*smoothstep(0.,.06,along+.02); mv.xyz+=sv*side*wid; gl_Position=projectionMatrix*mv; vA=along; vS=side; vC=tint; vK=seed.y+seed.x*7.; }`,
      fragmentShader: `uniform float uA,uTime; varying float vA,vS,vK; varying vec3 vC;
        void main(){ float edge=pow(max(1.-abs(vS),0.),1.6); float tail=pow(1.-vA,1.7); float flow=.62+.38*sin(vA*26.-uTime*5.+vK*9.); float hot=pow(1.-vA,9.);
          vec3 c=mix(vC,vec3(1.),hot*.8); float i=edge*tail*flow*uA*.8; gl_FragColor=vec4(c*i,i*.22); }`,
    });
    return { geo, mat };
  }, []);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useFrame((state) => {
    const t = starT();
    mat.uniforms.uX.value = view.x;
    mat.uniforms.uT.value = t;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uA.value = fade();
    mat.uniforms.uLen.value = 0.2 + 0.16 * smoothstep(0, 0.3, space.p) + 0.2 * (1 - space.intro);
  });
  return <mesh ref={mesh} geometry={geo} material={mat} frustumCulled={false} />;
}

// Glass shards suspended in space: they drift, turn, and slide past as you travel.
function Shards({ count }) {
  const ref = useRef(null);
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = i * 2.399;
        const r = 2.4 + (i % 5) * 0.75;
        return { x: Math.cos(a) * r * 1.35, y: Math.sin(a) * r * 0.75, z: -13 + ((i * 3.7) % 15), s: 0.08 + ((i * 7) % 5) * 0.055, v: 0.2 + (i % 4) * 0.12 };
      }),
    [count]
  );
  const geo = useMemo(() => {
    const g = new THREE.OctahedronGeometry(1, 0);
    g.scale(0.55, 1.35, 0.18);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const show = smoothstep(0.04, 0.2, space.p) * (1 - smoothstep(0.86, 0.98, space.p));
    ref.current.visible = show > 0.01;
    bits.forEach((b, i) => {
      o.position.set(b.x, b.y, b.z + space.p * 13 * (0.6 + b.v));
      o.rotation.set(time * b.v + i, time * b.v * 0.7 + space.p * 4, i);
      o.scale.setScalar(b.s * show);
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshPhysicalMaterial color="#cfc3e6" metalness={0.15} roughness={0.06} iridescence={1} iridescenceIOR={1.9} iridescenceThicknessMinimum={200} iridescenceThicknessMaximum={700} transparent opacity={0.42} envMapIntensity={2} side={THREE.DoubleSide} flatShading />
    </instancedMesh>
  );
}

// Dust that stretches into streaks while you travel.
function Dust({ count }) {
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 6);
    const end = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * 6.283;
      const r = 1.2 + Math.random() * 8;
      const z = -Math.random() * 30;
      for (let e = 0; e < 2; e++) {
        pos.set([Math.cos(a) * r, Math.sin(a) * r * 0.7, z], (i * 2 + e) * 3);
        end[i * 2 + e] = e;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("end", new THREE.BufferAttribute(end, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uP: { value: 0 }, uW: { value: 0 }, uF: { value: 1 } },
      vertexShader: `attribute float end; uniform float uP,uW; varying float vA;
        void main(){ vec3 p=position; p.z=mod(p.z+uP*34.,30.)-26.; float near=smoothstep(-26.,-4.,p.z)*smoothstep(5.,2.,p.z); p.z-=end*(.03+uW*2.6); vA=near*(1.-end*.85); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: `uniform float uW,uF; varying float vA; void main(){ float i=vA*(.12+uW*.55); i*=uF; gl_FragColor=vec4(vec3(.86,.8,.95)*i,i*.2); }`,
    });
    return { geo, mat };
  }, [count]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  const last = useRef(0);
  useFrame(() => {
    mat.uniforms.uP.value = space.p;
    mat.uniforms.uF.value = 1 - smoothstep(0.86, 0.97, space.p);
    const v = Math.min(1, Math.abs(space.p - last.current) * 60);
    last.current = space.p;
    mat.uniforms.uW.value += (Math.max(v, smoothstep(0.1, 0.5, space.p) * 0.35 * (1 - smoothstep(0.85, 1, space.p))) - mat.uniforms.uW.value) * 0.1;
  });
  return <lineSegments geometry={geo} material={mat} frustumCulled={false} />;
}

// The camera leans a little toward the pointer.
function Camera() {
  useFrame(({ camera, size }) => {
    const wide = Math.min(1, size.width / size.height / 1.2);
    view.x = Math.min(1, size.width / size.height / 1.15);
    camera.position.x += (space.mx * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (space.my * 0.2 - camera.position.y) * 0.04;
    camera.position.z = 6 + (1 - wide) * 4.2; // step back on tall phone screens
    camera.lookAt(0, 0, -3);
  });
  return null;
}

export default function StarScene({ onReady, onFail }) {
  const [awake, setAwake] = useState(true);
  const [warm, setWarm] = useState(false);
  const small = typeof window !== "undefined" && window.innerWidth < 700;

  useEffect(() => {
    const check = () => setAwake(space.active && !document.hidden);
    window.addEventListener("journey:active", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("journey:active", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return (
    <Canvas
      className="star-canvas"
      frameloop={awake && warm ? "always" : "never"}
      dpr={small ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 46 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.domElement.addEventListener("webglcontextlost", () => onFail?.(), { once: true });
      }}
    >
      <Reflections />
      <Camera />
      <Dust count={small ? 160 : 340} />
      <Trail />
      <Star />
      <Shards count={small ? 9 : 18} />
      <WarmUp
        onReady={() => {
          setWarm(true);
          onReady?.();
        }}
      />
    </Canvas>
  );
}
