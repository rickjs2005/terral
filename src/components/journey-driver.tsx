"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CHAPTERS, chapterProgress, chapterVisibility, journey, type ChapterKey } from "@/lib/journey";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Scene = dynamic(() => import("./scene"), { ssr: false });

/**
 * Motor da jornada: wrapper alto (600vh) com viewport sticky; o ScrollTrigger
 * só ESCREVE journey.target — o damping roda no rAF da cena e overlays/HUD
 * leem journey.value no MESMO tick (gotcha do kavita: scrub direto no DOM
 * dessincroniza HUD e cena). Reduced-motion: sem Lenis e sem damping.
 */
export function JourneyDriver({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useGSAP(
    () => {
      const el = wrapper.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = window.matchMedia("(pointer: fine)").matches;

      // Lenis só no desktop (INP no touch — política das outras vitrines)
      let lenis: Lenis | null = null;
      if (!reduce && fine) {
        lenis = new Lenis({ duration: 1.1 });
        const raf = (time: number) => lenis!.raf(time * 1000);
        gsap.ticker.add(raf);
        lenis.on("scroll", ScrollTrigger.update);
      }

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          journey.target = self.progress;
          if (reduce) journey.value = self.progress; // sem damping
        },
      });

      // HUD + overlays no mesmo relógio da cena
      const overlays = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
      const tempEl = el.querySelector<HTMLElement>("#hud-temp");
      const tempBar = el.querySelector<HTMLElement>("#hud-temp-bar");
      const tick = () => {
        const p = journey.value;
        for (const overlay of overlays) {
          const key = overlay.dataset.chapter as ChapterKey;
          const v = chapterVisibility(p, key);
          overlay.style.opacity = String(v);
          overlay.style.transform = `translateY(${(1 - v) * 24}px)`;
          overlay.style.pointerEvents = v > 0.5 ? "auto" : "none";
        }
        if (tempEl && tempBar) {
          const torra = chapterProgress(p, "torra");
          const temp = Math.round(180 + torra * 52); // 180°C → 232°C (2º crack)
          tempEl.textContent = `${temp}°C`;
          tempBar.style.transform = `scaleX(${torra})`;
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    },
    { scope: wrapper },
  );

  return (
    <div ref={wrapper} className="relative h-[600vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Scene mobile={mobile} />
        </div>
        {children}
      </div>
    </div>
  );
}

export { CHAPTERS };
