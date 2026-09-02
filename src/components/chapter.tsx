"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef, useState } from "react";
import { CHAPTERS, NEUTRAL_NAV, type Chapter } from "@/lib/chapters";
import { setNavColor } from "@/lib/nav-color";
import { splitText } from "@/lib/split";
import { SvgWord } from "./svg-word";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* --------------------------------------------------------------------------
   Geometria da faixa. Os três painéis somam 380vw e a seção fica fixada
   enquanto eles passam.

     100vw  abertura — o nome se desenha, o numeral chega
     150vw  miolo editorial — manchete + cluster de fotos com parallax
     130vw  mídia em sangria — mais larga que a tela DE PROPÓSITO, pra sobrar
            deslocamento e a foto poder deslizar depois de abrir

   PRE é a coreografia que acontece com a faixa PARADA, antes do horizontal
   começar. PAUSE é o miolo do movimento onde a faixa PARA DE NOVO enquanto o
   clip-path abre a foto de letterbox pra sangria total.

   Essa parada no meio é o gesto mais característico da referência: sem ela o
   capítulo lê como uma esteira; com ela lê como alguém dirigindo o olho.
   -------------------------------------------------------------------------- */
const PRE = 2200; // px de scroll de coreografia parada
const PAUSE = 1300; // px de scroll com o horizontal congelado

/**
 * Fração do horizontal já percorrida quando a faixa congela.
 *
 * Não é número redondo por acaso: a faixa tem 380vw e a tela 100vw, então o
 * curso total é 280vw. O painel de mídia ocupa de 250vw a 380vw, ou seja, ele
 * cobre a tela inteira a partir de 250vw de curso — 250/280 = 0,893. Parar em
 * 0,90 garante que a pausa (e a abertura do clip-path) aconteça com a foto já
 * ocupando tudo, e ainda sobram 28vw pra ela deslizar depois.
 */
const SPLIT = 0.9;

/** px de scroll -> "segundos" de timeline. Mantém o scrub uniforme. */
const px = (n: number) => n / 1000;

const CLOSED = "polygon(26% 36%, 74% 36%, 74% 58%, 26% 58%)";
const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

/* --------------------------------------------------------------------------
   AS CENAS — uma por capítulo, no nível do layout aprovado da Xícara.

   Mesma gramática pra todas: um OBJETO real recortado pousado no campo, um
   ORNAMENTO de tinta que se desenha (cada capítulo desenha o seu: contornos
   de serra, arcos de sol, calor subindo, anéis de moenda, arabescos), uma
   ATMOSFERA (névoa, feixes, brasas, pó caindo, vapor), o bloco poético e o
   índice da jornada. Tudo dirigido pela MESMA timeline do capítulo — as
   classes .ch-flourish/.x-cup/.x-bean são alvos dela; nada aqui tem
   ScrollTrigger próprio.
   -------------------------------------------------------------------------- */

type SceneSpec = {
  /** traços do ornamento (viewBox 1200×600) */
  strokes: string[];
  /** recorte principal e onde ele pousa */
  obj: { src: string; style: React.CSSProperties };
  /** vapor sobre o objeto (só a xícara) */
  steam?: boolean;
  /** recortes desfocados na frente da lente */
  fore: { src: string; style: React.CSSProperties }[];
  /** atmosfera extra */
  air?: "mist" | "rays" | "embers" | "grounds";
  /** bloco poético */
  block: { side: "left" | "right"; icon: string; copy: React.ReactNode };
};

/** ícones de traço (paths 24×24) — os mesmos glifos do índice do manifesto */
const GLYPHS: Record<string, string[]> = {
  caparao: ["M3 19 L9.5 6 L13.5 13 L16 9.5 L21 19 Z"],
  terreiro: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    "M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7",
  ],
  tambor: ["M12 3c1 3-4 4.5-4 9a4.5 4.5 0 0 0 9 0c0-2-1-3.5-2-4.5 0 1.5-.8 2.3-1.6 2.6C14.2 8.6 14.6 5.4 12 3Z"],
  moenda: ["M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"],
  xicara: ["M4 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z", "M16 9h2a2.5 2.5 0 0 1 0 5h-2"],
};

const BEAN = "/shot/cutout/bean.webp";

const SCENES: Record<string, SceneSpec> = {
  caparao: {
    // contornos de serra + o sol pequeno da manhã
    strokes: [
      "M0,380 C200,300 340,340 520,260 S900,180 1200,240",
      "M0,470 C260,410 520,450 780,380 S1080,320 1200,350",
      "M0,300 C180,250 320,280 460,220 S760,140 980,170",
      "M980,110 a46,46 0 1 1 0.1,0",
    ],
    obj: { src: "/shot/cutout/branch.webp", style: { left: "3vw", bottom: "-3vh", width: "27rem", transform: "rotate(6deg)" } },
    fore: [
      { src: "/shot/cutout/branch.webp", style: { right: "8%", top: "6%", width: "9rem", filter: "blur(10px)", transform: "rotate(-30deg)" } },
      { src: "/shot/cutout/branch.webp", style: { right: "-2%", top: "62%", width: "12rem", filter: "blur(7px)", transform: "rotate(160deg)" } },
    ],
    air: "mist",
    block: {
      side: "right",
      icon: "caparao",
      copy: (
        <>
          Tudo começa a 1.400 metros, onde a noite é fria e o fruto{" "}
          <em className="voice">não tem pressa</em>. A altitude escreve a acidez —
          o resto é paciência.
        </>
      ),
    },
  },
  terreiro: {
    // arcos do sol a pino, com raios curtos
    strokes: [
      "M240,100 A420,420 0 0 1 960,100",
      "M340,150 A300,300 0 0 1 860,150",
      "M600,-10 L600,60",
      "M430,10 L455,72",
      "M770,10 L745,72",
      "M290,60 L335,110",
      "M910,60 L865,110",
    ],
    obj: { src: "/shot/cutout/scoop.webp", style: { right: "5vw", bottom: "-2vh", width: "27rem", transform: "rotate(-4deg)" } },
    fore: [
      { src: BEAN, style: { left: "10%", top: "10%", width: "6.5rem", filter: "blur(10px) sepia(0.4)", transform: "rotate(-20deg)" } },
      { src: BEAN, style: { left: "44%", top: "82%", width: "9rem", filter: "blur(6px) sepia(0.4)", transform: "rotate(60deg)" } },
    ],
    air: "rays",
    block: {
      side: "left",
      icon: "terreiro",
      copy: (
        <>
          Três semanas de <em className="voice">sol e rodo</em>, camada fina,
          volta a volta. O terreiro é onde o café aprende a guardar açúcar.
        </>
      ),
    },
  },
  tambor: {
    // calor subindo — três colunas de ar quente
    strokes: [
      "M220,540 C180,440 280,400 240,300 S280,180 240,90",
      "M610,560 C570,460 670,420 630,320 S670,200 630,110",
      "M990,540 C950,440 1050,400 1010,300 S1050,180 1010,90",
      "M420,520 C400,460 460,430 440,370",
      "M810,520 C790,460 850,430 830,370",
    ],
    obj: { src: "/shot/cutout/trier.webp", style: { left: "7vw", bottom: "11vh", width: "26rem", transform: "rotate(-10deg)" } },
    fore: [
      { src: BEAN, style: { right: "12%", top: "8%", width: "7rem", filter: "blur(9px)", transform: "rotate(-40deg)" } },
      { src: BEAN, style: { right: "36%", top: "76%", width: "10rem", filter: "blur(6px)", transform: "rotate(20deg)" } },
    ],
    air: "embers",
    block: {
      side: "right",
      icon: "tambor",
      copy: (
        <>
          Onze minutos entre o verde e o ponto. O primeiro crack avisa, a mão
          decide — é aqui que <em className="voice">o sabor se escreve</em>.
        </>
      ),
    },
  },
  moenda: {
    // anéis da moenda — o movimento circular do capítulo
    strokes: [
      "M600,300 m-90,0 a90,90 0 1 1 180,0 a90,90 0 1 1 -180,0",
      "M600,300 m-170,0 a170,170 0 1 1 340,0 a170,170 0 1 1 -340,0",
      "M600,300 m-250,0 a250,250 0 1 1 500,0 a250,250 0 1 1 -500,0",
      "M600,300 m-330,0 a330,330 0 1 1 660,0 a330,330 0 1 1 -660,0",
    ],
    obj: { src: "/shot/cutout/grinder.webp", style: { right: "5vw", bottom: "-2vh", width: "25rem" } },
    fore: [
      { src: BEAN, style: { left: "8%", top: "12%", width: "6rem", filter: "blur(11px)", transform: "rotate(30deg)" } },
      { src: BEAN, style: { left: "40%", top: "84%", width: "9.5rem", filter: "blur(6px)", transform: "rotate(-55deg)" } },
      { src: BEAN, style: { left: "-2%", top: "60%", width: "8rem", filter: "blur(9px)", transform: "rotate(80deg)" } },
    ],
    air: "grounds",
    block: {
      side: "left",
      icon: "moenda",
      copy: (
        <>
          Moer é abrir o aroma, e aroma aberto{" "}
          <em className="voice">não espera</em>. Por isso a moenda só gira
          depois do seu pedido.
        </>
      ),
    },
  },
  xicara: {
    strokes: [
      "M80,420 C120,180 420,120 560,240 S540,470 380,450 S300,300 480,260 S850,190 1020,150",
      "M140,470 C450,560 800,520 1120,380",
      "M950,120 C1010,80 1080,110 1060,170 S970,210 990,150",
      "M60,220 C300,300 700,360 1150,240",
      "M320,140 C360,100 430,110 420,160 S350,200 340,150",
    ],
    obj: { src: "/shot/cutout/cup.webp", style: { right: "6vw", bottom: "-2vh", width: "30rem" } },
    steam: true,
    fore: [
      { src: BEAN, style: { left: "13%", top: "5%", width: "7.5rem", filter: "blur(9px)", transform: "rotate(-24deg)" } },
      { src: BEAN, style: { left: "-1%", top: "56%", width: "5rem", filter: "blur(13px)", transform: "rotate(40deg)" } },
      { src: BEAN, style: { left: "48%", top: "80%", width: "10rem", filter: "blur(6px)", transform: "rotate(-70deg)" } },
    ],
    block: {
      side: "left",
      icon: "xicara",
      copy: (
        <>
          Depois de um caminho longo e cuidadoso, chegamos ao que realmente
          importa. É na xícara que <em className="voice">tudo se revela</em>.
          Aroma, sabor, história e tempo. Da mão que colhe à sua.
        </>
      ),
    },
  },
};

const INDEX = ["01", "02", "03", "04", "05"];

function ChapterScene({ chapter }: { chapter: Chapter }) {
  const scene = SCENES[chapter.key];
  if (!scene) return null;
  const accent = chapter.color.accent;

  return (
    // Desktop-only: a cena é composição de palco; empilhada no mobile ela
    // só atrapalharia a leitura.
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {/* o ornamento, desenhado pela timeline POR CIMA das letras */}
      <svg className="ch-flourish z-[2]" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        {scene.strokes.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>

      {/* atmosfera própria */}
      {scene.air === "mist" && (
        <>
          <div className="mist" style={{ top: "22%", "--mist-dur": "24s" } as React.CSSProperties} />
          <div className="mist" style={{ top: "58%", "--mist-dur": "32s" } as React.CSSProperties} />
        </>
      )}
      {scene.air === "rays" && <div className="sun-rays" />}
      {scene.air === "embers" &&
        [
          { left: "22%", top: "78%", dur: "5s", delay: "0s", peak: 0.7 },
          { left: "48%", top: "84%", dur: "6.5s", delay: "1.4s", peak: 0.6 },
          { left: "70%", top: "80%", dur: "5.5s", delay: "3s", peak: 0.65 },
          { left: "34%", top: "88%", dur: "7s", delay: "2.2s", peak: 0.5 },
          { left: "84%", top: "86%", dur: "6s", delay: "4.2s", peak: 0.55 },
        ].map((ember, i) => (
          <span
            key={i}
            className="mote"
            style={
              {
                left: ember.left,
                top: ember.top,
                width: "0.24rem",
                height: "0.24rem",
                "--mote-dur": ember.dur,
                "--mote-delay": ember.delay,
                "--mote-peak": ember.peak,
                "--mote-drift": "0.6rem",
              } as React.CSSProperties
            }
          />
        ))}
      {scene.air === "grounds" &&
        [
          { left: "30%", top: "18%", dur: "8s", delay: "0s" },
          { left: "52%", top: "10%", dur: "10s", delay: "2s" },
          { left: "68%", top: "22%", dur: "9s", delay: "4.5s" },
          { left: "42%", top: "30%", dur: "11s", delay: "1.2s" },
        ].map((grain, i) => (
          <span
            key={i}
            className="mote-fall"
            style={
              {
                left: grain.left,
                top: grain.top,
                width: "0.18rem",
                height: "0.18rem",
                "--mote-dur": grain.dur,
                "--mote-delay": grain.delay,
                "--mote-peak": 0.4,
              } as React.CSSProperties
            }
          />
        ))}

      {/* a marca no topo */}
      <div className="absolute top-[1.7rem] left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-[0.55rem]">
        <span className="block h-[0.55rem] w-[0.55rem] rotate-45" style={{ background: accent }} />
        <span className="t-micro ink-soft" style={{ letterSpacing: "0.34em" }}>
          Terral
        </span>
      </div>

      {/* o bloco poético */}
      <div
        className={`absolute bottom-[13vh] z-[3] max-w-[24rem] ${
          scene.block.side === "left" ? "left-[6vw]" : "right-[6vw] text-right"
        }`}
      >
        <div
          className={`flex items-center gap-[0.8rem] ${scene.block.side === "right" ? "justify-end" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[1.1rem] w-[1.1rem]"
          >
            {GLYPHS[scene.block.icon].map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
          <p className="t-micro" style={{ color: accent }}>
            {chapter.kicker}
          </p>
        </div>
        <p className="t-body ink-soft mt-[1.1rem]">{scene.block.copy}</p>
      </div>

      {/* o objeto da cena */}
      <div className="x-cup z-[2]" style={scene.obj.style}>
        {scene.steam && (
          <>
            <span className="steam-wisp" style={{ left: "30%", top: "-46%", "--steam-dur": "8s", "--steam-peak": 0.55 } as React.CSSProperties} />
            <span className="steam-wisp" style={{ left: "48%", top: "-58%", "--steam-dur": "11s", "--steam-delay": "2.5s", "--steam-peak": 0.4 } as React.CSSProperties} />
            <span className="steam-wisp" style={{ left: "16%", top: "-34%", "--steam-dur": "9.5s", "--steam-delay": "5s", "--steam-peak": 0.3 } as React.CSSProperties} />
          </>
        )}
        {/* img crua, não next/image: recorte com alpha, dimensão fluida e
            drop-shadow — o pipeline de otimização não ajuda aqui */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scene.obj.src} alt="" loading="lazy" />
      </div>

      {/* recortes na frente da lente */}
      {scene.fore.map((item, i) => (
        <div key={i} className="x-bean z-[4]" style={{ ...item.style, width: undefined }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt="" loading="lazy" style={{ width: item.style.width }} />
        </div>
      ))}

      {/* o índice da jornada */}
      <div className="x-index z-[3]">
        {INDEX.map((n) =>
          n === chapter.index ? (
            <span
              key={n}
              className="t-micro t-nums grid h-[2.1rem] w-[2.1rem] place-items-center rounded-full border"
              style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 55%, transparent)` }}
            >
              {n}
            </span>
          ) : (
            <span key={n} className="t-micro ink-faint t-nums">
              {n}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

/**
 * O bloco poético da cena, na versão empilhada. No desktop ele vive dentro
 * da composição de palco (ChapterScene, `hidden lg:block`); aqui ele fecha
 * o painel de abertura — o glifo do capítulo e duas frases, logo acima do
 * rótulo do numeral.
 */
function ScenePoem({ chapter }: { chapter: Chapter }) {
  const scene = SCENES[chapter.key];
  if (!scene) return null;
  const accent = chapter.color.accent;
  return (
    <div aria-hidden className="chm-rise mb-[2rem] max-w-[30ch] lg:hidden">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.2rem] w-[1.2rem]"
      >
        {GLYPHS[scene.block.icon].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <p className="t-body ink-soft mt-[0.9rem]">{scene.block.copy}</p>
    </div>
  );
}

/**
 * O corredor de cinema, empilhado. A manchete de três linhas, a parede
 * aberta em sangria, o corpo que se escreve no scroll e a parede do
 * processo deslocada pra direita — a mesma sequência do travelling, lida de
 * cima pra baixo. Tudo `lg:hidden`: no desktop a legenda flutua sobre as
 * paredes dirigida pela timeline, e as duas versões nunca coexistem.
 */
function ChapterMobileEditorial({ chapter }: { chapter: Chapter }) {
  const { color, images } = chapter;
  return (
    <div aria-hidden className="w-full pt-[5rem] pb-[6rem] lg:hidden">
      <div className="chm-rise">
        <p className="t-micro ink-soft">
          {chapter.index} / 05 — {chapter.kicker}
        </p>
        <div className="mt-[1.6rem]">
          {chapter.headline.lines.map((line, i) => (
            <p
              key={line}
              className="chm-head"
              // sobre o campo de cor (e não sobre foto, como no desktop) a
              // tinta do capítulo é a régua certa — na Xícara ela é escura
              style={{ color: i === chapter.headline.hot ? color.accent : "inherit" }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* ATO 1 — plano aberto, em sangria */}
      <figure className="chm-wall chm-rise -mx-[6vw] mt-[3.2rem] aspect-[4/5]">
        <Image
          src={images.cluster[chapter.wall.wide]}
          alt={images.alt.cluster[chapter.wall.wide]}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(0 0 0 / 0.5) 0%, rgb(0 0 0 / 0.1) 40%, transparent 65%)",
          }}
        />
      </figure>

      <p className="t-lead ink mt-[2.6rem] max-w-[32ch]" data-reveal="write">
        {chapter.lead}
      </p>

      {/* ATO 2 — o processo, deslocado: a assimetria é o que impede a
          sequência de virar galeria */}
      <figure className="chm-wall chm-rise mt-[3.2rem] ml-[14vw] -mr-[6vw] aspect-[3/4]">
        <Image
          src={images.cluster[chapter.wall.mid]}
          alt={images.alt.cluster[chapter.wall.mid]}
          fill
          sizes="86vw"
          className="object-cover"
        />
      </figure>
    </div>
  );
}

export function ChapterSection({ chapter, first }: { chapter: Chapter; first?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [titleReady, setTitleReady] = useState(false);
  const letters = useRef<SVGTextElement[]>([]);

  // O véu do fim do capítulo adota a cor de quem VEM — depois do último, a
  // página volta pro carvão das seções de produto.
  const at = CHAPTERS.findIndex((c) => c.key === chapter.key);
  const nextBg = CHAPTERS[at + 1]?.color.bg ?? "#0b0908";

  useGSAP(
    () => {
      const section = root.current;
      if (!section || !titleReady) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wide = window.matchMedia("(min-width: 992px)").matches;

      const q = gsap.utils.selector(section);
      const media = q(".ch-media")[0];
      const video = q("video")[0] as HTMLVideoElement | undefined;

      /**
       * Cola o src só quando a seção se aproxima. Sem isto, cinco vídeos em
       * sangria disputam banda no primeiro quadro da página.
       */
      const attachVideo = () => {
        if (!video?.dataset.src) return;
        video.src = video.dataset.src;
        delete video.dataset.src;
        video.load();
      };

      /** Autoplay pode ser recusado; o poster já cobre esse caso. */
      const playVideo = () => {
        video?.play().catch(() => {});
      };

      // Empilhado (mobile / sem movimento): sem pin, sem faixa. Cada bloco
      // entra por conta própria e o conteúdo continua todo lá.
      if (reduce || !wide) {
        gsap.set(media, { clipPath: "none" });
        gsap.set(q(".ch-stats"), { yPercent: 0, opacity: 1 });
        gsap.set(letters.current, { fillOpacity: 1, strokeDashoffset: 0 });
        gsap.set(q(".ch-digit"), { yPercent: 0 });
        // empilhado, o véu vira uma emenda estática entre as seções
        gsap.set(q(".chapter-veil"), { opacity: 1 });
        // a legenda do travelling não existe empilhada (é `hidden lg:block`),
        // mas sem movimento no desktop ela precisa nascer visível
        gsap.set([...q(".ch-headline"), ...q(".ch-leadbox")], { opacity: 1 });

        if (!reduce) {
          // Os blocos da versão empilhada sobem uma vez ao entrar — o único
          // gesto de entrada do capítulo no mobile, barato e sem scrub.
          for (const el of q(".chm-rise")) {
            gsap.fromTo(
              el,
              { y: 28, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 1.1,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              },
            );
          }

          // Sem pin não há timeline pra tingir a nav — sem isto ela ficava
          // creme por cima do campo creme da Xícara.
          const nextColor = CHAPTERS[at + 1]?.color.nav ?? NEUTRAL_NAV;
          const prevColor = CHAPTERS[at - 1]?.color.nav ?? NEUTRAL_NAV;
          ScrollTrigger.create({
            trigger: section,
            start: "top 3rem",
            end: "bottom 3rem",
            onEnter: () => setNavColor(chapter.color.nav, chapter.key),
            onEnterBack: () => setNavColor(chapter.color.nav, chapter.key),
            onLeave: () => setNavColor(nextColor, CHAPTERS[at + 1]?.key ?? null),
            onLeaveBack: () => setNavColor(prevColor, CHAPTERS[at - 1]?.key ?? null),
          });
        }

        // Sem movimento: fica no poster. Movimento é justamente o que a
        // pessoa pediu pra não ter.
        if (!reduce && video) {
          ScrollTrigger.create({
            trigger: video,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => {
              attachVideo();
              playVideo();
            },
            onEnterBack: playVideo,
            onLeave: () => video.pause(),
            onLeaveBack: () => video.pause(),
          });
        }
        return;
      }

      const track = q(".chapter-track")[0] as HTMLElement;
      const overflow = track.scrollWidth - window.innerWidth;
      if (overflow <= 0) return;

      const A = overflow * SPLIT;
      const B = overflow - A;
      const total = PRE + A + PAUSE + B;

      // Contorno estimado pela largura do glifo — <text> não expõe
      // getTotalLength(). O dash reinicia a cada contorno, então o traço
      // entra por vários pontos: lê como estêncil sendo pintado.
      for (const letter of letters.current) {
        const len = letter.getComputedTextLength() * 3.2;
        gsap.set(letter, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
      }
      gsap.set(media, { clipPath: CLOSED });

      // Vizinhos: ao sair, a nav já adota a cor de quem vem — assim ela
      // troca uma vez por transição, não duas.
      const nextColor = CHAPTERS[at + 1]?.color.nav ?? NEUTRAL_NAV;
      const prevColor = CHAPTERS[at - 1]?.color.nav ?? NEUTRAL_NAV;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${total}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => setNavColor(chapter.color.nav, chapter.key),
          onEnterBack: () => setNavColor(chapter.color.nav, chapter.key),
          onLeave: () => setNavColor(nextColor, CHAPTERS[at + 1]?.key ?? null),
          onLeaveBack: () => setNavColor(prevColor, CHAPTERS[at - 1]?.key ?? null),
          // Toca a partir do ponto em que o painel de mídia entra em cena, e
          // pausa ao voltar. Amarrado ao progresso (e não a um `.call()` na
          // timeline) porque com scrub o usuário atravessa o mesmo ponto nos
          // dois sentidos, e progresso funciona igual nos dois.
          onUpdate: (self) => {
            if (!video) return;
            const onScreen = self.progress > (PRE + A * 0.7) / total;
            if (onScreen && video.paused) playVideo();
            else if (!onScreen && !video.paused) video.pause();
          },
        },
      });

      // Pré-carga: começa a baixar quando a seção ainda está uma tela abaixo.
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        once: true,
        onEnter: attachVideo,
      });

      /* ---- 1. coreografia parada -------------------------------------- */
      tl.to(
        letters.current,
        {
          strokeDashoffset: 0,
          fillOpacity: 1,
          duration: px(900),
          stagger: px(150),
          ease: "power2.inOut",
        },
        0,
      )
        // os dígitos chegam de direções OPOSTAS — é o que impede o numeral
        // de parecer um contador e o faz parecer placar
        .fromTo(
          q(".ch-digit"),
          { yPercent: (i: number) => (i % 2 === 0 ? -125 : 125) },
          { yPercent: 0, duration: px(750), stagger: px(110), ease: "power3.out" },
          px(1050),
        )
        .fromTo(
          q(".ch-hero-label"),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: px(600), ease: "power2.out" },
          px(1500),
        )
        .to(q(".ch-title"), { opacity: 0, duration: px(550), ease: "power2.in" }, px(1750));

      /* ---- 1b. camadas da cena (XÍCARA) e paralaxe de fundo ------------ */

      // Os arabescos se desenham como tinta, entrando por vários pontos.
      const flourish = q(".ch-flourish path") as unknown as SVGPathElement[];
      if (flourish.length) {
        for (const path of flourish) {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        }
        tl.to(
          flourish,
          { strokeDashoffset: 0, duration: px(1500), stagger: px(140), ease: "power2.inOut" },
          px(350),
        );
      }

      // A xícara pousa na mesa um instante depois do nome.
      if (q(".x-cup").length) {
        tl.fromTo(
          q(".x-cup"),
          { y: "5rem", opacity: 0 },
          { y: 0, opacity: 1, duration: px(900), ease: "power3.out" },
          px(1100),
        );
      }

      // Grãos na frente da lente: a camada mais próxima anda MAIS que todas
      // as outras — é a regra do parallax de verdade (perto = rápido).
      (q(".x-bean") as HTMLElement[]).forEach((bean, i) => {
        tl.fromTo(
          bean,
          { y: `${4 + i * 3}rem` },
          { y: `-${11 + i * 6}rem`, ease: "none", duration: px(total) },
          0,
        );
      });

      // E o numeral de fundo dos outros capítulos deriva devagar — camada
      // lenta atrás, título parado no meio, poeira na frente.
      if (q(".ch-num-layer").length) {
        tl.fromTo(
          q(".ch-num-layer"),
          { y: 0 },
          { y: "-6rem", ease: "none", duration: px(total) },
          0,
        );
      }

      /* ---- 2. horizontal, primeira metade ------------------------------ */
      tl.to(track, { x: -A, ease: "none", duration: px(A) }, px(PRE));

      // Parallax: contêiner e quadros percorrem distâncias diferentes em
      // tempos diferentes. Essa defasagem de ritmo é o que vira profundidade
      // — custa três linhas e lê como camada.
      //
      // Em rem (que acima de 992px é vw) e não em %: porcentagem aqui é
      // relativa à largura do próprio elemento, e como a faixa é larguíssima
      // isso viraria deslocamento de dezenas de vw e jogaria tudo pra fora.
      tl.fromTo(
        q(".ch-cluster"),
        { x: "4rem" },
        { x: "-6rem", ease: "none", duration: px(A) },
        px(PRE),
      ).fromTo(
        q(".ch-tile"),
        { x: "7rem" },
        {
          x: "-10rem",
          ease: "none",
          // 1,4× o contêiner é o que produz a defasagem — mas limitado ao que
          // ainda cabe na timeline. Em telas muito largas o curso horizontal
          // cresce e 1,4× passaria do fim, esticando a duração total e
          // desalinhando tudo o que vem depois.
          duration: Math.min(px(A) * 1.4, px(total - PRE)),
          stagger: px(70),
        },
        px(PRE),
      );

      // Zoom lento DENTRO de cada recorte, na direção oposta ao parallax.
      // A moldura anda pra um lado, a foto respira pro outro — é a segunda
      // camada de profundidade, e é o que faz o recorte parecer uma janela
      // e não um adesivo.
      tl.fromTo(
        q(".ch-tile img"),
        { scale: 1.18 },
        { scale: 1, ease: "none", duration: px(A), stagger: px(60) },
        px(PRE),
      );

      // Manchete e corpo do corredor. Nada aqui pode usar `data-reveal`:
      // dentro de uma seção fixada o elemento não anda na vertical, então um
      // ScrollTrigger comum dispararia na hora e o scrub ficaria sem curso.
      // Tudo o que vive na faixa é dirigido pela timeline.
      //
      // A manchete são TRÊS elementos .ch-head (as três linhas de cinema) —
      // cada linha sobe por conta própria, em cascata, e a linha "quente"
      // carrega a cor no elemento (o splitter achataria um <span> interno).
      // A manchete ENTRA quando a primeira parede domina a tela e SAI quando
      // ela cede lugar à segunda — janela generosa, sempre inteira.
      const heads = q(".ch-head") as HTMLElement[];
      const headSplits = heads.map((h) => splitText(h, "chars"));
      // 0,36 e não 0,16: a faixa tem ~390vw e o painel 1 ocupa os primeiros
      // 100vw, então em 16% do curso mais de meia tela ainda é o painel de
      // abertura — a manchete caía por cima do índice dele.
      // TODAS as durações da legenda em FRAÇÃO DE A, nunca em px fixo.
      // A janela de leitura é 0,38→0,66 de A; a entrada precisa caber no
      // primeiro quinto dela. Com passo fixo em px, num curso horizontal
      // maior a 3ª linha ainda subia atrás da máscara quando o fade-out já
      // tinha começado — e se lia "ol… metade… rabalho" o percurso inteiro.
      // A caixa acende no MESMO ponto em que as letras começam a subir. Havia
      // uma fresta de A*0,02 em que o bloco já estava visível e as letras
      // ainda deitadas atrás da máscara — 99px de scroll de texto invisível.
      tl.to(q(".ch-headline"), { opacity: 1, duration: px(A * 0.008) }, px(PRE + A * 0.375));
      for (const [i, h] of heads.entries()) {
        h.classList.add("is-ready");
        const chars = headSplits[i].chars;
        if (chars.length) {
          tl.fromTo(
            chars,
            { yPercent: 150 },
            {
              yPercent: 0,
              // A entrada inteira (3 linhas + stagger de letras) tem que
              // caber em ~10% da janela de leitura. Medido: com o dobro
              // disso, 23% do percurso amostrado pegava a manchete no meio
              // da subida — letra cortada pela máscara, que é exatamente a
              // meia-palavra reclamada.
              duration: px(A * 0.012),
              stagger: px(A * 0.0005),
              ease: "expo.out",
            },
            px(PRE + A * 0.38) + i * px(A * 0.004),
          );
        }
      }
      tl.to(
        q(".ch-headline"),
        { opacity: 0, y: "-3svh", duration: px(A * 0.03), ease: "power2.in" },
        px(PRE + A * 0.70),
      );
      // SEM blur aqui, de propósito. Blur amarrado a scrub fica parado no
      // meio quando o usuário rola devagar — e texto borrado estático lê
      // como defeito, não como reveal (visto em captura real). O blur vive
      // só nos reveals verticais de tempo (revealFadeUp).

      // O corpo "escreve" palavra a palavra amarrado ao mesmo scroll — agora
      // sobre a parede do segundo ato, mais adiante no corredor.
      // O corpo entra depois, sobre a segunda parede, e sai antes da pausa.
      const lead = q(".ch-lead")[0] as HTMLElement;
      const leadSplit = splitText(lead, "words");
      lead.classList.add("is-ready");
      tl.to(q(".ch-leadbox"), { opacity: 1, duration: px(A * 0.008) }, px(PRE + A * 0.755));
      if (leadSplit.words.length) {
        tl.fromTo(
          leadSplit.words,
          { opacity: 0.14 },
          { opacity: 1, ease: "none", duration: px(A * 0.07), stagger: px(A * 0.002) },
          px(PRE + A * 0.76),
        );
      }
      tl.to(
        q(".ch-leadbox"),
        { opacity: 0, y: "-2svh", duration: px(A * 0.035), ease: "power2.in" },
        px(PRE + A * 0.9),
      );

      /* ---- 3. A PAUSA: o horizontal congela e a foto abre -------------- */
      tl.to(
        media,
        { clipPath: OPEN, duration: px(PAUSE * 0.88), ease: "power2.inOut" },
        px(PRE + A),
      )
        .fromTo(
          q(".ch-media-img"),
          { scale: 1.22 },
          { scale: 1, duration: px(PAUSE), ease: "power2.out" },
          px(PRE + A),
        )
        .fromTo(
          q(".ch-caption"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: px(PAUSE * 0.3), ease: "power2.out" },
          px(PRE + A + PAUSE * 0.45),
        );

      /* ---- 4. horizontal, resto: a foto desliza e os dados sobem ------- */
      tl.to(track, { x: -(A + B), ease: "none", duration: px(B) }, px(PRE + A + PAUSE)).fromTo(
        q(".ch-stats"),
        { yPercent: 120 },
        // Duração amarrada a PAUSE e B, nunca fixa: um valor cravado (1500px)
        // estoura o fim da timeline em telas largas, e como o ScrollTrigger
        // mapeia o scroll pela duração TOTAL, tudo encolhe junto — o
        // horizontal deixa de chegar ao fim dentro do pin. Terminar
        // exatamente em `total` é o que mantém o mapeamento honesto.
        { yPercent: 0, duration: px(PAUSE * 0.35), ease: "power2.out" },
        px(PRE + A + PAUSE * 0.3),
      );

      // Os numerais CONTAM enquanto sobem — só os que são número puro
      // (1400, 232…); os compostos (11'40, 1:16, 4×) ficam como estão.
      // Com scrub, o onUpdate roda nos dois sentidos e o número acompanha
      // o dedo. Tabular nums garantem que nada dança na largura.
      for (const el of q(".ch-stats [data-count]") as HTMLElement[]) {
        const end = parseInt(el.dataset.count!, 10);
        const counter = { v: 0 };
        tl.fromTo(
          counter,
          { v: 0 },
          {
            v: end,
            // A contagem POUSA com folga antes do fim do pin. Medido: com
            // ela terminando junto com o pin, os pontos amostrados pegavam
            // numero no meio do caminho ("528" no lugar de 600) e so o
            // ultimo quadro mostrava o valor certo.
            duration: px(PAUSE * 0.4),
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(counter.v));
            },
          },
          px(PRE + A + PAUSE * 0.35),
        );
      }

      // O véu de virada acende no último trecho: a página inteira começa a
      // ser tingida pela cor do capítulo seguinte antes do pin soltar.
      tl.fromTo(
        q(".chapter-veil"),
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: px(B + PAUSE * 0.2) },
        px(PRE + A + PAUSE * 0.8),
      );

      return () => {
        for (const split of headSplits) split.revert();
        leadSplit.revert();
      };
    },
    { scope: root, dependencies: [titleReady] },
  );

  const { color, images, hero, stats } = chapter;
  const digits = Array.from(hero.value);

  return (
    <section
      ref={root}
      id={chapter.key}
      className="chapter"
      data-chapter={chapter.key}
      aria-labelledby={`${chapter.key}-title`}
      style={
        {
          "--chapter-bg": color.bg,
          "--chapter-ink": color.ink,
          "--chapter-accent": color.accent,
        } as React.CSSProperties
      }
    >
      {/* O conteúdo acessível vive aqui, em prosa contínua e na ordem certa.
          O que está na faixa é a MESMA informação partida em letras, em SVG e
          embaralhada pela composição — bom pro olho, péssimo pra quem lê por
          áudio. Por isso a versão de leitura existe inteira, e não só o
          título. É o ponto onde a referência perde nota e não precisa. */}
      <div className="sr-only">
        <h2 id={`${chapter.key}-title`}>
          {chapter.index} — {chapter.title}: {chapter.heading}
        </h2>
        <p>{chapter.lead}</p>
        <p>{chapter.caption}</p>
        <ul>
          {stats.map((stat) => (
            <li key={stat.label}>
              {stat.label}: {stat.value}
              {stat.unit ?? ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="chapter-track">
        {/* ============ PAINEL 1 — abertura ============ */}
        {/* pt maior no mobile: a nav fixa (≈4rem) cobria o kicker do capítulo */}
        <div className="panel flex flex-col justify-between p-[6vw] pt-[5rem] lg:p-[3.4rem]">
          {/* A poeira do capítulo — seis motes na cor do acento, subindo.
              CSS puro; morre sozinha em prefers-reduced-motion. */}
          {[
            { left: "16%", top: "26%", size: "0.22rem", dur: "10s", delay: "0s", drift: "1.2rem", peak: 0.4 },
            { left: "72%", top: "20%", size: "0.16rem", dur: "13s", delay: "2.2s", drift: "-0.9rem", peak: 0.32 },
            { left: "62%", top: "66%", size: "0.18rem", dur: "11s", delay: "4.5s", drift: "0.8rem", peak: 0.36 },
            { left: "28%", top: "72%", size: "0.15rem", dur: "14s", delay: "1.2s", drift: "-1.1rem", peak: 0.3 },
            { left: "84%", top: "48%", size: "0.2rem", dur: "12s", delay: "6s", drift: "1rem", peak: 0.34 },
            { left: "42%", top: "38%", size: "0.14rem", dur: "15s", delay: "3.4s", drift: "0.6rem", peak: 0.26 },
          ].map((mote, i) => (
            <span
              key={i}
              aria-hidden
              className="mote"
              style={
                {
                  left: mote.left,
                  top: mote.top,
                  width: mote.size,
                  height: mote.size,
                  "--mote-dur": mote.dur,
                  "--mote-delay": mote.delay,
                  "--mote-drift": mote.drift,
                  "--mote-peak": mote.peak,
                } as React.CSSProperties
              }
            />
          ))}
          <div className="flex items-baseline justify-between">
            <p className="t-micro" style={{ color: color.accent }}>
              {chapter.index} — {chapter.kicker}
            </p>
            <p className="t-micro ink-faint">Terral · Jornada</p>
          </div>

          {/* Numeral e nome dividem o mesmo centro óptico, separados só por
              profundidade: o numeral vazado atrás, o nome cheio na frente.
              No XÍCARA o numeral sai de cena — os arabescos assumem o papel
              de camada de fundo, como no layout aprovado. */}
          {chapter.key !== "xicara" && (
            <div className="ch-num-layer pointer-events-none absolute inset-0 flex items-center justify-center">
              <p
                aria-hidden
                className="t-mega t-outline t-nums flex overflow-hidden leading-none"
                style={{ "--outline": color.accent, opacity: 0.55 } as React.CSSProperties}
              >
                {digits.map((digit, i) => (
                  <span key={i} className="ch-digit inline-block">
                    {digit}
                  </span>
                ))}
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[7vw]">
            <div
              className={`ch-title w-full ${chapter.key === "xicara" ? "max-w-[86vw]" : "max-w-[74vw]"}`}
            >
              <SvgWord
                text={chapter.title}
                tracking={0.055}
                strokeWidth={1.4}
                letterClassName="ch-letter"
                onLayout={(l) => {
                  letters.current = l;
                  setTitleReady(true);
                }}
              />
            </div>
          </div>

          <ChapterScene chapter={chapter} />

          <div>
            <ScenePoem chapter={chapter} />
            <div className="flex items-end justify-between gap-8">
              <p className="ch-hero-label t-micro ink-soft max-w-[16rem]">
              {/* o VALOR faz parte do rótulo — "Água na extração · 92 °C".
                  Sem ele, o capítulo que esconde o numeral gigante (XÍCARA)
                  ficava com um rótulo órfão: "· °C" de coisa nenhuma. */}
              {hero.label} · {hero.value}
              {/* normal-case no filho vence o uppercase do pai — sem isso o
                  µ de "µm" vira Μ grego maiúsculo e o rótulo lê "600 MM" */}
              {hero.unit ? <span className="normal-case"> {hero.unit}</span> : null}
              </p>
              <p className="t-micro ink-faint hidden lg:block">Role →</p>
            </div>
          </div>
        </div>

        {/* ============ PAINEL 2 — o corredor de cinema ============
            Nada de recortes flutuando num campo vazio: duas PAREDES de mídia
            de altura inteira, com a tipografia EM CIMA da foto. Junto com o
            vídeo do painel 3, formam os três atos do capítulo: plano aberto
            (contexto) → plano do processo (gente) → sangria em movimento.
            O trilho horizontal é o travelling entre eles. */}
        <div className="panel panel-wide flex items-stretch gap-[6vw] px-[6vw]">
          {/* Só no desktop: empilhado, o cluster nascia com 0px de largura
              (só tem imagens `fill`, sem largura própria) e as duas paredes
              simplesmente não existiam. A versão de leitura vem logo abaixo. */}
          <div className="ch-cluster hidden h-full items-stretch gap-[6vw] lg:flex">
            {/* ATO 1 — plano aberto, com a manchete de três linhas */}
            <figure className="ch-tile ch-wall w-[80vw]">
              <Image
                src={images.cluster[chapter.wall.wide]}
                alt={images.alt.cluster[chapter.wall.wide]}
                fill
                sizes="(max-width: 991px) 100vw, 80vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgb(0 0 0 / 0.66) 0%, rgb(0 0 0 / 0.14) 42%, transparent 68%)",
                }}
              />
            </figure>

            {/* ATO 2 — o processo, com o corpo escrevendo por cima */}
            <figure className="ch-tile ch-wall w-[62vw]">
              <Image
                src={images.cluster[chapter.wall.mid]}
                alt={images.alt.cluster[chapter.wall.mid]}
                fill
                sizes="(max-width: 991px) 100vw, 62vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgb(0 0 0 / 0.72) 0%, rgb(0 0 0 / 0.2) 40%, transparent 65%)",
                }}
              />
            </figure>
          </div>

          <ChapterMobileEditorial chapter={chapter} />
        </div>

        {/* ============ PAINEL 3 — mídia em sangria ============ */}
        <div className="panel panel-media relative">
          <div className="ch-media absolute inset-0 overflow-hidden">
            {/*
              Vídeo com `data-src` em vez de `src`, e `preload="none"`:
              cinco vídeos em sangria carregando de uma vez no load seriam
              dezenas de MB antes do primeiro scroll. O src só é colado
              quando a seção se aproxima (ver o ScrollTrigger de pré-carga).

              O `poster` é a foto do capítulo — então o painel já está certo
              no primeiro quadro, e continua certo se o vídeo falhar, se o
              usuário economizar dados ou se o navegador recusar autoplay.
            */}
            <video
              className="ch-media-img h-full w-full object-cover"
              data-src={images.video}
              poster={images.full}
              aria-label={images.alt.full}
              muted
              loop
              playsInline
              // Só o primeiro capítulo busca os metadados de saída: é o
              // único que o usuário alcança em segundos. Os outros quatro
              // ficam em "none" até a pré-carga do ScrollTrigger.
              preload={first ? "metadata" : "none"}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgb(0 0 0 / 0.72) 0%, rgb(0 0 0 / 0.12) 45%, transparent 70%)",
              }}
            />
          </div>

          {/* Legenda e dados da versão empilhada: no desktop eles vivem fora
              da faixa, presos à tela, e são `hidden lg:block`. Aqui a foto é
              a tela inteira, então cabem nela — legenda no alto, os três
              dados em lista sobre o degradê do pé. */}
          <div
            aria-hidden
            className="absolute inset-0 z-[2] flex flex-col justify-between p-[6vw] pt-[6rem] lg:hidden"
          >
            <p className="chm-rise t-cap max-w-[26ch] text-cream/85">{chapter.caption}</p>
            <ul className="chm-rise">
              {stats.map((stat) => (
                <li
                  key={stat.label}
                  className="flex items-baseline justify-between gap-[1rem] border-t border-cream/20 py-[0.8rem]"
                >
                  <p className="t-micro text-cream/70">{stat.label}</p>
                  <p className="flex items-baseline gap-[0.35rem]">
                    <span
                      className="chm-num t-outline t-nums"
                      style={{ "--outline": color.accent } as React.CSSProperties}
                    >
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span className="t-big normal-case" style={{ color: color.accent }}>
                        {stat.unit}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ============ LEGENDA E DADOS DA MÍDIA ============
          Também FORA da faixa. Estavam dentro do painel de mídia, que tem
          130vw — mais largo que a tela de propósito, pra sobrar deslocamento.
          Resultado: os numerais deslizavam junto com o painel e saíam cortados
          pela esquerda ("528" em vez de 600, o P de "PONTO PADRÃO" comido).
          Aqui eles ficam presos à tela e a foto desliza por baixo. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] hidden lg:block">
        <figcaption className="ch-caption absolute top-[3.4rem] left-[3.4rem] max-w-[22rem] opacity-0">
          <p className="t-cap text-cream/85">{chapter.caption}</p>
        </figcaption>

        {/* Os dados sobem por cima da foto já aberta. Numerais vazados,
            rótulos minúsculos — o contraste de escala é o recurso. */}
        <div
          className={`ch-stats absolute right-[3.4rem] bottom-[3rem] left-[3.4rem] flex items-end justify-between gap-[3rem] ${
            color.blend ? "blend-diff" : ""
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-[0.6rem]">
              <p
                className="t-giant t-outline t-nums"
                style={{ "--outline": color.accent } as React.CSSProperties}
                data-count={/^\d+$/.test(stat.value) ? stat.value : undefined}
              >
                {stat.value}
              </p>
              <div className="pb-[1.2rem]">
                {stat.unit && (
                  // mb: a unidade tem line-height 0,86 e glifos com
                  // descendente (o µ de µm), que passavam por baixo da caixa
                  // e comiam a primeira letra do rótulo ("ONTO PADRÃO")
                  <p className="t-big normal-case mb-[0.55rem]" style={{ color: color.accent }}>
                    {stat.unit}
                  </p>
                )}
                <p className="t-micro whitespace-nowrap text-cream/70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ A LEGENDA DO TRAVELLING ============
          Manchete e corpo vivem AQUI, fora da faixa — a seção está fixada,
          então este bloco é fixo na tela enquanto as paredes de foto passam
          por trás. Coladas na parede, as palavras saíam de cena junto com
          ela e o usuário pegava meia-palavra em quase todo o percurso
          ("ol… metade… rabalho", visto em captura real).
          Câmera anda, letreiro segura: é assim no cinema. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] hidden lg:block">
        <div className="ch-headline absolute bottom-[9svh] left-[6vw] opacity-0 lg:left-[3.4rem]">
          <p className="t-micro mb-[1.6rem] text-cream/70">
            {chapter.index} / 05 — {chapter.kicker}
          </p>
          {chapter.headline.lines.map((line, i) => (
            <p
              key={line}
              className="ch-head"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "7.2rem",
                lineHeight: 0.82,
                letterSpacing: "-0.035em",
                // SEMPRE claro, com scrim escuro atrás (ver .ch-headline::before).
                // A tinta do capítulo é a régua errada aqui: a legenda vive
                // sobre FOTO, e as fotos da Xícara são escuras mesmo com o
                // campo de cor claro — tinta escura sumia nelas.
                color: i === chapter.headline.hot ? color.accent : "#f7f2e8",
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="ch-leadbox absolute right-[6vw] bottom-[11svh] max-w-[30rem] opacity-0 lg:right-[3.4rem]">
          <p className="ch-lead t-body text-cream/95">
            {chapter.lead}
          </p>
        </div>
      </div>

      {/* o véu que tinge o fim do capítulo com a cor do próximo */}
      <div
        aria-hidden
        className="chapter-veil"
        style={{ "--veil": nextBg } as React.CSSProperties}
      />
    </section>
  );
}
