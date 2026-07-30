"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";
import { EXPO_OUT, GATE_EVENT, lockScroll, READY_EVENT, setLenis, unlockScroll } from "@/lib/scroll";
import { registerReveals } from "@/lib/reveal";
import { Loader } from "./loader";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * O shell: um Lenis, um ticker, um portão.
 *
 * A ordem aqui não é decorativa —
 *   1. trava o scroll ANTES do primeiro quadro (nada de meio-scroll durante o load)
 *   2. espera as fontes assentarem, senão o splitter mede a linha errada
 *      e o texto sobe com a quebra de outra fonte
 *   3. registra os reveals
 *   4. só então abre o portão e dá refresh no ScrollTrigger com o layout final
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [open, setOpen] = useState(false);

  // Trava antes da pintura — useEffect já seria tarde pro primeiro quadro.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lockScroll();
    return () => unlockScroll();
  }, []);

  // O hero avisa quando o WebGL entregou o primeiro quadro. Timeout de
  // segurança: se a GPU falhar ou o contexto não subir, o site abre mesmo
  // assim — portão nenhum pode virar parede.
  useEffect(() => {
    const onReady = () => setSceneReady(true);
    window.addEventListener(READY_EVENT, onReady);
    const bail = window.setTimeout(onReady, 4000);
    return () => {
      window.removeEventListener(READY_EVENT, onReady);
      window.clearTimeout(bail);
    };
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = !window.matchMedia("(min-width: 992px)").matches;

      let lenis: Lenis | null = null;
      let raf: ((time: number) => void) | null = null;
      let onRefresh: (() => void) | null = null;

      if (!reduce) {
        // duration 1.8 é longo de propósito: o scroll fica pesado, planado,
        // e é metade da sensação de "caro" da referência.
        lenis = new Lenis({
          duration: 1.8,
          easing: EXPO_OUT,
          smoothWheel: true,
          syncTouch: false,
          touchMultiplier: 1.6,
        });
        setLenis(lenis);
        raf = (time: number) => lenis!.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(1000, 16);
        lenis.on("scroll", ScrollTrigger.update);
        onRefresh = () => lenis!.resize();
        ScrollTrigger.addEventListener("refresh", onRefresh);
      }

      let disposeReveals: (() => void) | null = null;
      let cancelled = false;

      // As métricas finais só existem depois da fonte carregar — medir antes
      // agrupa as palavras em linhas que não são as que o usuário vai ver.
      // Nada de `refresh()` aqui: enquanto o portão está fechado o documento
      // está com `overflow: hidden`, então toda medida de pin sairia contra
      // uma página que não rola. O refresh de verdade acontece em `openGate`,
      // já destravado.
      document.fonts.ready.then(() => {
        if (cancelled || !root.current) return;
        disposeReveals = registerReveals(root.current, { reduce, mobile });
      });

      return () => {
        cancelled = true;
        disposeReveals?.();
        if (raf) gsap.ticker.remove(raf);
        if (onRefresh) ScrollTrigger.removeEventListener("refresh", onRefresh);
        lenis?.destroy();
        setLenis(null);
      };
    },
    { scope: root },
  );

  const openGate = useCallback(() => {
    setOpen(true);
    unlockScroll();
    // O loader saindo muda a altura do documento; sem este refresh todo
    // trigger de pin nasce com o `end` calculado errado.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event(GATE_EVENT));
    });
    // Segundo refresh depois que o fade do conteúdo termina: o primeiro roda
    // no quadro em que o loader some, e qualquer coisa que assente logo
    // depois (uma foto, uma barra de rolagem aparecendo) deslocaria o `end`
    // de cada pin sem ninguém recalcular.
    window.setTimeout(() => ScrollTrigger.refresh(), 800);
  }, []);

  return (
    <div ref={root}>
      <Loader sceneReady={sceneReady} onDone={openGate} />
      <div
        className="transition-opacity duration-700"
        style={{ opacity: open ? 1 : 0 }}
        data-gate={open ? "open" : "closed"}
      >
        {children}
      </div>
      <div aria-hidden className="grain-sheet" />
      <div aria-hidden className="vignette" />
    </div>
  );
}
