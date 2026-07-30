/**
 * A nav troca de cor conforme o capítulo em cena.
 *
 * O detalhe que faz funcionar: ao SAIR de um capítulo ela já adota a cor do
 * PRÓXIMO, em vez de voltar pro neutro e trocar de novo. Sem isso a barra
 * pisca duas vezes em cada transição e o olho pega.
 *
 * Registro por função em vez de contexto do React porque quem dispara é uma
 * callback de ScrollTrigger, fora do ciclo de render — passar por estado
 * causaria um re-render por quadro de transição.
 */

type Apply = (color: string, active: string | null) => void;

let apply: Apply | null = null;

export function registerNav(fn: Apply | null) {
  apply = fn;
}

export function setNavColor(color: string, active: string | null = null) {
  apply?.(color, active);
}
