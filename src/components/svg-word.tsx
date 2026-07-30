"use client";

import { useEffect, useRef } from "react";

/**
 * Uma palavra em SVG, letra a letra, ajustada à caixa exata dos glifos.
 *
 * Por que SVG e não um <h1> com font-size grande:
 *  - o traçado (stroke-dasharray) só existe aqui — é o que permite a marca
 *    "se desenhar" em contorno antes de preencher;
 *  - cada letra é um elemento próprio, então dá pra escalonar a entrada;
 *  - medindo os glifos e recortando o viewBox no bbox real, a palavra ocupa
 *    exatamente a largura do contêiner em qualquer fonte e qualquer tela —
 *    sem número mágico e sem `clamp()` chutado.
 *
 * O texto acessível continua existindo: quem lê tela recebe `<title>` e o
 * `aria-label`, e a página mantém um heading de verdade por fora.
 */
export function SvgWord({
  text,
  /** fração do corpo usada como entreletra */
  tracking = 0.015,
  className = "",
  letterClassName = "",
  strokeWidth = 1.5,
  /** chamado com as letras já posicionadas — o ponto de partida da animação */
  onLayout,
  title,
}: {
  text: string;
  tracking?: number;
  className?: string;
  letterClassName?: string;
  strokeWidth?: number;
  onLayout?: (letters: SVGTextElement[], svg: SVGSVGElement) => void;
  title?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);

  // A callback vive num ref pra que trocar de identidade não remeça a
  // palavra. A atribuição acontece num efeito, não no corpo do render —
  // mexer em ref durante o render é justamente o que quebra sob o React
  // Compiler, que pode reexecutar o render sem commitar.
  const layoutRef = useRef(onLayout);
  useEffect(() => {
    layoutRef.current = onLayout;
  }, [onLayout]);

  const chars = Array.from(text);
  const SIZE = 200; // corpo nominal; o viewBox reescala tudo depois

  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    if (!svg || !group) return;

    let cancelled = false;
    let notified = false;

    /**
     * `notify` só é verdadeiro na primeira medição bem-sucedida.
     *
     * Sem essa trava o desenho da marca nunca termina: cada arquivo de fonte
     * que assenta dispara `loadingdone`, o layout roda de novo, o onLayout
     * reinicia o dash do zero e a animação fica se reiniciando pra sempre.
     * Remedir depois é bom (a entreletra precisa acompanhar a fonte real);
     * reanimar não.
     */
    const layout = (notify: boolean) => {
      if (cancelled) return;
      const letters = Array.from(group.querySelectorAll<SVGTextElement>("text"));
      if (!letters.length) return;

      // 1. encadeia os glifos medindo um a um
      let x = 0;
      for (const letter of letters) {
        letter.setAttribute("x", String(x));
        x += letter.getComputedTextLength() + SIZE * tracking;
      }

      // 2. recorta o viewBox no bbox real (com folga pro stroke não clipar)
      const box = group.getBBox();
      const pad = strokeWidth * 2 + 2;
      svg.setAttribute(
        "viewBox",
        `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`,
      );

      if (notify && !notified) {
        notified = true;
        layoutRef.current?.(letters, svg);
      }
    };

    // As métricas só são reais depois da fonte carregar; antes disso a
    // medida é da fallback e a palavra sai com a entreletra de outra tipo.
    //
    // O catch não é decoração: sem ele, um erro dentro de `layout` (ou do
    // onLayout de quem chama) vira rejeição silenciosa de promise e o
    // sintoma aparece longe daqui — a palavra fica em contorno pra sempre.
    document.fonts.ready
      .then(() => layout(true))
      .catch((error) => {
        console.error("[SvgWord] falha ao medir a palavra:", error);
      });

    // Reescalar não muda o viewBox (é relativo), mas trocar de fonte sim —
    // aqui só se remede, sem reanimar.
    const onFontChange = () => layout(false);
    document.fonts.addEventListener?.("loadingdone", onFontChange);

    return () => {
      cancelled = true;
      document.fonts.removeEventListener?.("loadingdone", onFontChange);
    };
  }, [text, tracking, strokeWidth]);

  return (
    <svg
      ref={svgRef}
      className={`block w-full ${className}`}
      viewBox={`0 0 1000 ${SIZE * 1.2}`}
      fill="none"
      role={title ? "img" : "presentation"}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <g ref={groupRef}>
        {chars.map((char, i) => (
          <text
            key={`${char}-${i}`}
            className={letterClassName}
            x={0}
            y={0}
            fontSize={SIZE}
            fontFamily="var(--font-display), Georgia, serif"
            fontWeight={900}
            strokeWidth={strokeWidth}
          >
            {char}
          </text>
        ))}
      </g>
    </svg>
  );
}
