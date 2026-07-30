/**
 * O vocabulário de reveal da casa. São quatro gestos e só; qualquer texto do
 * site escolhe um deles por `data-reveal` e nunca inventa um quinto —
 * repetição é o que faz a página soar afinada.
 *
 *   fadeup      manchete sobe letra a letra de trás de uma máscara
 *   write       parágrafo "escreve" palavra a palavra AMARRADO AO SCROLL
 *   slide       bloco entra deslizando da direita
 *   horizontal  igual ao fadeup, mas disparado pelo trilho horizontal
 *
 * O `write` é o mais barato e o que mais entrega: como é scrub e não
 * duração, a leitura fica presa ao ritmo do dedo do usuário.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lineIndexOf, splitText, type Split } from "./split";

export type RevealKind = "fadeup" | "write" | "slide";

type Options = {
  /** sem movimento: entrega tudo pronto e não registra trigger nenhum */
  reduce: boolean;
  /** abaixo de 992px o reveal por letra sai (custo de INP) */
  mobile: boolean;
};

/** Marca o elemento como pronto pra ficar visível (o CSS o esconde antes). */
function ready(el: HTMLElement) {
  el.classList.add("is-ready");
}

/**
 * Sobe letra a letra, cascateando por linha. O atraso entre linhas (0.18) é
 * maior que o passo entre letras (0.05) de propósito: a linha inteira
 * precisa ler como um bloco antes da próxima começar.
 */
export function revealFadeUp(
  el: HTMLElement,
  split: Split,
  opts: { trigger?: ScrollTrigger.Vars; stagger?: number } = {},
) {
  ready(el);
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: "top 78%",
      once: true,
      ...opts.trigger,
    },
  });

  // O foco chegando junto com as letras: blur no ELEMENTO (uma camada só),
  // nunca nas letras — desfocar centenas de spans individualmente é o jeito
  // caro de conseguir o mesmo quadro.
  tl.fromTo(
    el,
    { filter: "blur(12px)" },
    { filter: "blur(0px)", duration: 1.1, ease: "power2.out" },
    0,
  );

  const byLine = new Map<number, HTMLElement[]>();
  for (const char of split.chars) {
    const i = lineIndexOf(char, split.lines);
    const bucket = byLine.get(i);
    if (bucket) bucket.push(char);
    else byLine.set(i, [char]);
  }

  for (const [i, chars] of byLine) {
    tl.fromTo(
      chars,
      { yPercent: 118, opacity: 1 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: opts.stagger ?? 0.05,
        ease: "power3.out",
      },
      i * 0.18,
    );
  }
  return tl;
}

/**
 * Tinta aparecendo palavra a palavra conforme se rola. Não vai a zero: o
 * texto continua legível (e selecionável) antes de entrar em cena — a
 * referência apaga por completo e paga isso na acessibilidade.
 */
export function revealWrite(el: HTMLElement, split: Split) {
  ready(el);
  gsap.fromTo(
    split.words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: {
        trigger: el,
        start: "top 82%",
        end: "bottom 62%",
        scrub: 1,
      },
    },
  );
}

/** Entrada lateral — pra blocos inteiros, não pra corpo de texto. */
export function revealSlide(el: HTMLElement, split: Split) {
  ready(el);
  gsap.fromTo(
    split.words,
    { x: "40vw", opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 1.3,
      stagger: 0.05,
      ease: "power3.inOut",
      scrollTrigger: { trigger: el, start: "top 82%", once: true },
    },
  );
}

/**
 * Varre o escopo e liga cada `[data-reveal]`. Devolve o revert de todos os
 * splits — sem isso, um Fast Refresh empilha spans dentro de spans.
 */
export function registerReveals(scope: ParentNode, { reduce, mobile }: Options): () => void {
  const nodes = Array.from(scope.querySelectorAll<HTMLElement>("[data-reveal]"));
  const splits: Split[] = [];

  // Imagens marcadas com [data-mask] sobem de trás de uma máscara — a foto
  // nunca "já está lá". O estado inicial é aplicado AQUI (JS), não no CSS:
  // se o JS não rodar, a imagem simplesmente aparece, em vez de nunca vir.
  if (!reduce && !mobile) {
    for (const mask of Array.from(scope.querySelectorAll<HTMLElement>("[data-mask]"))) {
      gsap.fromTo(
        mask,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.25,
          ease: "power3.out",
          scrollTrigger: { trigger: mask, start: "top 86%", once: true },
        },
      );
      const img = mask.querySelector("img");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.16 },
          {
            scale: 1,
            duration: 1.7,
            ease: "power3.out",
            scrollTrigger: { trigger: mask, start: "top 86%", once: true },
          },
        );
      }
    }
  }

  for (const el of nodes) {
    const kind = (el.dataset.reveal || "fadeup") as RevealKind;

    // sem movimento (ou tela pequena, no caso do fadeup): texto entregue
    // pronto, sem split e sem trigger.
    if (reduce || (mobile && kind === "fadeup")) {
      ready(el);
      continue;
    }

    const split = splitText(el, kind === "fadeup" ? "chars" : "words");
    if (!split.words.length) {
      ready(el);
      continue;
    }
    splits.push(split);

    if (kind === "write") revealWrite(el, split);
    else if (kind === "slide") revealSlide(el, split);
    else revealFadeUp(el, split);
  }

  return () => {
    for (const split of splits) split.revert();
    for (const el of nodes) el.classList.remove("is-ready");
  };
}
