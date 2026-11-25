"use client";

// The foil pack in real 3D. Two sheets of foil are joined at crimped ends; the top
// strip tears off along a jagged line, the mouth gapes open, light spills out and
// the cards rise. Every moving value lives in `fx`, a plain object that the parent
// animates with GSAP, so this file only has to draw it.
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import WarmUp from "../WarmUp";
import { asset } from "@/lib/asset";
import { cardBack } from "@/lib/cardback";
import { fanPose, PACK } from "./machine";

const W = PACK.w / 100;
const H = PACK.h / 100;
const TEAR_V = 0.8526; // where the dotted line sits on the print (0 = bottom, 1 = top)
const TEAR_Y = (TEAR_V - 0.5) * H;

export const freshFx = () => ({
  hover: 0, // pointer is over the pack
  mx: 0, // pointer, -1 to 1 across the pack
  my: 0,
  tear: 0, // 0-1 along the dotted line
  dir: 1, // 1 = torn left to right
  strip: 0, // the torn strip flying away
  gape: 0, // the mouth opening
  light: 0, // glow from inside
  rise: 0, // cards leaving the pack
  fan: 0, // cards fanning out
  drop: 0, // the empty wrapper falling away
  cards: 1, // opacity of the 3D cards
});

// A pillow-shaped sheet: flat at the crimped ends and sides, full in the middle.
function sheet(side) {
  const g = new THREE.PlaneGeometry(W, H, 44, 70);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (W / 2);
    const v = p.getY(i) / H + 0.5;
    const ends = THREE.MathUtils.smoothstep(v, 0.055, 0.24) * THREE.MathUtils.smoothstep(1 - v, 0.055, 0.24);
    const round = Math.pow(Math.max(0, 1 - x * x), 0.55);
    p.setZ(i, side * (0.012 + 0.19 * round * ends));
  }
  g.computeVertexNormals();
  return g;
}

const JAG = `float jag(float u){ return ${TEAR_V.toFixed(4)} + .0042*(abs(fract(u*19.)-.5)*2.-.5) + .003*sin(u*47.) + .002*sin(u*131.); }`;

// Foil that can tear: `part` 0 = body (below the line), 1 = strip (above it).
function foilMaterial(maps, u, side, part) {
  const m = new THREE.MeshPhysicalMaterial({
    map: side > 0 ? maps.front : null,
    color: side > 0 ? "#ffffff" : "#8f84b4",
    normalMap: maps.normal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    emissive: side > 0 ? "#ffffff" : "#000000",
    emissiveMap: side > 0 ? maps.front : null,
    emissiveIntensity: 0.42,
    metalness: 0.55,
    roughness: 0.3,
    iridescence: 0.22,
    iridescenceIOR: 1.35,
    iridescenceThicknessMinimum: 280,
    iridescenceThicknessMaximum: 420,
    clearcoat: 0.75,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.15,
    side: THREE.DoubleSide,
    transparent: true,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTear = u.tear;
    sh.uniforms.uDir = u.dir;
    sh.uniforms.uGape = u.gape;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\nuniform float uTear,uDir,uGape; varying vec2 vP; varying float vCut;`)
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
         vP = uv;
         vCut = uTear * 1.3 - (uDir > 0. ? uv.x : 1. - uv.x);
         float along = uDir > 0. ? uv.x : 1. - uv.x;
         float lift = clamp(uTear * 1.3 - along, 0., 1.);
         float ang = ${part ? "min(lift * 3.1, 2.5)" : "0."};
         objectNormal = vec3(objectNormal.x, objectNormal.y*cos(ang)-objectNormal.z*sin(ang), objectNormal.y*sin(ang)+objectNormal.z*cos(ang));`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         ${
           part
             ? `float h = max(transformed.y - ${TEAR_Y.toFixed(4)}, 0.);
                float z0 = transformed.z;
                transformed.y = ${TEAR_Y.toFixed(4)} + h*cos(ang) - z0*sin(ang)*.4 + lift*lift*.30;
                transformed.z = z0*cos(ang) + h*sin(ang) + lift*.16;`
             : `float mouth = smoothstep(.42, ${TEAR_V.toFixed(3)}, uv.y);
                float bow = 1. - pow(abs(uv.x*2.-1.), 2.2);
                transformed.z += ${side.toFixed(1)} * uGape * mouth * mouth * bow * .52;
                transformed.y -= uGape * mouth * bow * .10;`
         }`
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec2 vP; varying float vCut;\n${JAG}`)
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
         float line = jag(vP.x);
         if (${part ? "vP.y < line || vCut <= 0." : "vP.y > line && vCut > 0."}) discard;
         float crimp = smoothstep(.062,.058,min(vP.y,1.-vP.y));
         float zig = abs(fract(vP.x*34.)-.5)*.013;
         if (vP.y > .997 - zig || vP.y < .003 + zig) discard;
         diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb*.72+vec3(.13,.12,.17), crimp);
         if (${side > 0 ? "!gl_FrontFacing" : "gl_FrontFacing"}) diffuseColor.rgb = vec3(.62,.58,.74); // silver inside
        `
      );
  };
  m.customProgramCacheKey = () => `foil${side}${part}`;
  return m;
}

function Lights() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const env = new THREE.Scene();
    const add = (mesh) => env.add(mesh);
    add(
      new THREE.Mesh(
        new THREE.SphereGeometry(20, 24, 16),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          vertexShader: "varying vec3 v; void main(){ v=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
          fragmentShader:
            "varying vec3 v; void main(){ float t=v.y*.5+.5; vec3 c=mix(vec3(.04,.035,.11),vec3(.34,.28,.5),smoothstep(.15,.95,t)); c=mix(c,vec3(.86,.69,.76),smoothstep(.35,.95,-v.x*.8+v.y*.35)*.7); c=mix(c,vec3(.21,.21,.75),smoothstep(.4,1.,v.x)*.8); gl_FragColor=vec4(c,1.); }",
        })
      )
    );
    const panel = (color, k, x, y, z, w, h) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      add(m);
    };
    panel("#ffffff", 7, -5, 5, 5, 2.2, 5);
    panel("#f3dfe8", 3.2, 4.5, 2, 6, 0.7, 7);
    panel("#8d83d0", 4, 6, -2, 3, 2, 6);
    panel("#dcb1c2", 2.4, -6, -3, 4, 3, 2);
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.015);
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

// Keeps 1 unit = 100 CSS pixels on the plane z = 0, whatever the canvas size.
function Camera() {
  useFrame(({ camera, size }) => {
    const d = size.height / 100 / 2 / Math.tan((camera.fov * Math.PI) / 360);
    if (Math.abs(camera.position.z - d) > 0.001) {
      camera.position.set(0, 0, d);
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

function Pack({ fx, cards: deck, scale }) {
  const total = deck.length;
  const [front, normal] = useLoader(THREE.TextureLoader, [asset("/work/pack-front.webp"), asset("/work/pack-normal.webp")]);
  // Every card shares one printed back.
  const back = useMemo(() => {
    const t = new THREE.CanvasTexture(cardBack());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false, depthTest: false });
  }, []);
  useEffect(
    () => () => {
      back.map.dispose();
      back.dispose();
    },
    [back]
  );
  const root = useRef(null);
  const wrapper = useRef(null);
  const strip = useRef(null);
  const cards = useRef([]);
  const light = useRef(null);
  const lean = useRef({ x: 0, y: 0 });

  const u = useMemo(() => ({ tear: { value: 0 }, dir: { value: 1 }, gape: { value: 0 } }), []);
  const kit = useMemo(() => {
    front.colorSpace = THREE.SRGBColorSpace;
    front.anisotropy = 8;
    const maps = { front, normal };
    const geoF = sheet(1);
    const geoB = sheet(-1);
    const mats = { bodyF: foilMaterial(maps, u, 1, 0), bodyB: foilMaterial(maps, u, -1, 0), stripF: foilMaterial(maps, u, 1, 1), stripB: foilMaterial(maps, u, -1, 1) };
    // Rounded card with a printed back.
    const cw = PACK.cardW / 100;
    const ch = PACK.cardH / 100;
    const r = 0.13;
    const s = new THREE.Shape();
    s.moveTo(-cw / 2 + r, -ch / 2);
    s.lineTo(cw / 2 - r, -ch / 2);
    s.quadraticCurveTo(cw / 2, -ch / 2, cw / 2, -ch / 2 + r);
    s.lineTo(cw / 2, ch / 2 - r);
    s.quadraticCurveTo(cw / 2, ch / 2, cw / 2 - r, ch / 2);
    s.lineTo(-cw / 2 + r, ch / 2);
    s.quadraticCurveTo(-cw / 2, ch / 2, -cw / 2, ch / 2 - r);
    s.lineTo(-cw / 2, -ch / 2 + r);
    s.quadraticCurveTo(-cw / 2, -ch / 2, -cw / 2 + r, -ch / 2);
    const cardGeo = new THREE.ShapeGeometry(s, 6);
    const uv = cardGeo.attributes.uv;
    const pos = cardGeo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / cw + 0.5, pos.getY(i) / ch + 0.5);
    // The light inside: a soft column rising from the mouth, hotter along the torn edge.
    const lightMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      premultipliedAlpha: true,
      blending: THREE.AdditiveBlending,
      uniforms: { uTear: u.tear, uDir: u.dir, uL: { value: 0 }, uTime: { value: 0 } },
      vertexShader: "varying vec2 v; void main(){ v=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader: `varying vec2 v; uniform float uTear,uDir,uL,uTime;
        void main(){ float x=v.x*2.-1.; float s=uDir>0.?v.x:1.-v.x; float open=smoothstep(uTear*1.1,uTear*1.1-.16,s);
          float up=v.y; float spread=exp(-pow(x/(.42+up*.45),2.)*1.6); float rays=.72+.28*sin(x*17./(1.+up)+uTime*.6)*sin(x*7.-uTime*.4);
          float col=pow(1.-up,1.7)*spread*rays; float edge=exp(-up*26.)*smoothstep(.64,.55,abs(x));
          float i=(col*(.35+uL*1.1)+edge*(.9+uL))*open*smoothstep(0.,.04,uTear)*smoothstep(1.,.62,abs(x)-up*.2);
          vec3 c=mix(vec3(.62,.52,.9),vec3(1.,.93,.97),clamp(i,0.,1.)); gl_FragColor=vec4(c*i,i*.3); }`,
    });
    const lightGeo = new THREE.PlaneGeometry(W * 1.5, 3.2);
    lightGeo.translate(0, 1.6, 0);
    return { geoF, geoB, mats, cardGeo, lightMat, lightGeo };
  }, [front, normal, u]);

  useEffect(
    () => () => {
      kit.geoF.dispose();
      kit.geoB.dispose();
      kit.cardGeo.dispose();
      kit.lightGeo.dispose();
      kit.lightMat.dispose();
      Object.values(kit.mats).forEach((m) => m.dispose());
    },
    [kit]
  );

  useFrame((state) => {
    const f = fx.current;
    const t = state.clock.elapsedTime;
    const calm = 1 - Math.min(1, f.gape + f.drop + f.tear * 0.6); // stop floating once it is being opened
    u.tear.value = f.tear;
    u.dir.value = f.dir;
    u.gape.value = f.gape;

    const l = lean.current;
    l.x += (f.my * 0.24 * f.hover - l.x) * 0.1;
    l.y += (f.mx * 0.42 * f.hover - l.y) * 0.1;
    root.current.scale.setScalar(scale * (1 + 0.03 * f.hover * calm));
    root.current.rotation.set(-l.x + Math.sin(t * 0.7) * 0.03 * calm, l.y + Math.sin(t * 0.5) * 0.09 * calm, Math.sin(t * 0.6) * 0.02 * calm);
    root.current.position.y = Math.sin(t * 1.1) * 0.08 * calm;

    // Wrapper: dips as the cards rise, then falls away.
    const w = wrapper.current;
    w.position.set(0, -f.rise * 1.5 - f.drop * 5.5, -f.drop * 1.5);
    w.rotation.set(f.drop * -0.5, 0, f.drop * 0.22);
    const op = 1 - THREE.MathUtils.smoothstep(f.drop, 0.35, 1);
    kit.mats.bodyF.opacity = kit.mats.bodyB.opacity = op;
    w.visible = op > 0.01;

    const st = strip.current;
    st.position.set(f.dir * f.strip * 2.6, f.strip * 2.3 - f.strip * f.strip * 1.2, f.strip * 1.6);
    st.rotation.set(f.strip * 2.2, f.strip * 0.6, -f.dir * f.strip * 2.1);
    kit.mats.stripF.opacity = kit.mats.stripB.opacity = 1 - THREE.MathUtils.smoothstep(f.strip, 0.55, 1);
    st.visible = f.strip < 0.995;

    kit.lightMat.uniforms.uL.value = f.light;
    kit.lightMat.uniforms.uTime.value = t;
    light.current.visible = f.tear > 0.01 && f.drop < 0.9;
    light.current.position.set(0, TEAR_Y - 0.08 - f.rise * 1.5 - f.drop * 4, 0.02);
    light.current.scale.set(1, 0.5 + f.light * 0.75, 1);

    back.opacity = f.cards;
    cards.current.forEach((c, i) => {
      if (!c) return;
      const pose = fanPose(i, total);
      const lag = THREE.MathUtils.clamp(f.rise * 1.35 - ((total - 1 - i) / total) * 0.35, 0, 1);
      const e = lag * lag * (3 - 2 * lag);
      const hop = Math.sin(e * Math.PI) * 1.15; // up and out of the mouth, then back to the middle
      c.position.set((pose.x / 100) * f.fan, -0.2 + e * 0.2 + hop - (pose.y / 100) * f.fan, -0.04 + i * 0.016 + f.fan * 0.02);
      c.rotation.z = (-pose.rotation * Math.PI * f.fan) / 180;
      c.visible = f.gape > 0.02 && f.cards > 0.01;
      c.scale.setScalar(0.95 + 0.05 * e);
    });
  });

  return (
    <group ref={root}>
      <group ref={wrapper}>
        <mesh geometry={kit.geoB} material={kit.mats.bodyB} renderOrder={0} />
      </group>
      {Array.from({ length: total }, (_, i) => (
        <mesh key={i} ref={(m) => (cards.current[i] = m)} geometry={kit.cardGeo} material={back} renderOrder={1 + i * 0.01} />
      ))}
      <mesh ref={light} geometry={kit.lightGeo} material={kit.lightMat} renderOrder={2} />
      <FrontOf wrapper={wrapper} geo={kit.geoF} mat={kit.mats.bodyF} />
      <group ref={strip}>
        <mesh geometry={kit.geoB} material={kit.mats.stripB} renderOrder={4} />
        <mesh geometry={kit.geoF} material={kit.mats.stripF} renderOrder={5} />
      </group>
    </group>
  );
}

// The front sheet moves with the wrapper but is drawn after the cards and light.
function FrontOf({ wrapper, geo, mat }) {
  const ref = useRef(null);
  useFrame(() => {
    ref.current.position.copy(wrapper.current.position);
    ref.current.rotation.copy(wrapper.current.rotation);
    ref.current.visible = wrapper.current.visible;
  });
  return <mesh ref={ref} geometry={geo} material={mat} renderOrder={3} />;
}

export default function PackScene({ fx, cards, scale, awake, onReady, onFail }) {
  return (
    <Canvas
      className="pack-canvas"
      frameloop={awake ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: 28, position: [0, 0, 14], near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextlost", () => onFail?.(), { once: true });
      }}
    >
      <Lights />
      <Camera />
      <Suspense fallback={null}>
        <Pack fx={fx} cards={cards} scale={scale} />
        <WarmUp onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
