"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { makeBeanGeometry } from "@/lib/bean-geometry";
import { hero, pointer } from "@/lib/hero-state";
import { getLenis, READY_EVENT } from "@/lib/scroll";

/**
 * O hero em camadas.
 *
 *   fundo com feixe de luz     ← respira sozinho
 *   poeira ambiente            ← sempre à deriva, independente do grão
 *   fumaça                     ← sobe devagar, dá volume ao vazio
 *   o grão em pó               ← forma, gira, foge do cursor, estilhaça
 *
 * A regra que orienta tudo: SE O GRÃO SUMIR, A TELA AINDA TEM QUE ESTAR VIVA.
 * A versão anterior falhava nisso — fora o grão, o hero era um retângulo
 * preto parado, e é isso que faz uma página parecer landing e não experiência.
 *
 * A luz também não é fixa: a direção orbita devagar, então o brilho atravessa
 * o relevo do grão sem que nada precise se mover.
 */

const BEAN_SIZE = 2.3;
const TOUCH_RADIUS = 0.75;
const BASE_SPIN = 0.22;
const SPIN_FROM_SCROLL = 0.01;
const MAX_SPIN = 8;

/** PRNG determinístico — a mesma abertura em todo carregamento. */
function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/* ========================================================================
   O GRÃO
   ======================================================================== */

const beanVertex = /* glsl */ `
  uniform float uTime;
  uniform float uForm;
  uniform float uBurst;
  uniform vec3  uMouse;
  uniform float uPress;
  uniform vec3  uLightDir;

  attribute vec3  aTarget;
  attribute vec3  aNormal;
  attribute vec3  aStart;
  attribute float aSeed;
  attribute float aDelay;
  attribute float aCrease;

  varying float vShade;
  varying float vSeed;
  varying float vShine;
  varying float vSpec;
  varying float vCrease;
  varying vec2  vUv;

  void main() {
    vUv = uv;
    vSeed = aSeed;
    vCrease = aCrease;

    // Cada lasca com o próprio atraso: sem isso as milhares chegam juntas e
    // a formação vira um zoom.
    float f = clamp((uForm - aDelay * 0.4) / 0.6, 0.0, 1.0);
    f = f * f * (3.0 - 2.0 * f);

    vec3 pos = mix(aStart, aTarget, f);

    // deriva enquanto ainda é pó
    float drift = (1.0 - f) * 0.25;
    pos.x += sin(uTime * 0.5 + aSeed * 31.0) * drift;
    pos.y += cos(uTime * 0.4 + aSeed * 17.0) * drift;

    // FUGA DO CURSOR — as lascas próximas são empurradas e voltam sozinhas.
    vec3 away = pos - uMouse;
    float dist = length(away);
    float push = smoothstep(${TOUCH_RADIUS.toFixed(2)}, 0.0, dist) * uPress * f;
    pos += normalize(away + 0.0001) * push * 0.4;
    vShine = push;

    // ESTILHAÇO no fim do scroll — o grão vira moagem.
    vec3 out_ = normalize(aNormal + vec3(0.0, aSeed - 0.5, 0.0));
    pos += out_ * uBurst * (0.4 + aSeed * 1.2);
    pos.y -= uBurst * uBurst * (0.5 + aSeed) * 1.5;

    // Orienta a lasca na normal da superfície, com giro próprio no plano.
    vec3 n = normalize(mix(normalize(aStart), aNormal, f));
    vec3 up = abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 t = normalize(cross(up, n));
    vec3 b = cross(n, t);
    float a = aSeed * 6.2831 + uTime * 0.12 + uBurst * aSeed * 10.0;
    vec2 q = position.xy * (0.75 + aSeed * 0.55);
    vec3 offset = t * (q.x * cos(a) - q.y * sin(a)) + b * (q.x * sin(a) + q.y * cos(a));

    // Iluminação na normal da SUPERFÍCIE (não da lasca): é o que faz um
    // amontoado de quadrinhos planos ler como um corpo sólido.
    vec3 wn = normalize(normalMatrix * n);
    vShade = max(dot(wn, uLightDir), 0.0);
    // óleo da torra escura: especular curto, viajando com a luz
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vSpec = pow(max(dot(wn, normalize(uLightDir + viewDir)), 0.0), 26.0);

    vec4 mv = modelViewMatrix * vec4(pos + offset, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const beanFragment = /* glsl */ `
  uniform float uBurst;
  varying float vShade;
  varying float vSeed;
  varying float vShine;
  varying float vSpec;
  varying float vCrease;
  varying vec2  vUv;

  void main() {
    // Lasca de borda macia — quadrado duro entrega o truque.
    float mask = smoothstep(0.5, 0.12, length(vUv - 0.5) * 1.3);
    if (mask < 0.02) discard;

    // Torra escura. A variação entre lascas é ESTREITA de propósito: a
    // primeira versão ia de 0,07 a 0,46 e a casca virava granito pintalgado.
    // Grão de café é quase monocromático — o relevo vem da luz, não da cor.
    vec3 dark = vec3(0.105, 0.062, 0.040);
    vec3 warm = vec3(0.235, 0.145, 0.088);
    vec3 base = mix(dark, warm, smoothstep(0.1, 0.95, vSeed));

    vec3 color = base * (0.26 + 1.05 * vShade);

    // O VINCO. Sombra funda e SÓ UM FIO de silverskin no talo da fenda.
    // Com o fio largo (era 0.5 numa faixa de 0.28) a fenda lia clara — o
    // oposto de uma fenda. Sombra é o que a define; a pele prateada é o
    // detalhe que confirma.
    color *= 1.0 - smoothstep(0.1, 0.7, vCrease) * 0.82;
    color += vec3(0.56, 0.50, 0.41) * smoothstep(0.88, 1.0, vCrease) * 0.22;

    color += vec3(0.66, 0.41, 0.19) * pow(1.0 - vShade, 3.0) * 0.34;  // aro de cobre
    color += vec3(1.0, 0.86, 0.64) * vSpec * 0.42 * (1.0 - vCrease);  // óleo, não no fundo da fenda
    color += vec3(1.0, 0.62, 0.26) * vShine * 0.85;                   // calor do cursor

    gl_FragColor = vec4(color, mask * (1.0 - uBurst * 0.4));
  }
`;

function Bean({ count, interactive }: { count: number; interactive: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const announced = useRef(false);
  const spin = useRef(BASE_SPIN);
  const angle = useRef(0);

  const geometry = useMemo(() => {
    const bean = makeBeanGeometry({ segments: 128, size: BEAN_SIZE });
    // Distribuir por ÁREA (e não por vértice) impede as lascas de se
    // amontoarem onde a malha é densa e rarearem onde ela é lisa.
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(bean)).build();

    const target = new Float32Array(count * 3);
    const normal = new Float32Array(count * 3);
    const start = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const delay = new Float32Array(count);
    const crease = new Float32Array(count);

    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    const c = new THREE.Color();
    const rng = makeRng(0x51f3c7);

    for (let i = 0; i < count; i++) {
      // a cor carrega a máscara do vinco, interpolada pelo sampler
      sampler.sample(p, n, c);
      target.set([p.x, p.y, p.z], i * 3);
      normal.set([n.x, n.y, n.z], i * 3);
      crease[i] = c.r;

      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 5.5 + rng() * 5;
      start.set(
        [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        ],
        i * 3,
      );
      seed[i] = rng();
      delay[i] = rng();
    }

    const chip = new THREE.PlaneGeometry(0.072, 0.072);
    const instanced = new THREE.InstancedBufferGeometry();
    instanced.index = chip.index;
    instanced.attributes.position = chip.attributes.position;
    instanced.attributes.uv = chip.attributes.uv;
    instanced.instanceCount = count;
    instanced.setAttribute("aTarget", new THREE.InstancedBufferAttribute(target, 3));
    instanced.setAttribute("aNormal", new THREE.InstancedBufferAttribute(normal, 3));
    instanced.setAttribute("aStart", new THREE.InstancedBufferAttribute(start, 3));
    instanced.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 1));
    instanced.setAttribute("aDelay", new THREE.InstancedBufferAttribute(delay, 1));
    instanced.setAttribute("aCrease", new THREE.InstancedBufferAttribute(crease, 1));
    // O frustum culling não sabe medir posições calculadas no shader e
    // cortaria o pó no meio da formação.
    instanced.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 14);
    bean.dispose();
    return instanced;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uForm: { value: 0 },
      uBurst: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 6) },
      uPress: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0.5, 0.8, 0.6).normalize() },
    }),
    [],
  );

  const local = useMemo(() => new THREE.Vector3(), []);
  const aim = useMemo(() => new THREE.Vector3(0, 0, 6), []);

  const onMove = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive || !group.current) return;
    local.copy(event.point);
    group.current.worldToLocal(local);
    pointer.x = local.x;
    pointer.y = local.y;
    pointer.z = local.z;
    pointer.pressTarget = 1;
  };

  useFrame((state, dt) => {
    // ÚNICO ponto de amortecimento do hero
    hero.value = THREE.MathUtils.damp(hero.value, hero.target, 6, dt);
    const p = hero.value;
    const t = state.clock.elapsedTime;

    const u = mat.current!.uniforms;
    u.uTime.value = t;
    u.uForm.value = hero.form;

    // O grão APROXIMA antes de estilhaçar: cresce e vem em direção à câmera,
    // como um corte de cinema entrando no próximo plano.
    const approach = THREE.MathUtils.smoothstep(p, 0, 0.62);
    const burst = THREE.MathUtils.smoothstep(p, 0.5, 1);
    u.uBurst.value = burst;

    // LUZ DINÂMICA: a direção orbita devagar, então o realce atravessa o
    // relevo mesmo com o grão parado. É movimento que não custa geometria.
    const a = t * 0.16;
    (u.uLightDir.value as THREE.Vector3)
      .set(Math.cos(a) * 0.75, 0.72 + Math.sin(a * 0.7) * 0.12, Math.sin(a) * 0.5 + 0.55)
      .normalize();

    pointer.press = THREE.MathUtils.damp(pointer.press, pointer.pressTarget, 7, dt);
    aim.set(pointer.x, pointer.y, pointer.z);
    (u.uMouse.value as THREE.Vector3).lerp(aim, 1 - Math.pow(0.001, dt));
    u.uPress.value = pointer.press;

    // Giro pela VELOCIDADE do scroll, com inércia — o grão demora a acelerar
    // e demora a parar, como se pesasse.
    const velocity = getLenis()?.velocity ?? 0;
    const wanted = THREE.MathUtils.clamp(
      BASE_SPIN + velocity * SPIN_FROM_SCROLL,
      -MAX_SPIN,
      MAX_SPIN,
    );
    spin.current = THREE.MathUtils.damp(spin.current, wanted, 3.5, dt);
    angle.current += spin.current * dt * hero.form;

    const g = group.current!;
    g.rotation.y = angle.current;
    g.rotation.z = -0.24 + Math.sin(t * 0.23) * 0.04;
    g.rotation.x = 0.07 + Math.sin(t * 0.37) * 0.05;
    // Sobe e encolhe um pouco: a marca ocupa o terço de baixo e o grão
    // precisa caber INTEIRO acima dela — cortado pela metade ele deixa de
    // ser um objeto e vira textura de fundo.
    g.position.y = 0.62 + Math.sin(t * 0.75) * 0.07;
    g.position.z = approach * 1.7;
    g.scale.setScalar(0.86 + approach * 0.62);

    if (!announced.current) {
      announced.current = true;
      window.dispatchEvent(new Event(READY_EVENT));
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          vertexShader={beanVertex}
          fragmentShader={beanFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {interactive && (
        <mesh
          onPointerMove={onMove}
          onPointerOut={() => {
            pointer.pressTarget = 0;
          }}
        >
          <sphereGeometry args={[1.9, 24, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/* ========================================================================
   AS CAMADAS DE AMBIENTE — o que continua vivo sem o grão
   ======================================================================== */

/** Feixe de luz volumétrico que varre devagar. Só um plano e um shader. */
function LightShaft() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 1 } }), []);
  // A mutação passa pelo ref do material, não pelo objeto do useMemo: o
  // React Compiler trata resultado de useMemo como imutável, e escrever
  // nele a cada quadro é exatamente o que a regra existe pra pegar.
  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uFade.value = 1 - Math.min(1, hero.value * 1.4);
  });
  return (
    <mesh position={[0, 0, -3.2]}>
      <planeGeometry args={[26, 16]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime; uniform float uFade; varying vec2 vUv;
          void main(){
            vec2 p = vUv - vec2(0.5, 0.42);
            // duas lâminas de luz cruzando devagar, em fases diferentes
            float a = sin(uTime * 0.11);
            float b = sin(uTime * 0.07 + 2.1);
            float s1 = exp(-pow((p.x - a * 0.22) * 5.5, 2.0));
            float s2 = exp(-pow((p.x - b * 0.35 + 0.18) * 3.2, 2.0));
            float v = smoothstep(0.62, 0.0, length(p * vec2(1.5, 1.0)));
            vec3 warm = vec3(0.30, 0.19, 0.10);
            gl_FragColor = vec4(warm * (s1 * 0.55 + s2 * 0.3), 1.0) * v * uFade;
          }
        `}
      />
    </mesh>
  );
}

/**
 * Poeira ambiente — a camada que garante que a tela nunca esteja parada.
 * Ocupa o quadro inteiro e não depende do grão: se ele sumir, isto continua.
 */
function AmbientDust({ count = 220 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const rng = makeRng(0x2b91ef);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 13;
      positions[i * 3 + 1] = (rng() - 0.5) * 8;
      positions[i * 3 + 2] = (rng() - 0.5) * 5 - 1;
      seeds[i] = rng();
    }
    return { positions, seeds };
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 1 } }), []);

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uFade.value = 1 - Math.min(1, hero.value * 1.2);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          uniform float uTime; attribute float aSeed; varying float vA; varying float vS;
          void main(){
            vS = aSeed;
            vec3 pos = position;
            // sobe devagar e volta pelo topo — deriva infinita sem respawn
            float rise = mod(uTime * (0.035 + aSeed * 0.05) + aSeed, 1.0);
            pos.y = mix(-4.0, 4.0, rise);
            pos.x += sin(uTime * 0.13 + aSeed * 40.0) * 0.55;
            pos.z += cos(uTime * 0.09 + aSeed * 25.0) * 0.35;
            // apaga nas pontas do percurso pra não piscar no respawn
            vA = smoothstep(0.0, 0.12, rise) * smoothstep(1.0, 0.85, rise);
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            // Tamanho em PIXELS com queda por distância. A versão anterior
            // usava fator 60 e a poeira virava bokeh de 400px — parecia
            // sujeira na lente, não pó em suspensão.
            gl_PointSize = (1.6 + aSeed * 3.4) * (5.0 / -mv.z);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uFade; varying float vA; varying float vS;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.05, d) * vA * uFade;
            vec3 c = mix(vec3(0.55, 0.42, 0.28), vec3(0.86, 0.72, 0.5), vS);
            gl_FragColor = vec4(c, a * 0.4);
          }
        `}
      />
    </points>
  );
}

/** Fumaça: poucos sprites enormes e quase transparentes. Dá volume ao vazio. */
function Smoke({ count = 26 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const rng = makeRng(0x77c1a4);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 6;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (rng() - 0.5) * 3 - 1.5;
      seeds[i] = rng();
    }
    return { positions, seeds };
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uRate: { value: 1 } }), []);

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    // a fumaça ADENSA conforme se rola — prepara a entrada da torrefação
    u.uRate.value = 0.6 + Math.sin(Math.min(1, hero.value) * Math.PI) * 0.9;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          uniform float uTime; attribute float aSeed; varying float vA;
          void main(){
            float life = fract(uTime * (0.035 + aSeed * 0.03) + aSeed);
            vec3 pos = position;
            pos.y = -3.5 + life * 8.0;
            pos.x += sin(life * 3.0 + aSeed * 30.0) * (0.6 + life * 1.4);
            vA = smoothstep(0.0, 0.25, life) * smoothstep(1.0, 0.6, life);
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (70.0 + aSeed * 90.0) * (5.0 / -mv.z);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uRate; varying float vA;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vA * uRate;
            gl_FragColor = vec4(vec3(0.55, 0.46, 0.38), a * 0.035);
          }
        `}
      />
    </points>
  );
}

export default function HeroScene({ mobile }: { mobile: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      dpr={mobile ? [1, 1.4] : [1, 1.8]}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      // No touch a fuga do cursor não tem cursor pra seguir e roubaria o scroll.
      style={{ pointerEvents: mobile ? "none" : "auto" }}
    >
      <LightShaft />
      <Smoke count={mobile ? 14 : 26} />
      <AmbientDust count={mobile ? 90 : 220} />
      <Bean count={mobile ? 2600 : 7000} interactive={!mobile} />
    </Canvas>
  );
}
