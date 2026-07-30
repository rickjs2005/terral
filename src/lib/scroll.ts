/**
 * Estado do scroll compartilhado entre o shell, a nav e o loader.
 *
 * Um único Lenis vive no shell; nav e loader falam com ele por aqui em vez
 * de receber props atravessando meia árvore.
 */

import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Trava dura de scroll. Segura o Lenis E o `overflow` do documento — só o
 * Lenis não basta porque teclado, barra de espaço e trackpad nativo passam
 * por fora dele.
 */
export function lockScroll() {
  document.documentElement.dataset.locked = "true";
  instance?.stop();
  window.scrollTo(0, 0);
}

export function unlockScroll() {
  delete document.documentElement.dataset.locked;
  instance?.start();
}

/** Easing exponencial — a mesma curva do Lenis, pra âncora e scroll baterem. */
export const EXPO_OUT = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (instance) {
    instance.scrollTo(target, { duration: 1.5, easing: EXPO_OUT });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** Evento que o hero dispara quando o WebGL renderiza o primeiro quadro. */
export const READY_EVENT = "terral:scene-ready";

/** Evento que o shell dispara quando o loader sai e o site fica navegável. */
export const GATE_EVENT = "terral:gate-open";
