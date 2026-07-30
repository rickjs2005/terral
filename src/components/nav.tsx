"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";
import { CHAPTERS, NEUTRAL_NAV } from "@/lib/chapters";
import { registerNav } from "@/lib/nav-color";
import { scrollToId } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WHATSAPP = "5533998779375";
export const wa = (text: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/**
 * Barra fixa: marca, os cinco capítulos, o pedido — e o fio de progresso.
 *
 * O fio é um traço de 2px no topo que cresce com o scroll e herda a cor do
 * capítulo ativo (`background-color: currentColor` pega carona no mesmo
 * tween que tinge os links). Orientação e identidade num elemento só — e
 * ele NÃO se esconde junto com a barra: quando a nav recolhe pra dar a tela
 * inteira à faixa, o fio continua dizendo onde se está.
 */
export function Nav() {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const tinted = Array.from(el.querySelectorAll<HTMLElement>("[data-tint]"));

      registerNav((color, next) => {
        gsap.to(tinted, { color, duration: 0.35, ease: "power2.out" });
        setActive(next);
      });

      // O fio de progresso — escala com o scroll total do documento.
      gsap.fromTo(
        ".nav-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
        },
      );

      return () => registerNav(null);
    },
    { scope: root },
  );

  // A barra recolhe quando se desce e volta quando se sobe — dá a tela
  // inteira pra faixa horizontal sem esconder a navegação de vez.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > last && y > 120;
      last = y;
      if (down === hidden) return;
      hidden = down;
      gsap.to(el, { yPercent: down ? -140 : 0, duration: 0.5, ease: "power3.out" });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollToId(id);
  }, []);

  return (
    <div ref={root} style={{ color: NEUTRAL_NAV }}>
      <div aria-hidden className="nav-progress" data-tint />

      <header
        ref={header}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[6vw] py-[1.6rem] lg:px-[3.4rem]"
      >
        <a
          href="#topo"
          onClick={(e) => go(e, "topo")}
          data-tint
          className="t-micro shrink-0"
          style={{ letterSpacing: "0.3em" }}
        >
          TERRAL
        </a>

        <nav aria-label="Capítulos" className="hidden lg:block">
          <ul className="flex items-center gap-[2.2rem]">
            {CHAPTERS.map((chapter) => (
              <li key={chapter.key}>
                <a
                  href={`#${chapter.key}`}
                  onClick={(e) => go(e, chapter.key)}
                  data-tint
                  aria-current={active === chapter.key ? "true" : undefined}
                  className="t-micro link-under transition-opacity"
                  style={{ opacity: active === chapter.key ? 1 : 0.5 }}
                >
                  {chapter.nav}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={wa("Olá! Vim pelo site da TERRAL e quero conhecer os cafés.")}
          target="_blank"
          rel="noopener noreferrer"
          data-tint
          className="t-micro link-under shrink-0"
        >
          Pedir café
        </a>
      </header>
    </div>
  );
}
