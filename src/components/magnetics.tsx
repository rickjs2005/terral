"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useMediaQuery } from "@/lib/use-media-query";

/** Alcance do magnetismo, em px a partir do centro do elemento. */
const MAGNET_RANGE = 110;
/** Deslocamento máximo do elemento magnético. */
const MAGNET_PULL = 9;

/**
 * Ímãs: elementos marcados com [data-magnetic] se inclinam na direção do
 * ponteiro quando ele chega perto, e voltam com elástico quando sai.
 *
 * Isto foi um dia parte de um cursor customizado (anel, ponto e um clarão em
 * soft-light que seguia a mão). O cursor saiu — a página usa o ponteiro
 * nativo. O ímã ficou porque é hover de botão, não cursor: quem olha vê o
 * botão reagindo, não uma seta substituída.
 *
 * Um listener de pointermove, um rAF, zero estado React por quadro. Só existe
 * em ponteiro fino: em toque não há aproximação pra detectar.
 */
export function Magnetics() {
  const fine = useMediaQuery("(pointer: fine)");

  useGSAP(
    () => {
      if (!fine) return;

      const target = { x: innerWidth / 2, y: innerHeight / 2 };

      // Os ímãs são coletados uma vez por tick de ponteiro parado — barato,
      // e pega elementos que entraram depois (rotas, reveals).
      let magnets: { el: HTMLElement; x: number; y: number }[] = [];
      let magnetScan = 0;
      const scanMagnets = () => {
        magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]")).map(
          (el) => {
            const r = el.getBoundingClientRect();
            return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
          },
        );
      };

      const onMove = (event: PointerEvent) => {
        target.x = event.clientX;
        target.y = event.clientY;
        // re-mede os ímãs no máximo 4×/s — getBoundingClientRect em excesso
        // é exatamente o tipo de coisa que derruba os 60fps pedidos
        const now = performance.now();
        if (now - magnetScan > 250) {
          magnetScan = now;
          scanMagnets();
        }
      };

      window.addEventListener("pointermove", onMove, { passive: true });

      const tick = () => {
        // dentro do alcance, o elemento se inclina na direção da mão; fora,
        // volta pro lugar. O damp curto dá o "elástico".
        for (const magnet of magnets) {
          const dx = target.x - magnet.x;
          const dy = target.y - magnet.y;
          const dist = Math.hypot(dx, dy);
          const pull = Math.max(0, 1 - dist / MAGNET_RANGE);
          const gx = (dx / (dist || 1)) * pull * MAGNET_PULL;
          const gy = (dy / (dist || 1)) * pull * MAGNET_PULL;
          // scale via var: o hover (.btn-lux) liga --mgs sem brigar com o
          // translate que o ímã escreve todo quadro
          magnet.el.style.transform = `translate(${gx}px, ${gy}px) scale(var(--mgs, 1))`;
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pointermove", onMove);
      };
    },
    { dependencies: [fine] },
  );

  return null;
}
