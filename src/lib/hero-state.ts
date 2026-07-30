/**
 * Um escalar liga o hero inteiro: o grão que estilhaça, a marca que encolhe
 * e o vapor que some são a MESMA variável.
 *
 * Lição da versão anterior: quando o ScrollTrigger escreve direto no DOM e a
 * cena lê o progresso por conta própria, os dois saem de fase em telas
 * lentas. Aqui o trigger só escreve `target`; o amortecimento acontece num
 * único rAF (o da cena) em `value`, e TODO consumidor lê `value`.
 */
export const hero = {
  /** progresso cru do scroll no hero (0..1) */
  target: 0,
  /** progresso amortecido — fonte única */
  value: 0,
  /**
   * Formação: 0 = pó espalhado no escuro, 1 = grão inteiro.
   *
   * É a abertura do site. Não é amortecido como `value` — é uma tween de
   * duração fixa disparada quando o portão abre, porque a chegada do grão
   * precisa ter tempo próprio e não depender do dedo de ninguém.
   */
  form: 0,
};

/** Ponto de contato do cursor, em espaço local do grão, já suavizado. */
export const pointer = {
  x: 0,
  y: 0,
  z: 1.2,
  /** 0 = sem toque, 1 = pressionando */
  press: 0,
  /** alvo do press — decai sozinho quando o cursor sai */
  pressTarget: 0,
};
