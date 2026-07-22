import { JourneyDriver } from "@/components/journey-driver";

const WHATSAPP = "5533998779375";
const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

const BLENDS = [
  {
    name: "NASCENTE",
    roast: "Torra clara",
    origin: "Caparaó · 1.400m",
    notes: ["Florais", "Mel", "Cítricos"],
    body: "Xícara delicada e luminosa, pra quem gosta de café que parece chá de flor.",
    price: "R$ 46",
    sca: 87,
    tone: "border-leaf/40",
    bar: "from-leaf/70 to-leaf/10",
    dot: "#8a9b5c",
  },
  {
    name: "VERTENTE",
    roast: "Torra média",
    origin: "Mantiqueira de Minas · 1.200m",
    notes: ["Caramelo", "Nozes", "Casca de laranja"],
    body: "O equilíbrio da casa: doçura de caramelo com acidez de laranja no final.",
    price: "R$ 42",
    sca: 85,
    tone: "border-copper/50",
    bar: "from-copper/80 to-copper/10",
    dot: "#b87333",
  },
  {
    name: "VULCÂNICO",
    roast: "Torra escura",
    origin: "Cerrado Mineiro · 1.050m",
    notes: ["Chocolate amargo", "Caramelo queimado", "Fumo doce"],
    body: "Encorpado e intenso — feito pra atravessar leite, gelo e madrugadas.",
    price: "R$ 44",
    sca: 86,
    tone: "border-ember/40",
    bar: "from-ember/70 to-ember/10",
    dot: "#e25822",
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
      <div className={`relative flex max-w-xl flex-col gap-4 ${alignCls}`}>
        <span aria-hidden className="ghost-number -top-24 -left-10">
          {label.slice(0, 2)}
        </span>
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
          {[
            { left: "18%", top: "30%", size: 3, dur: "9s", delay: "0s", drift: "16px", peak: 0.5 },
            { left: "78%", top: "24%", size: 2, dur: "12s", delay: "2s", drift: "-12px", peak: 0.4 },
            { left: "64%", top: "68%", size: 2, dur: "10s", delay: "4s", drift: "10px", peak: 0.45 },
            { left: "30%", top: "72%", size: 2, dur: "13s", delay: "1.4s", drift: "-14px", peak: 0.35 },
            { left: "86%", top: "56%", size: 3, dur: "11s", delay: "5.5s", drift: "12px", peak: 0.4 },
          ].map((m, i) => (
            <span
              key={i}
              aria-hidden
              className="mote"
              style={{
                left: m.left,
                top: m.top,
                width: m.size,
                height: m.size,
                ["--mote-dur" as string]: m.dur,
                ["--mote-delay" as string]: m.delay,
                ["--mote-drift" as string]: m.drift,
                ["--mote-peak" as string]: m.peak,
              }}
            />
          ))}
          <p className="chapter-label mb-6">Torrefação artesanal · Minas Gerais</p>
          <h1 className="title-gradient text-[clamp(4rem,16vw,12rem)] leading-none font-bold tracking-tight">
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

      {/* ===== Credibilidade (da semente à xícara) ===== */}
      <div className="relative z-10 border-y border-copper/10 bg-coal-2/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6 text-center">
          {[
            "Microlotes 100% rastreados",
            "Torra da semana, nunca de estoque",
            "Cafés especiais SCA 84+",
            "Envio em até 7 dias da torra",
          ].map((item) => (
            <p key={item} className="flex items-center gap-2 text-sm text-cream-dim">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-copper" />
              {item}
            </p>
          ))}
        </div>
      </div>

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
              className={`group relative flex flex-col overflow-hidden rounded-2xl border ${blend.tone} bg-gradient-to-b from-coal-2 to-coal p-7 transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-20px_rgb(184_115_51/0.35)]`}
            >
              <div
                aria-hidden
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${blend.bar}`}
              />
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: blend.dot }}
                />
                <p className="chapter-label">{blend.roast}</p>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-4xl font-bold tracking-wide text-cream">
                  {blend.name}
                </h3>
                <span
                  className="shrink-0 rounded-md border border-copper/40 px-2 py-1 font-mono text-[11px] tracking-wider text-copper-soft"
                  title="Pontuação Specialty Coffee Association"
                >
                  SCA {blend.sca}
                </span>
              </div>
              <p className="mt-1 text-sm text-copper-soft">{blend.origin}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {blend.notes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-cream/15 px-3 py-1 text-xs text-cream-dim"
                  >
                    {note}
                  </span>
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-cream-dim">{blend.body}</p>
              <div className="copper-line mt-6 opacity-40" />
              <div className="mt-5 flex items-center justify-between">
                <p className="font-display text-3xl text-cream">
                  {blend.price}
                  <span className="ml-1 text-xs text-cream-dim">/250g</span>
                </p>
                <a
                  href={wa(`Olá! Quero pedir o café ${blend.name} (${blend.roast}) da TERRAL.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-copper/60 px-5 py-2.5 text-sm font-semibold text-copper-soft transition-colors group-hover:bg-copper group-hover:text-coal"
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
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-copper/30 bg-gradient-to-b from-coal-2 to-coal px-6 py-16 text-center sm:px-16">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-copper to-transparent" />
            <span className="rounded-full border border-copper/40 bg-copper/10 px-4 py-1 text-xs tracking-[0.25em] text-copper-soft uppercase">
              Frete incluso · cancele quando quiser
            </span>
          <p className="chapter-label mt-6">06 · Assinatura</p>
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
