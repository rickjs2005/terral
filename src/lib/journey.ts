/**
 * Estado compartilhado da jornada — UM progress pra cena 3D e pro HUD.
 * Gotcha aprendido no kavita-institucional: scrub do GSAP + leitura direta
 * em lugares diferentes dessincroniza HUD e cena; aqui o ScrollTrigger só
 * escreve `target`, e um único rAF (na cena) faz o damping em `value`,
 * que TODO consumidor lê.
 */
export const journey = {
  /** progresso bruto escrito pelo ScrollTrigger (0..1 na jornada) */
  target: 0,
  /** progresso amortecido — fonte única da cena e do HUD */
  value: 0,
};

/** Capítulos da jornada (frações do progresso total). */
export const CHAPTERS = {
  hero: [0, 0.16],
  origem: [0.16, 0.4],
  torra: [0.4, 0.66],
  moagem: [0.66, 0.84],
  xicara: [0.84, 1],
} as const;

export type ChapterKey = keyof typeof CHAPTERS;

/** 0..1 dentro do capítulo (clampado). */
export function chapterProgress(p: number, key: ChapterKey): number {
  const [a, b] = CHAPTERS[key];
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/** Visibilidade de um overlay de capítulo: 1 no miolo, 0 fora (com rampas). */
export function chapterVisibility(p: number, key: ChapterKey): number {
  const [a, b] = CHAPTERS[key];
  const span = b - a;
  const fadeIn = Math.min(1, Math.max(0, (p - a) / (span * 0.25)));
  const fadeOut = Math.min(1, Math.max(0, (b - p) / (span * 0.25)));
  return Math.min(fadeIn, fadeOut);
}
