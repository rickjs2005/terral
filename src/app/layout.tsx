import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TERRAL — Torrefação artesanal de café especial",
  description:
    "Cafés especiais torrados em pequenos lotes. Do terroir à xícara: origem rastreada, torra artesanal e entrega no seu ritmo. Site-conceito por MilWeb.",
  metadataBase: new URL("https://terral-cafe.vercel.app"),
  openGraph: {
    title: "TERRAL — Torrefação artesanal",
    description: "A torra acontece no seu scroll. Cafés especiais em pequenos lotes.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-coal text-cream antialiased">{children}</body>
    </html>
  );
}
