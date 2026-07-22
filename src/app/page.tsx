import { JourneyDriver } from "@/components/journey-driver";

const WHATSAPP = "5533998779375";
const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

const BLENDS = [
  {
    name: "NASCENTE",
    roast: "Torra clara",
    origin: "Caparaó · 1.400m",
    notes: "Florais, mel e cítricos de manhã fria",
    price: "R$ 46",
    tone: "border-leaf/40",
  },
  {
    name: "VERTENTE",
    roast: "Torra média",
    origin: "Mantiqueira de Minas · 1.200m",
    notes: "Caramelo, nozes e casca de laranja",
    price: "R$ 42",
    tone: "border-copper/50",
  },
  {
    name: "VULCÂNICO",
    roast: "Torra escura",
    origin: "Cerrado Mineiro · 1.050m",
    notes: "Chocolate amargo, caramelo queimado e fumo doce",
    price: "R$ 44",
    tone: "border-ember/40",
  },
];

function Overlay({
  chapter,
  label,
  title,
  children,
  align = "left",
}: {
  chapter: string;
  label: string;
  title: string;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const alignCls =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right ml-auto"
        : "items-start text-left";
  return (
    <div
      data-chapter={chapter}
      className="absolute inset-0 z-10 flex flex-col justify-center px-6 opacity-0 sm:px-16 lg:px-24"
    >
      <div className={`flex max-w-xl flex-col gap-4 ${alignCls}`}>
        <p className="chapter-label">{label}</p>
        <h2 className="text-4xl leading-[1.05] font-semibold text-cream sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <div className="copper-line w-24" />
        <div className="text-base leading-relaxed text-cream-dim sm:text-lg">{children}</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="grain">
      {/* Nav mínima */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-display text-xl font-bold tracking-[0.25em] text-cream">TERRAL</p>
        <a
          href={wa("Olá! Vim pelo site da TERRAL e quero conhecer os cafés.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-copper/50 bg-coal/60 px-4 py-2 text-sm text-copper-soft backdrop-blur transition-colors hover:bg-copper hover:text-coal"
        >
          Pedir café
        </a>
      </header>

      {/* ===== Jornada 3D (a torra no scroll) ===== */}
      <JourneyDriver>
        {/* Hero */}
        <div
          data-chapter="hero"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center opacity-0"
        >
          <p className="chapter-label mb-6">Torrefação artesanal · Minas Gerais</p>
          <h1 className="text-[clamp(4rem,16vw,12rem)] leading-none font-bold tracking-tight text-cream">
            TERRAL
          </h1>
          <p className="mt-6 max-w-md text-lg text-cream-dim">
            Cafés especiais torrados em pequenos lotes.
            <br />
            <span className="text-copper-soft">Role — a torra acontece no seu scroll.</span>
          </p>
          <div className="mt-10 flex h-10 w-6 items-start justify-center rounded-full border border-cream-dim/40 p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-copper" />
          </div>
        </div>

        {/* Origem */}
        <Overlay chapter="origem" label="01 · Origem" title="Nasce verde, na montanha.">
          <p>
            Microlotes do Caparaó, Mantiqueira e Cerrado Mineiro — colhidos maduros, secos ao sol
            e rastreados do pé à sacaria. Antes do fogo, o grão é isto: cru, verde, cheio de
            açúcar e altitude.
          </p>
        </Overlay>

        {/* Torra + HUD de temperatura */}
        <Overlay chapter="torra" label="02 · Torra" title="O fogo escreve o sabor." align="right">
          <p>
            Tambor de ferro, calor paciente e ouvido no primeiro crack. Cada lote tem a sua curva
            — clara pra florais, escura pra chocolate. Você está vendo a torra agora.
          </p>
          <div className="mt-6 w-56">
            <div className="flex items-baseline justify-between">
              <span className="chapter-label">Temperatura</span>
              <span id="hud-temp" className="font-display text-3xl text-copper-soft">
                180°C
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream/10">
              <div
                id="hud-temp-bar"
                className="h-full origin-left rounded-full bg-gradient-to-r from-copper to-ember"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </Overlay>

        {/* Moagem */}
        <Overlay chapter="moagem" label="03 · Moagem" title="Moído na hora do pedido.">
          <p>
            Nada de pó parado em prateleira: a moagem sai calibrada pro seu método — espresso,
            V60, prensa ou moka — minutos antes de ir pro correio.
          </p>
        </Overlay>

        {/* Xícara */}
        <Overlay chapter="xicara" label="04 · Xícara" title="O destino é a sua mesa." align="center">
          <p>
            Do terroir à xícara em até 7 dias da torra. É assim que café especial deveria chegar:
            vivo, doce e com história pra contar.
          </p>
        </Overlay>
      </JourneyDriver>

      {/* ===== Blends ===== */}
      <section id="blends" className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:px-10">
        <p className="chapter-label">05 · Os cafés</p>
        <h2 className="mt-3 text-4xl font-semibold text-cream sm:text-5xl">
          Três torras, três destinos.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BLENDS.map((blend) => (
            <article
              key={blend.name}
              className={`group flex flex-col rounded-2xl border ${blend.tone} bg-coal-2/80 p-7 transition-transform hover:-translate-y-1.5`}
            >
              <p className="chapter-label">{blend.roast}</p>
              <h3 className="mt-2 font-display text-3xl font-bold tracking-wide text-cream">
                {blend.name}
              </h3>
              <p className="mt-1 text-sm text-copper-soft">{blend.origin}</p>
              <p className="mt-4 flex-1 text-cream-dim">{blend.notes}</p>
              <div className="mt-6 flex items-center justify-between">
                <p className="font-display text-2xl text-cream">
                  {blend.price}
                  <span className="ml-1 text-xs text-cream-dim">/250g</span>
                </p>
                <a
                  href={wa(`Olá! Quero pedir o café ${blend.name} (${blend.roast}) da TERRAL.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-copper/60 px-4 py-2 text-sm text-copper-soft transition-colors group-hover:bg-copper group-hover:text-coal"
                >
                  Pedir
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Clube ===== */}
      <section className="relative z-10 border-y border-copper/15 bg-coal-2/60 py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <p className="chapter-label">06 · Assinatura</p>
          <h2 className="mt-3 text-4xl font-semibold text-cream sm:text-5xl">Clube TERRAL</h2>
          <p className="mt-5 max-w-xl text-lg text-cream-dim">
            Todo mês, um microlote diferente torrado na semana do envio — com carta de origem,
            receita de preparo e frete incluso. A partir de{" "}
            <span className="text-copper-soft">R$ 39/mês</span>.
          </p>
          <a
            href={wa("Olá! Quero assinar o Clube TERRAL ☕")}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-ember mt-9 rounded-full bg-copper px-8 py-4 text-lg font-semibold text-coal transition-colors hover:bg-copper-soft"
          >
            Entrar pro clube
          </a>
        </div>
      </section>

      {/* ===== Contato / Footer ===== */}
      <footer className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="font-display text-3xl font-bold tracking-[0.25em] text-cream">TERRAL</p>
            <p className="mt-3 max-w-sm text-cream-dim">
              Torrefação artesanal no coração de Minas. Visitas com hora marcada — o café da
              bancada é por nossa conta.
            </p>
            <p className="mt-4 text-sm text-cream-dim">
              Rua do Torrador, 88 · Manhuaçu/MG
              <br />
              qua–sáb, 9h às 18h · @terral.cafe
            </p>
          </div>
          <a
            href={wa("Olá, TERRAL! Quero falar sobre café ☕")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-copper px-6 py-3 font-semibold text-coal transition-colors hover:bg-copper-soft"
          >
            Chamar no WhatsApp
          </a>
        </div>
        <div className="copper-line mt-14" />
        <p className="mt-6 text-center text-xs text-cream-dim">
          TERRAL é uma marca fictícia — site-conceito por{" "}
          <a
            href="https://milweb.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-copper-soft underline-offset-4 hover:underline"
          >
            MilWeb
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
