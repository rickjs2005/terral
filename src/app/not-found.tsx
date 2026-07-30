"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * 404 da casa.
 *
 * Um lote que passou do ponto. O numeral inclina levemente atrás do cursor —
 * o suficiente pra página parecer viva sem virar brinquedo. Nenhuma
 * biblioteca: um listener e duas custom properties.
 */
export default function NotFound() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        el.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main className="relative min-h-svh overflow-hidden bg-coal">
      <Image
        src="/shot/moenda/a.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 45%, transparent 20%, rgb(11 9 8 / 0.9) 100%)",
        }}
      />

      <div
        ref={root}
        className="relative flex min-h-svh flex-col items-center justify-center gap-[2rem] px-[6vw] text-center"
        style={{ perspective: "900px" }}
      >
        <p className="t-micro text-[var(--color-ember)]">Erro 404 · lote descartado</p>

        <p
          aria-hidden
          className="t-mega t-outline t-nums"
          style={
            {
              "--outline": "var(--color-ember)",
              transform: "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
              transition: "transform 0.6s cubic-bezier(0.65, 0.05, 0, 1)",
            } as React.CSSProperties
          }
        >
          404
        </p>

        <h1 className="t-huge max-w-[16ch]">Passou do ponto.</h1>

        <p className="t-body max-w-[38ch] text-cream/60">
          Essa página torrou demais e a gente não serve o que não beberia.
          Aconteceu, joga fora, começa de novo — é assim na bancada também.
        </p>

        <div className="mt-[1.6rem] flex flex-wrap items-center justify-center gap-[1.2rem]">
          <Link href="/" className="btn-solid">
            Voltar pra bancada
          </Link>
          <Link href="/#cafes" className="btn-ghost text-cream">
            <span>Ver os cafés</span>
          </Link>
        </div>
      </div>

      <div aria-hidden className="grain-sheet" />
    </main>
  );
}
