"use client";

import Image from "next/image";
import { CHAPTERS } from "@/lib/chapters";
import { scrollToId } from "@/lib/scroll";

/**
 * O manifesto — agora um espelho editorial da referência aprovada:
 *
 *   ┌ manchete com sublinhado a pincel ┐  ┌ parágrafo com palavras acesas ┐
 *   │ 01 CAPARAÓ   ⛰ a montanha       │  │ parágrafo de apoio            │
 *   │ 02 TERREIRO  ☀ o sol            │  │ [selo][selo][selo]            │
 *   │ ...                             │  │ foto + carimbo giratório      │
 *   └─────────────────────────────────┘  └───────────────────────────────┘
 *
 * A lista é um índice de verdade: cada linha rola até o capítulo. E cada
 * linha carrega a COR do capítulo — é a primeira vez que a paleta inteira
 * da jornada aparece junta, funcionando como legenda do que vem.
 */

/**
 * Cor de exibição das linhas sobre o fundo carvão. Quase sempre o accent do
 * capítulo serve, mas o do Xícara (#8a4a1c) foi calibrado pro fundo CLARO
 * daquele capítulo — aqui no escuro ele afunda. Vira um cobre mais aceso.
 */
const ROW_COLOR: Record<string, string> = { xicara: "#c98a4b" };

/** Ícones da casa: traço 1.5, sem preenchimento, herdam a cor da linha. */
function ChapterIcon({ id }: { id: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "caparao": // a montanha
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" {...common}>
          <path d="M3 19 L9.5 6 L13.5 13 L16 9.5 L21 19 Z" />
        </svg>
      );
    case "terreiro": // o sol
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
        </svg>
      );
    case "tambor": // o fogo
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" {...common}>
          <path d="M12 3c1 3-4 4.5-4 9a4.5 4.5 0 0 0 9 0c0-2-1-3.5-2-4.5 0 1.5-.8 2.3-1.6 2.6C14.2 8.6 14.6 5.4 12 3Z" />
        </svg>
      );
    case "moenda": // o ponto — círculo pontilhado, a moagem calibrada
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" {...common}>
          <circle cx="12" cy="12" r="7" strokeDasharray="2.2 3.4" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    default: // a xícara
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" {...common}>
          <path d="M4 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z" />
          <path d="M16 9h2a2.5 2.5 0 0 1 0 5h-2" />
        </svg>
      );
  }
}

const PROOFS = [
  {
    key: "arabica",
    title: "100% Arábica",
    sub: "Seleção rigorosa",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
        <path d="M19 5c-9 0-13 5-13 10 0 2 1 4 1 4s.5-3 3-5" />
        <path d="M19 5c0 9-5 13-10 13" />
      </svg>
    ),
  },
  {
    key: "torra",
    title: "Torra da semana",
    sub: "Nunca de estoque",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
        <path d="M12 3c1 3-4 4.5-4 9a4.5 4.5 0 0 0 9 0c0-2-1-3.5-2-4.5 0 1.5-.8 2.3-1.6 2.6C14.2 8.6 14.6 5.4 12 3Z" />
      </svg>
    ),
  },
  {
    key: "origem",
    title: "Matas de Minas",
    sub: "Origem rastreável",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
        <path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z" />
        <circle cx="12" cy="10.5" r="2.2" />
      </svg>
    ),
  },
];

export function Intro() {
  return (
    <section
      id="manifesto"
      className="relative bg-coal px-[6vw] py-[13rem] lg:px-[3.4rem]"
      aria-labelledby="manifesto-title"
    >
      <div className="flex items-baseline justify-between">
        <p className="t-micro text-[var(--color-gold)]">Manifesto</p>
        <p className="t-micro text-cream/30">Desde 2019</p>
      </div>

      <div className="mt-[5rem] grid gap-[6rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)] lg:gap-[5rem]">
        {/* ============ coluna esquerda: manchete + índice ============ */}
        <div>
          {/* t-huge, não t-giant: em 11rem a manchete quebrava em três
              linhas e engolia a coluna inteira — a referência a mantém em
              duas, com o índice logo abaixo como protagonista. */}
          <h2 id="manifesto-title" className="t-huge max-w-[13ch]" data-reveal="fadeup">
            Da mão que colhe à sua.
          </h2>

          {/* O risco de pincel — a única linha "à mão" do site inteiro.
              Por isso ela funciona: tudo o mais é régua. */}
          <svg
            aria-hidden
            viewBox="0 0 320 14"
            fill="none"
            className="mt-[1.6rem] w-[19rem] text-[var(--color-gold)]"
          >
            <path
              d="M4 9 C 60 4, 150 11, 210 7 S 300 5, 316 8"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M40 11.5 C 110 8.5, 200 12.5, 270 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>

          {/* O índice da jornada. Cada linha é um atalho pro capítulo — e
              carrega a cor dele: a paleta inteira apresentada de uma vez. */}
          <ul className="mt-[4.5rem]">
            {CHAPTERS.map((chapter) => (
              <li key={chapter.key} className="border-t border-cream/12 last:border-b">
                <a
                  href={`#${chapter.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(chapter.key);
                  }}
                  // no mobile o rótulo ("A montanha") sai e sobra o ícone: com
                  // ele, o nome em t-big não cabia e as duas colunas se
                  // atropelavam ("CAPARAÓ" por cima de "TANHA")
                  className="intro-row group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-[1.2rem] py-[1.55rem] lg:grid-cols-[4.2rem_minmax(0,1fr)_auto] lg:gap-[1.6rem]"
                  style={{ color: ROW_COLOR[chapter.key] ?? chapter.color.accent }}
                >
                  <span className="t-big t-nums text-cream/25 transition-colors duration-500 group-hover:text-cream/45">
                    {chapter.index}
                  </span>
                  <span className="t-big intro-row-name">{chapter.title}</span>
                  <span className="flex items-center gap-[0.9rem]">
                    <span aria-hidden className="h-[1.15rem] w-[1.15rem] opacity-80">
                      <ChapterIcon id={chapter.key} />
                    </span>
                    <span className="t-micro hidden w-[7.5rem] text-cream/40 transition-colors duration-500 group-hover:text-cream/70 sm:block">
                      {chapter.kicker}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ============ coluna direita: prosa + provas + foto ============ */}
        <div className="flex flex-col gap-[2.6rem] lg:pt-[0.8rem]">
          {/* Sem reveal por palavra AQUI de propósito: o splitter achata o
              conteúdo pra texto puro e apagaria os destaques coloridos —
              que são o ponto deste parágrafo. */}
          <p className="t-lead text-cream/85">
            Não somos uma marca que compra café pronto e cola um rótulo. A
            gente escolhe <em className="voice text-[var(--color-gold)]">talhão</em>,
            acompanha a secagem, escreve a{" "}
            <em className="voice text-[var(--color-gold)]">curva de torra</em> à mão
            e embala no mesmo galpão onde o{" "}
            <em className="voice text-[var(--color-ember)]">fogo</em> acende.
          </p>

          <p className="t-body max-w-[44ch] text-cream/50" data-reveal="write">
            São cinco etapas entre a montanha e a sua mesa. Nenhuma delas
            acontece longe daqui, e nenhuma delas passa de sete dias antes de
            virar a sua manhã.
          </p>

          {/* A régua de provas — três fatos, um contêiner. */}
          <ul className="grid grid-cols-1 overflow-hidden rounded-[0.8rem] border border-cream/12 bg-cream/[0.03] sm:grid-cols-3">
            {PROOFS.map((proof) => (
              <li
                key={proof.key}
                className="flex items-center gap-[1rem] border-b border-cream/12 px-[1.4rem] py-[1.2rem] last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
              >
                <span
                  aria-hidden
                  className="grid h-[2.6rem] w-[2.6rem] shrink-0 place-items-center rounded-full border border-[var(--color-gold)]/35 bg-[var(--color-gold)]/8 p-[0.6rem] text-[var(--color-gold)]"
                >
                  {proof.icon}
                </span>
                <span>
                  <span className="t-cap block font-semibold text-cream/90">{proof.title}</span>
                  {/* NÃO usa t-micro: ele impõe caixa alta e entreletra
                      larga depois do normal-case (cascata, mesma
                      especificidade) e a legenda gritava mais que o
                      título. Aqui ela sussurra, como na referência. */}
                  <span className="mt-[0.25rem] block text-[0.68rem] leading-[1.3] text-cream/40">
                    {proof.sub}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* A foto, com o carimbo girando na quina — o único elemento
              "de selo" do site, e por isso ele mora aqui, no manifesto. */}
          <div className="relative mt-[0.6rem]">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[0.8rem]">
              <Image
                src="/shot/manifesto.webp"
                alt="Xícara de café da TERRAL sobre madeira escura, cercada de grãos torrados e folhas de café."
                fill
                sizes="(max-width: 991px) 92vw, 42rem"
                className="object-cover"
              />
              {/* funde a foto no carvão da página — sem isso ela vira
                  "figura colada", com isso vira janela */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgb(11 9 8 / 0.55) 100%)",
                }}
              />
            </div>

            <div aria-hidden className="seal absolute -right-[1.2rem] -bottom-[1.6rem] h-[8.6rem] w-[8.6rem]">
              <svg viewBox="0 0 120 120" className="seal-spin h-full w-full text-[var(--color-gold)]">
                <defs>
                  <path
                    id="seal-arc"
                    d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
                  />
                </defs>
                <circle cx="60" cy="60" r="57" fill="rgb(11 9 8 / 0.72)" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
                <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
                <text
                  fill="currentColor"
                  fontSize="10.5"
                  fontWeight={800}
                  letterSpacing="2.6"
                  fontFamily="var(--font-sans), sans-serif"
                >
                  <textPath href="#seal-arc" startOffset="0%">
                    DO CAPARAÓ ✦ PARA SUA MESA ✦
                  </textPath>
                </text>
              </svg>
              {/* a folha no miolo não gira junto — carimbo gira, brasão não */}
              <span className="absolute inset-0 grid place-items-center text-[var(--color-gold)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="h-[2.1rem] w-[2.1rem]">
                  <path d="M19 5c-9 0-13 5-13 10 0 2 1 4 1 4s.5-3 3-5" />
                  <path d="M19 5c0 9-5 13-10 13" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
