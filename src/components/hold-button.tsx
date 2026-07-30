"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

const HOLD_SECONDS = 6;
const SECRET = "/casa-do-torrador";

/**
 * Segure pra abrir.
 *
 * É o único elemento do site que não obedece a scroll: exige intenção
 * contínua. O anel se fecha em seis segundos e, se a pessoa aguentar até o
 * fim, cai numa página que não está em lugar nenhum do menu. Soltar antes
 * desfaz tudo — e é justamente por poder falhar que vale a pena tentar.
 *
 * Custo: ~40 linhas. É o tipo de coisa que separa "bem feito" de "alguém
 * gostou de fazer".
 */
export function HoldButton() {
  const root = useRef<HTMLButtonElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();

  useGSAP(
    () => {
      const circle = ring.current;
      if (!circle) return;
      const len = circle.getTotalLength();
      gsap.set(circle, { strokeDasharray: len, strokeDashoffset: len });
    },
    { scope: root },
  );

  const start = useCallback(() => {
    const circle = ring.current;
    if (!circle || tl.current) return;

    // Teclado e leitor de tela não seguram botão: pra eles o destino é um
    // link comum, logo abaixo. Aqui é só o gesto.
    tl.current = gsap
      .timeline({
        onComplete: () => {
          tl.current = null;
          router.push(SECRET);
        },
      })
      .to(circle, { strokeDashoffset: 0, duration: HOLD_SECONDS, ease: "none" }, 0)
      .to(root.current, { scale: 1.06, duration: 0.5, ease: "power2.out" }, 0)
      .fromTo(
        ".hold-grain",
        { y: "-2.3rem", opacity: 0 },
        { y: "-3.9rem", opacity: 1, duration: HOLD_SECONDS, ease: "power2.in", stagger: 0.05 },
        0,
      )
      .to(".hold-label", { opacity: 0.4, duration: 0.4 }, 0);
  }, [router]);

  const cancel = useCallback(() => {
    if (!tl.current) return;
    tl.current.kill();
    tl.current = null;
    const circle = ring.current!;
    gsap.to(circle, {
      strokeDashoffset: circle.getTotalLength(),
      duration: 0.45,
      ease: "power2.out",
    });
    gsap.to(root.current, { scale: 1, duration: 0.45, ease: "power2.out" });
    gsap.to(".hold-grain", { y: "-2.3rem", opacity: 0, duration: 0.5, ease: "power2.out" });
    gsap.to(".hold-label", { opacity: 1, duration: 0.3 });
  }, []);

  return (
    // linha, não coluna: ao lado do CTA principal o botão precisa da mesma
    // altura de linha que ele, com a dica como legenda lateral
    <div className="flex items-center gap-[1.2rem]">
      <button
        ref={root}
        type="button"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => e.preventDefault()}
        className="relative grid h-[6.4rem] w-[6.4rem] place-items-center rounded-full text-[var(--color-gold)] select-none"
        aria-describedby="hold-hint"
      >
        {/* Grãos que escapam enquanto se segura. A rotação mora no wrapper e
            o deslocamento no filho — se as duas coisas dividissem o mesmo
            `transform`, o GSAP sobrescreveria a rotação ao animar. */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center"
            style={{ transform: `rotate(${i * 60}deg)` }}
          >
            <span
              className="hold-grain block h-[0.28rem] w-[0.28rem] rounded-full bg-current opacity-0"
              style={{ transform: "translateY(-2.3rem)" }}
            />
          </span>
        ))}

        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1} />
          <circle
            ref={ring}
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </svg>
        <span className="hold-label t-micro">Segure</span>
      </button>

      {/* itálico serif, não t-micro: isto é um sussurro, não um rótulo */}
      <p id="hold-hint" className="voice max-w-[11rem] text-[0.95rem] leading-[1.25] text-cream/35">
        Tem café guardado no fundo da casa.
      </p>
    </div>
  );
}

export { SECRET };
