"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { hero } from "@/lib/hero-state";
import { NEUTRAL_NAV } from "@/lib/chapters";
import { setNavColor } from "@/lib/nav-color";
import { GATE_EVENT, scrollToId } from "@/lib/scroll";
import { useMediaQuery } from "@/lib/use-media-query";
import { SvgWord } from "./svg-word";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Fora do bundle inicial: three + R3F pesam, e o portão do loader já cobre
// o tempo que essa importação leva.
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

/**
 * O hero.
 *
 * A abertura é o pó se juntando — não o nome. O nome vem depois, por baixo do
 * grão já formado, e a partir daí RESPIRA: uma escala de 1,2% em ciclo lento.
 * É quase imperceptível de propósito; o que se percebe é que a página está
 * viva mesmo quando ninguém toca nela.
 *
 * No scroll o grão APROXIMA e cresce antes de estilhaçar, como um corte de
 * cinema entrando no próximo plano, enquanto a marca encolhe e sai.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const letters = useRef<SVGTextElement[]>([]);
  const [ready, setReady] = useState(false);
  const mobile = useMediaQuery("(pointer: coarse)");

  useEffect(() => {
    if (!ready) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hero.form = 1; // grão já formado, sem espetáculo
      return;
    }

    const run = () => {
      // 1. o pó se junta, em silêncio
      gsap.to(hero, { form: 1, duration: 2.8, ease: "power2.inOut" });

      // 2. a marca sobe letra a letra, com a entreletra fechando junto —
      //    scaleX no conjunto, e não letter-spacing de verdade, porque o
      //    viewBox do SVG é medido nos glifos e cortaria as letras de fora.
      const mark = gsap.timeline({ delay: 1.9 });
      mark
        .fromTo(".hero-mark", { opacity: 0, scaleX: 1.075 }, {
          opacity: 1,
          scaleX: 1,
          duration: 1.6,
          ease: "expo.out",
        })
        .fromTo(
          letters.current,
          { yPercent: 108 },
          { yPercent: 0, duration: 0.85, stagger: 0.045, ease: "expo.out" },
          0,
        )
        // 3. e passa a respirar. Ciclo longo, amplitude mínima.
        .to(".hero-mark", {
          scale: 1.012,
          duration: 4.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

      gsap.fromTo(
        ".hero-fade",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: "power2.out", delay: 2.5 },
      );
    };

    // Se o portão já abriu antes das letras existirem, entra na hora.
    if (document.querySelector('[data-gate="open"]')) run();
    else window.addEventListener(GATE_EVENT, run, { once: true });
    return () => window.removeEventListener(GATE_EVENT, run);
  }, [ready]);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          hero.target = self.progress;
          if (reduce) hero.value = self.progress; // sem amortecimento
        },
        onEnterBack: () => setNavColor(NEUTRAL_NAV, null),
      });

      if (reduce) return;

      // A marca encolhe e sai enquanto o grão vem pra frente: os dois lados
      // do mesmo corte.
      gsap.to(".hero-mark-wrap", {
        scale: 0.36,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "62% top", scrub: 1 },
      });
      gsap.to(".hero-fade", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "35% top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="topo" className="relative h-[220svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Camada própria pra cena: o canvas precisa de uma caixa com altura
            resolvida, e é aqui que ele recebe o ponteiro. */}
        <div className="absolute inset-0">
          <HeroScene mobile={mobile} />
        </div>

        {/* Rótulos de canto — o contraponto minúsculo que faz a marca
            gigante parecer ainda maior. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-[6vw] lg:p-[3.4rem]">
          <div />
          <div className="flex items-end justify-between gap-[2rem]">
            <p className="hero-fade t-micro max-w-[14rem] text-cream/50 opacity-0">
              Manhuaçu · Minas Gerais
              <br />
              Lotes de 12 kg
            </p>
            <p className="hero-fade t-micro flex items-center gap-[0.8rem] text-cream/35 opacity-0">
              Role
              <span aria-hidden className="block h-px w-[3rem] bg-current" />
            </p>
          </div>
        </div>

        {/* Marca, assinatura e chamada. `pointer-events-none` no bloco pra
            que o grão atrás continue recebendo o cursor — só o botão volta a
            ser clicável. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-[4vw] pb-[3.4rem] lg:px-[3.4rem]">
          <div className="hero-mark-wrap w-[78%] origin-bottom">
            <div className="hero-mark w-full origin-bottom opacity-0">
              <h1 className="sr-only">
                TERRAL — torrefação artesanal de café especial em Manhuaçu, Minas Gerais
              </h1>
              <SvgWord
                text="TERRAL"
                tracking={0.06}
                letterClassName="hero-letter"
                onLayout={(l) => {
                  letters.current = l;
                  setReady(true);
                }}
              />
            </div>
          </div>

          <div className="hero-fade mt-[1.6rem] flex flex-col items-center gap-[1.4rem] opacity-0">
            <p className="t-micro text-center text-cream/45">
              Torrefação artesanal · Matas de Minas
            </p>
            <a
              href="#cafes"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("cafes");
              }}
              data-magnetic
              className="btn-ghost pointer-events-auto text-cream"
            >
              <span>Conheça os cafés</span>
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
