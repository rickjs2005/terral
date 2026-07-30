"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WHATSAPP = "5533998779375";
const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

const COFFEES = [
  {
    name: "NASCENTE",
    roast: "Torra clara",
    origin: "Caparaó · 1.400 m",
    notes: ["Florais", "Mel", "Cítricos"],
    body: "Xícara delicada e luminosa, pra quem gosta de café que parece chá de flor.",
    price: "46",
    sca: "87",
    scene: "/products/bg-nascente.webp",
    accent: "#a9c17c",
  },
  {
    name: "VERTENTE",
    roast: "Torra média",
    origin: "Mantiqueira de Minas · 1.200 m",
    notes: ["Caramelo", "Nozes", "Casca de laranja"],
    body: "O equilíbrio da casa: doçura de caramelo com acidez de laranja no final.",
    price: "42",
    sca: "85",
    scene: "/products/bg-vertente.webp",
    accent: "#d99a5b",
  },
  {
    name: "VULCÂNICO",
    roast: "Torra escura",
    origin: "Cerrado Mineiro · 1.050 m",
    notes: ["Chocolate amargo", "Caramelo queimado", "Fumo doce"],
    body: "Encorpado e intenso — feito pra atravessar leite, gelo e madrugadas.",
    price: "44",
    sca: "86",
    scene: "/products/bg-vulcanico.webp",
    accent: "#f08a52",
  },
];

/** Glifos de nota de prova — traço 1.5, casados com os ícones da casa. */
function NoteIcon({ note }: { note: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-full w-full",
    viewBox: "0 0 24 24",
  };
  const key = note.split(" ")[0].toLowerCase();
  switch (key) {
    case "florais":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.4" />
          <path d="M12 4.5a2.6 2.6 0 0 1 0 5.2M12 14.3a2.6 2.6 0 0 1 0 5.2M4.5 12a2.6 2.6 0 0 1 5.2 0M14.3 12a2.6 2.6 0 0 1 5.2 0" />
        </svg>
      );
    case "mel":
      return (
        <svg {...common}>
          <path d="M12 3.5c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0c0-3 2-5.5 5-9.5Z" />
        </svg>
      );
    case "cítricos":
    case "casca":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16M4.6 8.2l14.8 7.6M4.6 15.8l14.8-7.6" />
        </svg>
      );
    case "caramelo":
      return (
        <svg {...common}>
          <path d="M7 9h10l-1.4 9a2 2 0 0 1-2 1.7h-3.2a2 2 0 0 1-2-1.7Z" />
          <path d="M9 9a3 3 0 0 1 6 0" />
        </svg>
      );
    case "nozes":
      return (
        <svg {...common}>
          <path d="M8 10c0-3 1.8-5.5 4-5.5S16 7 16 10Z" />
          <path d="M7 10h10c0 5-2.2 9-5 9s-5-4-5-9Z" />
        </svg>
      );
    case "chocolate":
      return (
        <svg {...common}>
          <rect x="5.5" y="5.5" width="13" height="13" rx="1" />
          <path d="M12 5.5v13M5.5 12h13" />
        </svg>
      );
    default: // fumo e afins
      return (
        <svg {...common}>
          <path d="M5 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 4-2M5 10c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 4-2" />
        </svg>
      );
  }
}

/**
 * O showcase — cada café é uma CENA de tela cheia, com a embalagem de
 * protagonista, espelhado no layout aprovado:
 *
 *   · o nome gigante ATRAVESSA a embalagem: uma cópia atrás, uma cópia à
 *     frente recortada por clip-path — a metade de baixo das letras passa
 *     na frente do pacote e a profundidade aparece na hora;
 *   · a foto do produto vira "recorte com luz própria" via máscara radial —
 *     a cena dela some nas bordas e sobra o pacote no spotlight;
 *   · a embalagem FLUTUA (loop de 8s, quase imperceptível), gira uns graus
 *     com o scroll e recebe um REFLEXO que acompanha o mouse;
 *   · o preço é peça gráfica: R$ pequeno, numeral vazado em t-mega;
 *   · grãos reais na mesa e grãos desfocados na frente da lente.
 *
 * Cinco planos: fundo → nome → embalagem → nome recortado → grãos na lente.
 */
export function Coffees() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wide = window.matchMedia("(min-width: 992px)").matches;
      if (reduce || !wide) return;

      for (const stage of gsap.utils.toArray<HTMLElement>(".coffee-stage")) {
        const q = gsap.utils.selector(stage);

        // O fundo é SÓ atmosfera — o corte do object-cover pode variar com a
        // proporção da tela sem quebrar nada, porque a composição (pacote,
        // nome, coluna) é posicionada por código. Lição de uma captura real
        // em 2:1: composição dentro de foto gerada não sobrevive a crop.
        gsap.fromTo(
          q(".stage-media"),
          { scale: 1.05 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );

        // A embalagem entra girada e sai girando pro outro lado — a
        // continuidade entre um café e o próximo.
        gsap.fromTo(
          q(".pack-scroll"),
          { rotate: -3, y: "3svh" },
          {
            rotate: 2.2,
            y: "-3svh",
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );

        // o nome anda MENOS que a embalagem (camada de trás, parallax real)
        gsap.fromTo(
          q(".pack-name"),
          { y: "1.5svh" },
          {
            y: "-1.5svh",
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );

        // e os grãos na frente da lente andam MAIS (camada da frente)
        q(".stage-fore").forEach((bean, i) => {
          gsap.fromTo(
            bean,
            { y: "6svh" },
            {
              y: `-${9 + i * 4}svh`,
              ease: "none",
              scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 1 },
            },
          );
        });

        // O reflexo de vitrine: o brilho na embalagem segue a mão.
        let frame = 0;
        stage.addEventListener(
          "pointermove",
          (event: PointerEvent) => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
              frame = 0;
              const r = stage.getBoundingClientRect();
              stage.style.setProperty("--shx", String((event.clientX - r.left) / r.width));
            });
          },
          { passive: true },
        );
      }
    },
    { scope: root },
  );

  return (
    <section ref={root} id="cafes" className="relative bg-coal" aria-labelledby="cafes-title">
      <div className="flex items-baseline justify-between px-[6vw] pt-[10rem] pb-[4rem] lg:px-[3.4rem]">
        <p className="t-micro text-[var(--color-gold)]">Os cafés</p>
        <h2 id="cafes-title" className="t-micro text-cream/40">
          Três torras, três destinos · 250 g
        </h2>
      </div>

      {COFFEES.map((coffee, index) => (
        <article
          key={coffee.name}
          className="coffee-stage relative h-[150svh]"
          style={{ "--chapter-accent": coffee.accent } as React.CSSProperties}
        >
          <h3 className="sr-only">
            {coffee.name} — {coffee.roast}, {coffee.origin}. {coffee.body} Notas:{" "}
            {coffee.notes.join(", ")}. R$ {coffee.price} os 250 g.
          </h3>

          <div className="sticky top-0 h-[100svh] overflow-hidden">
            {/* A CENA É UMA FOTOGRAFIA SÓ — mesa, grãos, fumaça, luz e
                pacote na mesma imagem. O nome entra ENTRE a cena e uma
                cópia do MESMO pacote recortada da MESMA foto: com os dois
                em registro 1:1 (mesmo corte, mesmo cover), o pacote oculta
                as letras naturalmente — profundidade sem colagem. */}
            {/* plano 1 — o fundo de atmosfera (mesa, grãos, fumaça, luz;
                SEM pacote — o crop pode variar à vontade) */}
            <div className="stage-media absolute inset-0">
              <Image
                src={coffee.scene}
                alt=""
                aria-hidden
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>

            {/* plano 2 — o nome, atrás do pacote */}
            <p
              aria-hidden
              data-reveal="fadeup"
              className="pack-name z-[1]"
              // corpo por comprimento: o nome deve ENCOSTAR nas margens,
              // nunca estourar — VULCÂNICO tem 9 glifos, NASCENTE 8
              style={{ color: coffee.accent, fontSize: coffee.name.length > 8 ? "12.6rem" : "14.2rem" }}
            >
              {coffee.name}
            </p>

            {/* sombra de chão — ancora o pacote na mesa do fundo */}
            <div
              aria-hidden
              className="absolute bottom-[-1svh] left-[36%] z-[1] h-[4.5rem] w-[24rem] -translate-x-1/2 rounded-[50%]"
              style={{ background: "radial-gradient(50% 50% at 50% 50%, rgb(0 0 0 / 0.55), transparent 70%)", filter: "blur(8px)" }}
            />

            {/* plano 3 — o pacote, posicionado por CÓDIGO: tamanho e lugar
                exatos em qualquer proporção de tela. O posicionador centra
                por CSS; o giro do scroll vive num filho (o GSAP sobrescreve
                transform — camadas separadas ou nada). */}
            <div className="absolute bottom-[-6svh] left-[36%] z-[2] -translate-x-1/2">
              <div className="pack-scroll">
                <div className="pack-float">
                  {/* O pacote é um SUBSTRATO em branco e a tipografia é
                      composta aqui, no navegador.
                      Três rodadas tentando o rótulo pela IA deram "TERRAA",
                      "CORE COFFEES" e "NON ELARRKV" — modelo de imagem não
                      escreve. Assim a marca sai na fonte da casa, nítida em
                      qualquer resolução, e a embalagem é a MESMA nos três
                      cafés (que é o correto: uma linha, três torras). */}
                  <div className="relative w-fit">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/products/pack.webp"
                      alt={`Embalagem do café ${coffee.name}`}
                      className="h-[66svh] w-auto"
                      // luz vem da ESQUERDA nos fundos → sombra cai pra direita
                      style={{ filter: "drop-shadow(1.8rem 1.2rem 2.6rem rgb(0 0 0 / 0.5))" }}
                    />

                    {/* o rótulo: posições em % da caixa do pacote, então
                        acompanham qualquer altura de viewport */}
                    <div aria-hidden className="pointer-events-none absolute inset-0">
                      {/* O texto inventado pela IA já foi apagado NA IMAGEM
                          (faixas limpas do próprio saco clonadas por cima) —
                          véu em CSS deixava fantasma nas bordas. */}
                      <p
                        className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                        style={{
                          top: "23%",
                          fontFamily: "var(--font-display)",
                          fontWeight: 500,
                          fontSize: "clamp(0.9rem, 4.4cqw, 3rem)",
                          letterSpacing: "0.14em",
                          color: "#efe6d6",
                        }}
                      >
                        TERRAL
                      </p>
                      <p
                        className="t-micro absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                        style={{ top: "71%", color: coffee.accent, letterSpacing: "0.3em" }}
                      >
                        {coffee.name}
                      </p>
                      <p
                        className="t-micro absolute left-1/2 -translate-x-1/2 text-center"
                        style={{ top: "84%", color: "#2a1c12", letterSpacing: "0.24em", fontSize: "0.5rem" }}
                      >
                        250 g
                      </p>
                    </div>

                    {/* o reflexo que segue o mouse, mascarado pelo alfa do
                        próprio pacote — a lâmina só existe onde ele existe */}
                    <div
                      aria-hidden
                      className="pack-sheen"
                      style={
                        {
                          WebkitMaskImage: "url(/products/pack.webp)",
                          maskImage: "url(/products/pack.webp)",
                          WebkitMaskSize: "100% 100%",
                          maskSize: "100% 100%",
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* kicker — em 9svh ele encostava no N do nome (que agora sobe
                até 6svh). Sobe pro topo e vira faixa de cabeçalho. */}
            <p className="t-micro absolute top-[3.4svh] left-[6vw] z-[4] text-cream/60 lg:left-[3.4rem]">
              {coffee.roast} · {coffee.origin} · SCA {coffee.sca}
            </p>

            {/* PLANO 4½ — a coluna de leitura.
                Ancorada em 46svh, NÃO centrada na viewport: centrar fazia a
                coluna subir até o meio da tela e cair em cima do nome (o
                nome ocupa de 12svh a ~32svh). A regra da cena é faixa
                vertical — nome no terço de cima, leitura do meio pra baixo,
                e as duas nunca se cruzam em nenhuma proporção de tela. */}
            <div className="absolute top-[40svh] right-[6vw] z-[4] flex w-[24rem] flex-col gap-[1.6rem] lg:right-[3.4rem]">
              <p className="t-lead text-cream/85">{coffee.body}</p>

              <ul className="flex items-stretch">
                {coffee.notes.map((note, i) => (
                  <li
                    key={note}
                    className={`flex flex-1 flex-col items-center gap-[0.7rem] px-[0.8rem] text-center ${
                      i > 0 ? "border-l border-cream/15" : ""
                    }`}
                  >
                    <span aria-hidden className="h-[1.5rem] w-[1.5rem]" style={{ color: coffee.accent }}>
                      <NoteIcon note={note} />
                    </span>
                    <span className="t-micro text-cream/60">{note}</span>
                  </li>
                ))}
              </ul>

              {/* O preço como peça gráfica. SEM data-reveal aqui: mesmo agora
                  que o splitter preserva as CLASSES dos filhos, ele troca a
                  marcação por spans inline — e este bloco depende do flex
                  entre o "R$" e o numeral pra alinhar pela base. */}
              <div className="flex items-start justify-end gap-[1rem]">
                <span className="t-micro mt-[1.6rem] text-cream/50">R$</span>
                {/* 13,5rem e não t-mega (24rem): o orçamento vertical da
                    coluna é de 40svh até a base, e em t-mega o numeral
                    sozinho comia 24vh a mais do que existe — preço e botão
                    caíam fora da tela (pego pelo teste de caixa). */}
                <span
                  className="t-outline t-nums leading-[0.78]"
                  style={
                    {
                      "--outline": "#d8bc8a",
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "13.5rem",
                      letterSpacing: "-0.04em",
                    } as React.CSSProperties
                  }
                >
                  {coffee.price}
                </span>
              </div>

              <a
                href={wa(`Olá! Quero pedir o café ${coffee.name} (${coffee.roast}) da TERRAL.`)}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="btn-ghost btn-lux self-end text-cream"
              >
                <span>Pedir</span>
                <span className="btn-arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>

            {/* PLANO 5 — grãos na frente da lente (os da mesa são REAIS,
                fotografados na própria cena) */}
            {/* Os dois ficam na METADE ESQUERDA: a direita inteira é a
                faixa de leitura, e um grão borrado por cima de "NOZES"
                (visto em captura real) não é profundidade, é sujeira. */}
            {/* top 30%: em 16% ele cobria o kicker do canto superior */}
            <div aria-hidden className="stage-fore absolute z-[5]" style={{ left: "5%", top: "30%", width: "8rem", filter: "blur(9px)", transform: "rotate(-30deg)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shot/cutout/bean.webp" alt="" loading="lazy" className="w-full" />
            </div>
            <div aria-hidden className="stage-fore absolute z-[5]" style={{ left: "16%", top: "70%", width: "6rem", filter: "blur(12px)", transform: "rotate(40deg)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shot/cutout/bean.webp" alt="" loading="lazy" className="w-full" />
            </div>

            {index === 0 && (
              // canto esquerdo: no centro ele caía sobre a embalagem
              <p aria-hidden className="t-micro absolute bottom-[2.6rem] left-[6vw] z-[4] flex items-center gap-[0.8rem] text-cream/35 lg:left-[3.4rem]">
                Rolar para explorar
                <span className="block">↓</span>
              </p>
            )}
          </div>
        </article>
      ))}

      {/* ---- Clube: split editorial — campo limpo à esquerda, foto sangrando
           à direita. O 39 é o número mais persuasivo do site e tem o tamanho
           da responsabilidade. ---- */}
      <div className="mt-[6rem] grid border-y border-cream/10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col justify-center gap-[1.6rem] px-[6vw] py-[6rem] lg:px-[3.4rem] lg:py-[7rem]">
          <p className="t-micro text-[var(--color-gold)]">Assinatura · Clube TERRAL</p>
          <h3 className="t-huge max-w-[14ch]" data-reveal="fadeup">
            Um microlote diferente por mês.
          </h3>
          <p className="t-body max-w-[38ch] text-cream/60">
            Torrado na <em className="voice text-[var(--color-gold)]">semana do envio</em>, com
            carta de origem, receita de preparo e frete incluso. Cancele quando quiser.
          </p>

          <div className="mt-[2rem] flex flex-wrap items-end gap-[2.8rem]">
            <p className="t-mega t-nums leading-[0.72] text-[var(--color-gold)]">
              <span className="t-micro align-top text-cream/45">R$</span>39
            </p>
            <div className="flex flex-col gap-[1.4rem] pb-[0.6rem]">
              <p className="t-micro text-cream/40">por mês · frete incluso</p>
              <a
                href={wa("Olá! Quero assinar o Clube TERRAL ☕")}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="btn-solid btn-lux w-fit"
              >
                <span>Entrar pro clube</span>
                <span className="btn-arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="relative min-h-[28rem]" data-mask>
          <Image
            src="/products/trio.webp"
            alt="Os três cafés da TERRAL — Nascente, Vertente e Vulcânico"
            fill
            sizes="(max-width: 991px) 100vw, 55vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgb(11 9 8 / 0.96) 0%, rgb(11 9 8 / 0.25) 34%, transparent 60%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
