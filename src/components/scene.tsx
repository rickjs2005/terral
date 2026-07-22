"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CHAPTERS, chapterProgress, journey } from "@/lib/journey";

/**
 * Cena fixa da jornada TERRAL: um grão de café procedural que TORRA com o
 * scroll (verde-cru → escura), fumaça em partículas, brasas na torra,
 * explosão em pó na moagem e xícara com vapor no final. Tudo dirigido por
 * UM progress amortecido (journey.value) — o damping acontece AQUI (rAF do
 * R3F) e o HUD do DOM lê o mesmo valor.
 */

const RAW = new THREE.Color("#7a8b4c"); // verde-cru
const LIGHT = new THREE.Color("#a4703b"); // torra clara
const MEDIUM = new THREE.Color("#6b4423"); // torra média
const DARK = new THREE.Color("#2b1a10"); // torra escura

function roastColor(r: number, out: THREE.Color): THREE.Color {
  if (r < 0.34) return out.copy(RAW).lerp(LIGHT, r / 0.34);
  if (r < 0.67) return out.copy(LIGHT).lerp(MEDIUM, (r - 0.34) / 0.33);
  return out.copy(MEDIUM).lerp(DARK, (r - 0.67) / 0.33);
}

/* ===== Grão procedural =====
 * Esfera achatada com VINCO central (a fenda do grão) esculpido no vertex
 * shader + ruído de casca. uExplode manda os vértices pra fora ao longo da
 * normal (moagem). Iluminação lambert + rim cobre no fragment. */
const beanVertex = /* glsl */ `
  uniform float uTime;
  uniform float uExplode;
  attribute float aRand;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vCrease;

  void main() {
    vec3 pos = position;
    // proporções de grão: comprido no eixo Y, estreito em X, raso em Z
    pos.x *= 0.78;
    pos.y *= 1.02;
    pos.z *= 0.66;
    // face CHATA (a barriga do grão, z>0) — meia-elipse, não esfera
    float front = smoothstep(0.0, 0.3, pos.z);
    pos.z = mix(pos.z, pos.z * 0.34, front);
    // vinco central em S ao longo do comprimento, só na face chata
    float sCurve = sin(position.y * 1.7) * 0.09;
    float groove = smoothstep(0.17, 0.02, abs(pos.x - sCurve)) * front;
    pos.z -= groove * 0.24;
    // pontas levemente pinçadas
    float tip = smoothstep(0.55, 1.0, abs(position.y));
    pos.x *= 1.0 - tip * 0.2;
    pos.z *= 1.0 - tip * 0.14;
    vCrease = groove;
    // casca irregular sutil
    pos += normal * (sin(position.x * 9.0 + position.y * 7.0) * 0.014 + sin(position.y * 13.0) * 0.009);
    // moagem: cada "caco" voa pra fora com queda
    vec3 dir = normalize(normal + vec3(0.0, aRand - 0.5, 0.0));
    pos += dir * uExplode * (0.2 + aRand * 0.45);
    pos.y -= uExplode * uExplode * aRand * 0.5;

    vNormal = normalMatrix * normal;
    vPos = (modelViewMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const beanFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uExplode;
  uniform float uGloss; // óleo da torra: grão escuro brilha
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vCrease;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.6, 0.9, 0.7));
    float diff = max(dot(n, lightDir), 0.0);
    vec3 viewDir = normalize(-vPos);
    // especular Blinn — o "óleo" aparece conforme torra (uGloss 0→1)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(n, halfDir), 0.0), mix(14.0, 60.0, uGloss)) * (0.15 + uGloss * 1.1);
    // rim cobre — a assinatura visual da marca
    float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.2);
    vec3 base = uColor * (0.32 + 0.78 * diff);
    base *= 1.0 - vCrease * 0.55; // paredes do vinco mais escuras
    // pele prateada (silverskin) no CENTRO do vinco — o detalhe que faz
    // parecer grão de verdade
    float silver = smoothstep(0.55, 0.95, vCrease);
    base += vec3(0.85, 0.76, 0.6) * silver * 0.5;
    base += vec3(0.72, 0.45, 0.2) * rim * 0.7;
    base += vec3(1.0, 0.85, 0.65) * spec * (1.0 - silver * 0.6);
    float fade = 1.0 - smoothstep(0.15, 0.55, uExplode);
    gl_FragColor = vec4(base, fade);
  }
`;

function Bean() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const color = useMemo(() => new THREE.Color(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.15, 96, 96);
    const count = geo.attributes.position.count;
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uExplode: { value: 0 },
      uGloss: { value: 0 },
      uColor: { value: new THREE.Color(RAW) },
    }),
    [],
  );

  useFrame((state, dt) => {
    // damping ÚNICO da jornada (cena + HUD leem journey.value)
    journey.value = THREE.MathUtils.damp(journey.value, journey.target, 6, dt);
    const p = journey.value;

    const u = mat.current!.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const roast = chapterProgress(p, "torra");
    roastColor(roast, color);
    (u.uColor.value as THREE.Color).copy(color);
    u.uGloss.value = roast * roast; // óleo aparece no fim da torra
    u.uExplode.value = chapterProgress(p, "moagem");

    const m = mesh.current!;
    // oscila em vez de girar 360°: a face do vinco (a "cara" do grão)
    // fica sempre voltada pra câmera — girar escondia a anatomia
    m.rotation.y = -0.25 + Math.sin(state.clock.elapsedTime * 0.35) * 0.5 + p * 0.6;
    m.rotation.x = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.07;
    m.rotation.z = -0.35;
    // âncoras por capítulo: hero embaixo do título; alterna o lado conforme
    // o texto (origem/moagem à esquerda ⇒ grão à direita; torra ao contrário)
    const anchors: [number, number, number][] = [
      [0.08, 0, -0.55],
      [0.28, 1.35, 0],
      [0.53, -1.25, 0.1],
      [0.75, 1.2, 0],
      [0.92, 0, 0.2],
    ];
    let ax = anchors[0][1];
    let ay = anchors[0][2];
    for (let i = 0; i < anchors.length - 1; i++) {
      const [pa, xa, ya] = anchors[i];
      const [pb, xb, yb] = anchors[i + 1];
      if (p >= pa && p <= pb) {
        const t = (p - pa) / (pb - pa);
        const e = t * t * (3 - 2 * t);
        ax = xa + (xb - xa) * e;
        ay = ya + (yb - ya) * e;
        break;
      }
      if (p > pb) {
        ax = xb;
        ay = yb;
      }
    }
    m.position.x = ax;
    m.position.y = ay + Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
    // tremor no auge da torra (first crack)
    const torra = chapterProgress(p, "torra");
    const crack = torra > 0.55 && torra < 0.9 ? (torra - 0.55) * 0.12 : 0;
    m.position.x += crack * Math.sin(state.clock.elapsedTime * 47.0);
    const explode = chapterProgress(p, "moagem");
    m.scale.setScalar(0.85 + torra * 0.15);
    m.visible = explode < 0.6; // o fade do fragment já o levou a zero
  });

  return (
    <mesh ref={mesh} geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={beanVertex}
        fragmentShader={beanFragment}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

/* ===== Fumaça/vapor ===== */
const smokeVertex = /* glsl */ `
  uniform float uTime;
  uniform float uRate;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    float life = fract(uTime * 0.12 + aSeed);
    vec3 pos = position;
    pos.y = -0.4 + life * 4.2;
    pos.x += sin(life * 9.0 + aSeed * 40.0) * (0.25 + life * 0.5);
    pos.z += cos(life * 7.0 + aSeed * 30.0) * 0.2;
    vAlpha = smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.55, life) * uRate;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (22.0 + aSeed * 26.0 + life * 40.0) / -mv.z;
  }
`;
const smokeFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha * 0.16;
    gl_FragColor = vec4(vec3(0.9, 0.86, 0.8), a);
  }
`;

function Smoke({ count = 60 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uRate: { value: 0.4 } }), []);

  useFrame((state) => {
    const p = journey.value;
    const u = mat.current!.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    // fumaça forte na torra e na xícara; leve no resto
    const torra = chapterProgress(p, "torra");
    const cup = chapterProgress(p, "xicara");
    u.uRate.value = 0.25 + torra * 0.9 + cup * 1.1 - chapterProgress(p, "moagem") * 0.3;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={smokeVertex}
        fragmentShader={smokeFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* ===== Brasas (só na torra) ===== */
function Embers({ count = 40 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.4;
      positions[i * 3 + 1] = -1.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uRate: { value: 0 } }), []);

  useFrame((state) => {
    const u = mat.current!.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const torra = chapterProgress(journey.value, "torra");
    u.uRate.value = Math.sin(torra * Math.PI) * 1.2;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={/* glsl */ `
          uniform float uTime; uniform float uRate; attribute float aSeed; varying float vA;
          void main(){
            float life = fract(uTime * (0.25 + aSeed * 0.3) + aSeed);
            vec3 pos = position;
            pos.y += life * 3.4;
            pos.x += sin(life * 12.0 + aSeed * 50.0) * 0.3;
            vA = smoothstep(0.0, 0.1, life) * smoothstep(1.0, 0.6, life) * uRate;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (6.0 + aSeed * 8.0) / -mv.z;
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vA;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.1, d) * vA;
            gl_FragColor = vec4(vec3(0.89, 0.35, 0.13) + vec3(0.4, 0.2, 0.0) * (1.0 - d * 2.0), a);
          }
        `}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ===== Pó de moagem (queda) ===== */
function Dust({ count = 90 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.4;
      positions[i * 3 + 1] = 0.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uRate: { value: 0 } }), []);

  useFrame((state) => {
    const u = mat.current!.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const grind = chapterProgress(journey.value, "moagem");
    const ramp = Math.min(1, Math.max(0, (grind - 0.05) / 0.2));
    const tail = Math.min(1, Math.max(0, (1 - grind) / 0.25));
    u.uRate.value = ramp * tail * 2.2;
  });

  return (
    <points position={[1.2, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={/* glsl */ `
          uniform float uTime; uniform float uRate; attribute float aSeed; varying float vA;
          void main(){
            float life = fract(uTime * (0.3 + aSeed * 0.35) + aSeed);
            vec3 pos = position;
            pos.y -= life * 2.6;
            pos.x += sin(life * 14.0 + aSeed * 60.0) * 0.12;
            vA = smoothstep(0.0, 0.08, life) * smoothstep(1.0, 0.7, life) * uRate;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (10.0 + aSeed * 14.0) / -mv.z;
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vA;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.15, d) * vA;
            gl_FragColor = vec4(vec3(0.55, 0.36, 0.22), a * 0.9);
          }
        `}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* ===== Xícara procedural (lathe + alça) ===== */
function Cup() {
  const group = useRef<THREE.Group>(null);
  const bodyGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // perfil: base → parede levemente aberta
    pts.push(new THREE.Vector2(0.02, 0));
    pts.push(new THREE.Vector2(0.55, 0.02));
    pts.push(new THREE.Vector2(0.62, 0.35));
    pts.push(new THREE.Vector2(0.72, 0.95));
    pts.push(new THREE.Vector2(0.74, 1.0));
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  useFrame((state) => {
    const g = group.current!;
    const show = chapterProgress(journey.value, "xicara");
    const eased = show * show * (3 - 2 * show);
    g.visible = show > 0.02;
    g.position.y = -1.6 + eased * 0.9;
    g.scale.setScalar(1.35 * eased);
    g.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={bodyGeo}>
        <meshStandardMaterial color="#f2e8dc" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* café dentro */}
      <mesh position={[0, 0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.66, 40]} />
        <meshStandardMaterial color="#2b1a10" roughness={0.2} />
      </mesh>
      {/* alça */}
      <mesh position={[0.78, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.26, 0.06, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#f2e8dc" roughness={0.35} />
      </mesh>
      {/* pires */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 1.15, 48]} />
        <meshStandardMaterial color="#e5d8c6" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Fundo: glow radial que esquenta na torra e clareia na xícara. */
function Backdrop() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uHeat: { value: 0 }, uCream: { value: 0 } }), []);
  useFrame(() => {
    const p = journey.value;
    uniforms.uHeat.value = Math.sin(chapterProgress(p, "torra") * Math.PI);
    uniforms.uCream.value = chapterProgress(p, "xicara");
  });
  return (
    <mesh position={[0, 0, -4]}>
      <planeGeometry args={[24, 14]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `}
        fragmentShader={/* glsl */ `
          uniform float uHeat; uniform float uCream; varying vec2 vUv;
          void main(){
            float d = length((vUv - vec2(0.5, 0.42)) * vec2(1.6, 1.0));
            vec3 ember = vec3(0.5, 0.16, 0.04) * uHeat;
            vec3 cream = vec3(0.35, 0.29, 0.22) * uCream;
            float a = smoothstep(0.68, 0.0, d) * (0.3 + uHeat * 0.55 + uCream * 0.45);
            gl_FragColor = vec4(ember + cream + vec3(0.35, 0.2, 0.08), a * 0.6);
          }
        `}
      />
    </mesh>
  );
}

export default function Scene({ mobile }: { mobile: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      dpr={mobile ? [1, 1.4] : [1, 1.8]}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      className="pointer-events-none"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffd9b0" />
      <Backdrop />
      <Bean />
      <Smoke count={mobile ? 36 : 60} />
      <Embers count={mobile ? 24 : 40} />
      <Dust count={mobile ? 50 : 90} />
      <Cup />
    </Canvas>
  );
}

export { CHAPTERS };
