import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A casa do torrador",
  description: "O fundo da casa da TERRAL — pra quem teve paciência de segurar.",
  robots: { index: false, follow: false },
};

/**
 * A recompensa do "segure".
 *
 * Não está no menu, não está no sitemap e não é indexada. Quem chega aqui
 * ou aguentou seis segundos com o dedo no botão ou foi procurar o link
 * escondido no rodapé — as duas formas valem, e as duas são intenção.
 *
 * O prêmio é uma coisa só e é concreta: um código. Página secreta que só
 * diz "parabéns, você achou" é anticlímax.
 */
export default function CasaDoTorrador() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-coal">
      <Image
        src="/shot/tambor/b.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(11 9 8 / 0.85) 0%, rgb(11 9 8 / 0.6) 40%, rgb(11 9 8 / 0.96) 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-svh max-w-[52rem] flex-col justify-center gap-[2rem] px-[6vw] py-[8rem]">
        <p className="t-micro text-[var(--color-gold)]">Fundo da casa · sem placa na porta</p>

        <h1 className="t-giant">Você segurou.</h1>

        <div className="rule text-[var(--color-gold)]" />

        <p className="t-lead text-cream/80">
          Seis segundos com o dedo parado num botão que não prometia nada. É
          mais ou menos o que a gente pede de um café: que alguém espere o
          tempo dele.
        </p>

        <p className="t-body max-w-[46ch] text-cream/60">
          Então fica o combinado. Manda esse código no WhatsApp junto com o seu
          pedido e o primeiro pacote sai com o dobro de café — 500 g pelo preço
          de 250 g. Vale uma vez, por pessoa, enquanto a torra da semana durar.
        </p>

        <div className="mt-[1rem] inline-flex w-fit items-baseline gap-[1rem] border border-[var(--color-gold)]/40 px-[2rem] py-[1.4rem]">
          <span className="t-micro text-cream/40">Código</span>
          <span className="t-big text-[var(--color-gold)]">SEGUREI</span>
        </div>

        <div className="mt-[2rem] flex flex-wrap items-center gap-[1.2rem]">
          <a
            href={`https://wa.me/5533998779375?text=${encodeURIComponent(
              "Olá! Achei a casa do torrador. Meu código é SEGUREI ☕",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-solid"
          >
            Usar o código
          </a>
          <Link href="/" className="btn-ghost text-cream">
            <span>Voltar</span>
          </Link>
        </div>

        <p className="t-micro mt-[3rem] text-cream/25">
          TERRAL é uma marca fictícia — o código também. Site-conceito por MilWeb.
        </p>
      </div>

      <div aria-hidden className="grain-sheet" />
    </main>
  );
}
