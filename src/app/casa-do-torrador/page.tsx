import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A casa do torrador",
  description: "O fundo da casa da TERRAL — pra quem teve paciência de segurar.",
  robots: { index: false, follow: false },
};

const WHATSAPP = "5533998779375";
const CODIGO = "SEGUREI";

/**
 * A recompensa do "segure".
 *
 * Não está no menu, não está no sitemap e não é indexada. Quem chega aqui ou
 * aguentou seis segundos com o dedo no botão ou foi procurar o link escondido
 * no rodapé — as duas formas valem, e as duas são intenção.
 *
 * O prêmio é uma coisa só e é concreta: um código. Página secreta que só diz
 * "parabéns, você achou" é anticlímax.
 *
 * A versão anterior era um artigo centrado de 1436px de altura: a recompensa
 * exigia ROLAR, a foto morria sob um gradiente de 0.85→0.96 (uma página preta
 * que ainda pagava o download da imagem) e o código — a única coisa concreta
 * aqui — era uma caixinha embaixo de dois parágrafos. Agora é uma tela só,
 * assimétrica como o resto do site: a fala à esquerda, a foto viva à direita
 * dissolvendo na página, e o código como peça gráfica no lugar de honra.
 */
export default function CasaDoTorrador() {
  const mensagem = encodeURIComponent(
    `Olá! Achei a casa do torrador. Meu código é ${CODIGO} ☕`,
  );

  return (
    // min-h e não h: em 1920×1080 isto fecha numa tela só, que é o alvo. Mas a
    // altura ÚTIL de um navegador com abas e favoritos é ~865px, e com `h-svh
    // overflow-hidden` a letra miúda do fim era CORTADA em vez de rolar —
    // conteúdo escondido sem jeito de alcançar é pior que uma rolagem curta.
    // Só o eixo X continua cortado, porque é dele que a máscara da foto vive.
    <main className="relative min-h-svh overflow-x-hidden bg-coal">
      {/* ---- a foto ocupa a metade direita e se dissolve pra dentro ----
          A máscara é a mesma linguagem da vitrine dos cafés (.pack-photo):
          em vez de cobrir a imagem com uma cortina preta, ela DESAPARECE nas
          bordas. Assim a foto continua sendo foto no meio da tela e o texto
          ganha o lado esquerdo limpo, sem precisar de véu por cima. */}
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[62vw] lg:block">
        <Image
          src="/shot/tambor/b.webp"
          alt=""
          fill
          priority
          sizes="62vw"
          className="object-cover"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 34%, #000 82%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 34%, #000 82%, transparent 100%)",
          }}
        />
        {/* rebaixa só o suficiente pra tipografia sobreviver por cima —
            0.45, não 0.96: o objetivo é ler o texto, não apagar a torra */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(11 9 8 / 0.92) 0%, rgb(11 9 8 / 0.45) 46%, rgb(11 9 8 / 0.62) 100%)",
          }}
        />
      </div>

      {/* em telas estreitas a foto vira fundo inteiro, atrás de um véu */}
      <div aria-hidden className="absolute inset-0 lg:hidden">
        <Image
          src="/shot/tambor/b.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-coal/70" />
      </div>

      {/* brasa baixa, do canto de onde vem o calor da foto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(46rem 40rem at 66% 62%, rgb(184 115 51 / 0.14), transparent 70%)",
        }}
      />

      {/* py: com min-h, o `justify-center` só centraliza quando SOBRA espaço.
          Quando falta, o padding garante respiro em vez de texto colado na
          borda — e a página cresce, então nada fica inalcançável.
          2.4rem e não 4rem: em 4rem (= 4vw, ~154px somados) o padding sozinho
          estourava os 1080 do alvo e nascia uma barra de rolagem de 47px numa
          página que existe justamente pra caber numa tela. */}
      <div className="relative flex min-h-svh flex-col justify-center px-[6vw] py-[2.4rem] lg:px-[3.4rem]">
        <div className="max-w-[30rem]">
          <p className="t-micro text-[var(--color-gold)]">Fundo da casa · sem placa na porta</p>

          {/* t-huge e não t-giant: em 11rem a manchete sozinha comia um terço
              da tela e empurrava o prêmio pra fora do primeiro quadro. */}
          <h1 className="t-huge mt-[1.4rem]">
            Você <em className="voice">segurou</em>.
          </h1>

          <div className="rule mt-[1.8rem] w-[7rem] text-[var(--color-gold)]" />

          <p className="t-lead mt-[1.8rem] max-w-[24rem] text-cream/75">
            Seis segundos com o dedo parado num botão que não prometia nada. É
            mais ou menos o que a gente pede de um café: que alguém espere o
            tempo dele.
          </p>

          {/* ---- o prêmio ----
              Isto é a única coisa concreta da página, então é a maior coisa
              depois da manchete. O rótulo em cima, o código em t-big vazado
              em cobre, a condição embaixo em letra miúda — hierarquia de
              cartaz, não de parágrafo. */}
          <div className="mt-[2.6rem] inline-block border-y border-[var(--color-gold)]/35 py-[1.5rem]">
            <p className="t-micro text-cream/40">Seu código</p>
            <p className="t-big mt-[0.7rem] text-[var(--color-gold)]">{CODIGO}</p>
            <p className="t-body mt-[0.7rem] max-w-[26rem] text-cream/55">
              O primeiro pacote sai com o dobro de café — 500 g pelo preço de
              250 g. Vale uma vez por pessoa, enquanto a torra da semana durar.
            </p>
          </div>

          <div className="mt-[2.4rem] flex flex-wrap items-center gap-[1.2rem]">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${mensagem}`}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="btn-solid btn-lux"
            >
              <span>Usar o código</span>
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </a>
            <Link href="/" className="btn-ghost text-cream/70">
              <span>Voltar</span>
            </Link>
          </div>

          <p className="t-micro mt-[2.6rem] text-cream/25">
            TERRAL é uma marca fictícia — o código também. Site-conceito por MilWeb.
          </p>
        </div>
      </div>

      <div aria-hidden className="grain-sheet" />
    </main>
  );
}
