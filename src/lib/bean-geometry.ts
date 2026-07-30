import * as THREE from "three";

/**
 * O grão de café, construído à mão.
 *
 * Por que não a malha gerada por IA: image-to-3D a partir de UMA foto não
 * consegue inferir o que a foto não mostra. O resultado tinha silhueta lisa e
 * abaulada — uma amêndoa — sem os dois traços que fazem o olho reconhecer
 * café: a FACE CHATA e o VINCO EM S. Sem eles nenhuma iluminação salva.
 *
 * Aqui a anatomia é explícita, verificável e ajustável:
 *
 *        ╱‾‾‾╲        de perfil: costas abauladas,
 *       │  ║  │       frente quase reta
 *       │  ║  │       ║ = o vinco, descendo o comprimento
 *       │ ╱   │           numa curva em S
 *        ╲___╱
 *
 * Proporção real de um grão: 10 × 6,5 × 4 mm ≈ 1 : 0,65 : 0,40.
 */

/** Interpolação suave de Hermite, igual à do GLSL. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export type BeanOptions = {
  /** segmentos da esfera-base; 128 dá silhueta limpa sem pesar */
  segments?: number;
  /** maior dimensão do grão resultante */
  size?: number;
};

export function makeBeanGeometry({ segments = 128, size = 2.3 }: BeanOptions = {}) {
  const geo = new THREE.SphereGeometry(1, segments, segments);
  const pos = geo.attributes.position;

  /**
   * Máscara do vinco, guardada no atributo `color`.
   *
   * É o truque que faz a fenda APARECER. Só afundar a geometria não basta:
   * num corpo feito de milhares de lascas, um vale de dois décimos de
   * profundidade se perde no ruído da iluminação. Marcando quais pontos
   * estão dentro da fenda dá pra escurecê-los no shader — e a fenda passa a
   * ler em qualquer ângulo e sob qualquer luz.
   *
   * O `MeshSurfaceSampler` sabe interpolar `color` junto com posição e
   * normal, então a máscara viaja de graça pro sistema de partículas.
   */
  const crease = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    // ponto na esfera unitária: y é o eixo do COMPRIMENTO
    const ux = pos.getX(i);
    const uy = pos.getY(i);
    const uz = pos.getZ(i);

    let x = ux * 0.72; // largura
    const y = uy * 0.94; // comprimento
    let z = uz * 0.44; // profundidade

    // Pontas levemente afiladas. Pouco, e só bem no fim: pinçar cedo ou
    // demais transforma o grão numa amêndoa pontuda — foi exatamente o que
    // aconteceu na primeira tentativa.
    const tip = smoothstep(0.72, 1.0, Math.abs(uy));
    x *= 1 - tip * 0.16;
    z *= 1 - tip * 0.14;

    // A frente é CHATA, as costas são abauladas. Grão de café não é simétrico
    // nesse eixo, e tratá-lo como elipsoide é o erro que gera a amêndoa.
    if (z > 0) z *= 0.55;

    // O VINCO. Um vale gaussiano estreito descendo o comprimento, com a
    // linha de centro fazendo um S — a fenda de um grão nunca é reta.
    // Gaussiana e não smoothstep: a queda das bordas é mais macia e o fundo
    // mais definido, que é como a fenda real se comporta na luz.
    const sCurve = Math.sin(uy * 2.0) * 0.12;
    const across = x - sCurve;
    const valley = Math.exp(-(across * across) / (2 * 0.11 * 0.11));
    // só na face da frente; some ao chegar na borda
    const front = smoothstep(0.0, 0.12, z);
    const cut = valley * front;
    z -= cut * 0.24;

    pos.setXYZ(i, x, y, z);
    crease[i * 3] = cut; // r = quanto este ponto está dentro da fenda
  }

  geo.setAttribute("color", new THREE.BufferAttribute(crease, 3));
  geo.computeVertexNormals();
  geo.computeBoundingBox();

  // Normaliza pra maior dimensão = `size`, e centra. Todo o resto da cena
  // (raio do toque, força do estilhaço, enquadramento) assume esse tamanho.
  const box = geo.boundingBox!;
  const center = box.getCenter(new THREE.Vector3());
  const extent = box.getSize(new THREE.Vector3());
  const scale = size / Math.max(extent.x, extent.y, extent.z);
  geo.translate(-center.x, -center.y, -center.z);
  geo.scale(scale, scale, scale);

  return geo;
}
