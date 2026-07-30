"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef } from "react";
import { NEUTRAL_NAV } from "@/lib/chapters";
import { setNavColor } from "@/lib/nav-color";
import { HoldButton, SECRET } from "./hold-button";
import { SvgWord } from "./svg-word";
import { wa } from "./nav";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Dados da casa — coluna de leitura, não três blocos soltos lado a lado. */
const DADOS = [
  { label: "Torrefação", lines: ["Rua do Torrador, 88", "Manhuaçu · Minas Gerais"] },
  { label: "Bancada aberta", lines: ["Quarta a sábado", "9h às 18h"] },
  { label: "Falar com a gente", lines: ["@terral.cafe"] },
];

/** As palavras da casa, no filete que corre entre o convite e a marca. */
const PALAVRAS = ["Origem", "Altitude", "Fogo", "Silêncio", "Tempo", "Paciência"];

/**
 * O rodapé — o último plano do filme, não uma lista de informações.
 *
 * A versão anterior era genérica e tinha três defeitos de verdade, todos
 * vistos em captura: começava colado no topo e as colunas passavam POR BAIXO
 * da nav; dois vazios de ~200px separavam blocos que deviam conversar; e o
 * marquee em t-giant (11vw) era cortado ao meio pela borda, sobrando
 * meia-letra.
 *
 * A composição agora tem hierarquia: um convite grande à esquerda com o CTA
 * e o botão de segurar logo abaixo dele, os dados da casa em coluna à
 * direita, um filete de palavras correndo entre as duas metades e a marca
 * fechando a página do tamanho da página.
 */
export function SiteFooter() {
  const root = useRef<HTMLElement>(null);
  const markLetters = useRef<SVGTextElement[]>([]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // A marca final é feita do mesmo material da abertura: as letras se
      // AFASTAM da mão e voltam sozinhas — o site fecha com o gesto com que
      // abriu. rAF-throttled; seis getBoundingClientRect por quadro de
      // movimento é barato, e fora da tela o push zera sozinho.
      //
      // A limpeza NÃO pode ser um return aqui dentro: retornar dentro do
      // `if` encerraria o callback inteiro e as animações abaixo nunca
      // registrariam em desktop. Guarda-se a função e devolve no fim.
      let disposePointer: (() => void) | null = null;
      if (window.matchMedia("(pointer: fine)").matches) {
        let frame = 0;
        const onMove = (event: PointerEvent) => {
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            for (const letter of markLetters.current) {
              const r = letter.getBoundingClientRect();
              if (r.bottom < 0 || r.top > innerHeight) continue;
              const dx = r.left + r.width / 2 - event.clientX;
              const dy = r.top + r.height / 2 - event.clientY;
              const dist = Math.hypot(dx, dy);
              const push = Math.max(0, 1 - dist / 420);
              gsap.to(letter, {
                x: (dx / (dist || 1)) * push * 30,
                y: (dy / (dist || 1)) * push * 12,
                duration: 0.9,
                ease: "power3.out",
                overwrite: "auto",
              });
            }
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        disposePointer = () => {
          window.removeEventListener("pointermove", onMove);
          if (frame) cancelAnimationFrame(frame);
        };
      }

      gsap.fromTo(
        ".footer-mark",
        { scale: 0.12, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".footer-mark",
            start: "center bottom",
            toggleActions: "play none none reverse",
          },
        },
      );

      ScrollTrigger.create({
        trigger: el,
        start: "top 60%",
        onEnter: () => setNavColor(NEUTRAL_NAV, null),
        onLeaveBack: () => setNavColor(NEUTRAL_NAV, null),
      });

      return () => disposePointer?.();
    },
    { scope: root },
  );

  return (
    // pt-[14rem]: a nav é fixa e o conteúdo do rodapé passava POR BAIXO dela.
    <footer ref={root} className="relative overflow-hidden bg-coal pt-[14rem]">
      {/* brasa quase apagada subindo do rodapé da página — o último calor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 108%, rgb(184 115 51 / 0.09), transparent 70%)",
        }}
      />

      <div className="relative grid gap-[5rem] px-[6vw] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-[6rem] lg:px-[3.4rem]">
        {/* ---- convite: a declaração e as duas formas de responder ---- */}
        <div>
          <p className="t-micro text-[var(--color-gold)]">Fim da jornada</p>
          {/* NADA de `text-wrap: balance` aqui — ele briga com o splitter.
              O splitter agrupa palavras em linhas medindo `offsetTop` e
              envolve cada linha num bloco com `overflow: hidden` (a máscara
              de onde as letras sobem). O balance rebalanceia DEPOIS dessa
              medida, e o que muda de linha fica cortado pela máscara da
              antiga — visto em captura: "A próxima xícara é" com o fim
              sumindo. A quebra se controla pela largura, não pelo balance. */}
          <h2 className="t-huge mt-[1.6rem] max-w-[11ch]" data-reveal="fadeup">
            A próxima xícara é <em className="voice">sua</em>.
          </h2>

          <div className="mt-[3rem] flex flex-wrap items-center gap-[2.4rem]">
            <a
              href={wa("Olá, TERRAL! Quero falar sobre café ☕")}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="btn-solid btn-lux"
            >
              <span>Chamar no WhatsApp</span>
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </a>

            {/* O botão de segurar mora AO LADO do CTA, não sozinho no meio
                de um vazio de 200px — ele é a alternativa silenciosa ao
                convite, e vizinhança é o que conta isso sem legenda. */}
            <HoldButton />
          </div>
        </div>

        {/* ---- os dados da casa, em coluna com filetes ---- */}
        <div className="lg:pt-[0.6rem]">
          {DADOS.map((bloco) => (
            <div
              key={bloco.label}
              className="border-t border-cream/12 py-[1.5rem] first:border-t-0 first:pt-0"
            >
              <p className="t-micro text-cream/40">{bloco.label}</p>
              {bloco.lines.map((line) => (
                <p key={line} className="t-body mt-[0.5rem] text-cream/80">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---- o filete de palavras ----
          t-big e não t-giant: em 11vw as letras eram cortadas ao meio pela
          borda da faixa e sobrava meia-letra. Aqui ele é um FIO que corre,
          não um letreiro. */}
      <div className="relative mt-[4.5rem] border-y border-cream/10 py-[1.6rem]">
        <div aria-hidden className="marquee">
          <div className="marquee-track">
            {[0, 1].map((metade) => (
              <span key={metade} className="marquee-half flex items-center gap-[2.6rem]">
                {PALAVRAS.map((palavra) => (
                  <span key={palavra} className="flex items-center gap-[2.6rem]">
                    <span className="voice text-[2.1rem] text-cream/35">{palavra}</span>
                    <span className="text-[0.7rem] text-[var(--color-gold)]/50">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---- a marca fecha a página do tamanho da página, e foge da mão ----
          SEM `opacity-0` na classe: quem apaga a marca é o `fromTo` abaixo, no
          JS. Com o zero no CSS, quem pede menos movimento (o efeito retorna
          antes de animar) ficava com um vazio de 600px no lugar da assinatura
          da página — visto em captura. Estado inicial mora no JS pra que, se o
          JS não rodar, a marca simplesmente esteja lá. */}
      <div className="footer-mark mt-[3.5rem] w-full px-[3vw]">
        <SvgWord
          text="TERRAL"
          tracking={0.05}
          letterClassName="footer-letter"
          onLayout={(l) => {
            markLetters.current = l;
          }}
          title="TERRAL"
        />
      </div>

      <div className="relative flex flex-wrap items-baseline justify-between gap-[1rem] px-[6vw] py-[2.4rem] lg:px-[3.4rem]">
        <p className="t-micro text-cream/30">
          TERRAL é uma marca fictícia — site-conceito por{" "}
          <a
            href="https://milweb.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="link-under text-[var(--color-gold)]"
          >
            MilWeb
          </a>
        </p>
        {/* Rota da casa acessível também por link: quem navega por teclado
            ou leitor de tela não consegue "segurar" um botão. */}
        <Link href={SECRET} className="t-micro link-under text-cream/25">
          A casa do torrador
        </Link>
      </div>
    </footer>
  );
}
