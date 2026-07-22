# TERRAL — Torrefação artesanal (site cinematográfico)

**Data:** 2026-07-21 · **Status:** aprovado pelo Rick

## Conceito
Site fictício de portfólio (MilWeb). Assinatura: **grão de café 3D procedural
que TORRA conforme o scroll** — verde-cru → torra clara → média → escura
(shader com uniform de torra), fumaça/vapor em partículas, estalos no first
crack. O scroll é a própria torra.

## Capítulos (scroll-driven)
1. Hero — tipografia TERRAL gigante, grão flutuando, rim light cobre
2. Origem — terroir/altitude/fazenda (tons terra/verde)
3. Torra — HUD de temperatura, fogo/brasas, grão escurecendo
4. Moagem — grão explode em partículas
5. Xícara — vapor, paleta creme
6. Blends — 3 produtos com notas sensoriais + CTA WhatsApp
7. Clube TERRAL — assinatura mensal
8. Contato/Footer

## Identidade
- Fundo `#0d0a08` (preto-café) · acento cobre `#b87333` · texto creme
- Display: Fraunces (editorial artesanal) · corpo: sans limpa

## Stack & regras
- Next 15+ / R3F / GSAP ScrollTrigger / Lenis (pipeline aurex/kavita)
- Gotchas aplicados: HUD e cena no MESMO progress com damping via rAF
  (scrub direto dessincroniza); mobile leve (DPR baixo/efeitos reduzidos);
  reduced-motion mostra conteúdo direto; sem zona morta de ScrollTrigger.
- Funil WhatsApp (33 99877-9375), PT-BR apenas.

## Entrega
Deploy Vercel (terral) + card no portfólio milweb com shots e case study.
