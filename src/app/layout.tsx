import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces } from "next/font/google";
import { Magnetics } from "@/components/magnetics";
import "./globals.css";

/**
 * Duas tipografias e só.
 *
 * Fraunces é a display: variável, com eixos SOFT e WONK que deixam os
 * glifos levemente tortos — em 24rem isso lê como tipo desenhado, não como
 * fonte de sistema esticada. Archivo faz o trabalho pesado do rodapé da
 * escala: em 0.62rem/900 caixa alta ela ainda tem contraforma, que é
 * exatamente onde grotescas mais macias empastam.
 */
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
  // O itálico VERDADEIRO do Fraunces, não o inclinado sintético do
  // navegador — ele é a "voz" editorial dos destaques (.voice).
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://terral-cafe.vercel.app"),
  title: {
    default: "TERRAL — Torrefação artesanal de café especial",
    template: "%s · TERRAL",
  },
  description:
    "Cinco etapas entre a montanha e a sua mesa: Caparaó, terreiro, tambor, moenda e xícara. Microlotes rastreados, torra da semana e entrega em até 7 dias. Site-conceito por MilWeb.",
  openGraph: {
    title: "TERRAL — Torrefação artesanal",
    description:
      "Da mão que colhe à sua. Microlotes de Minas, torrados em lotes de 12 kg.",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0908",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-coal text-cream antialiased">
        {children}
        {/* Global: os ímãs existem em toda rota — inclusive no 404 e na
            página escondida — porque botão magnético é comportamento da casa,
            não de uma página. */}
        <Magnetics />
      </body>
    </html>
  );
}
