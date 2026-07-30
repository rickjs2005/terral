/**
 * Os cinco capítulos da jornada TERRAL — da montanha à mesa.
 *
 * Cada um é uma faixa horizontal fixada de ~350vw com estrutura idêntica
 * (título · cluster editorial · mídia em sangria); só a cor, o numeral e o
 * conteúdo trocam. É a repetição rígida que faz a leitura virar ritmo.
 */

export type Stat = {
  /** o numeral — sempre o objeto gráfico principal do bloco */
  value: string;
  unit?: string;
  label: string;
};

export type Chapter = {
  key: string;
  /** 01..05 — aparece no kicker e na nav */
  index: string;
  /** o nome desenhado em stencil no painel de abertura */
  title: string;
  /** rótulo curto pra nav */
  nav: string;
  kicker: string;
  /** manchete do painel largo — sobe letra a letra */
  heading: string;
  /**
   * A mesma manchete partida em TRÊS linhas de cinema, com uma delas
   * "quente" (na cor do capítulo). Três elementos separados porque o
   * splitter achata HTML interno — a cor precisa morar no elemento da
   * linha, não num <span> que seria destruído.
   */
  headline: { lines: [string, string, string]; hot: number };
  /** índices do cluster usados pelas duas paredes de mídia (aberto/médio) */
  wall: { wide: number; mid: number };
  /** parágrafo que se revela palavra a palavra amarrado ao scroll */
  lead: string;
  /** legenda da mídia em sangria */
  caption: string;
  /** o numeral gigante do painel de abertura */
  hero: Stat;
  /** os três dados que deslizam por cima do vídeo/foto */
  stats: [Stat, Stat, Stat];
  images: {
    /**
     * Vídeo em sangria — o ativo que sustenta o painel de mídia.
     * A foto `full` continua existindo e vira o `poster`: nunca há buraco
     * enquanto o vídeo carrega, e quem tem dados limitados vê a foto.
     */
    video: string;
    /** sangria total — abre de letterbox pra tela cheia */
    full: string;
    /** cluster editorial do painel largo, em recorte letterbox */
    cluster: [string, string, string];
    alt: {
      full: string;
      cluster: [string, string, string];
    };
  };
  color: {
    /**
     * Fundo do capítulo — campo de cor CHAPADO e saturado, não mais uma
     * variação de preto.
     *
     * A primeira versão usava #0e1511, #191207, #1c0c06… cinco quase-pretos
     * indistinguíveis, e o site inteiro lia como um tom só. Cor é o que faz
     * cada capítulo ter identidade e o que dá ao scroll a sensação de
     * atravessar lugares. A progressão aqui é a própria jornada: verde de
     * montanha, ocre de sol, brasa, cobre moído e, no fim, a mesa clara.
     */
    bg: string;
    /** tinta principal sobre esse fundo */
    ink: string;
    /** acento — numerais vazados, filetes, hover */
    accent: string;
    /** cor que a nav assume enquanto o capítulo está em cena */
    nav: string;
    /**
     * `difference` faz o título inverter contra a mídia. Só nos capítulos de
     * fundo escuro e vídeo escuro: sobre campo claro ou saturado a inversão
     * embarra e vira sujeira.
     */
    blend: boolean;
  };
};

export const CHAPTERS: Chapter[] = [
  {
    key: "caparao",
    index: "01",
    title: "CAPARAÓ",
    nav: "Caparaó",
    kicker: "A montanha",
    heading: "Café bom começa alto.",
    lead: "Mil e quatrocentos metros, face leste, noite fria. O fruto amadurece devagar porque nada ali o apressa — e é essa lentidão que vira açúcar, floral e acidez de laranja na xícara. A gente não escolhe fazenda: escolhe talhão, e volta no ano seguinte pra ver se a colheita se manteve.",
    headline: { lines: ["Café bom", "começa", "alto."], hot: 2 },
    wall: { wide: 2, mid: 1 },
    caption: "Serra do Caparaó, face leste — colheita seletiva, só cereja madura.",
    hero: { value: "1400", unit: "m", label: "Altitude média do talhão" },
    stats: [
      { value: "1400", unit: "m", label: "Altitude" },
      { value: "87", label: "Pontos SCA" },
      { value: "2026", label: "Safra" },
    ],
    images: {
      video: "/shot/caparao/full.mp4",
      full: "/shot/caparao/full.webp",
      cluster: ["/shot/caparao/a.webp", "/shot/caparao/b.webp", "/shot/caparao/c.webp"],
      alt: {
        full: "Vista aérea ao amanhecer das encostas de café na Serra do Caparaó, com névoa no fundo dos vales.",
        cluster: [
          "Cerejas de café maduras no galho, com orvalho, contra a luz baixa da manhã.",
          "Mãos calejadas de um produtor segurando um punhado de cerejas recém-colhidas.",
          "Um pé de café isolado na crista da montanha contra o céu do amanhecer.",
        ],
      },
    },
    // Verde de mata fechada com folha pálida por cima — o café ainda planta.
    color: { bg: "#23381f", ink: "#f2efe2", accent: "#d5e3a2", nav: "#d5e3a2", blend: true },
  },
  {
    key: "terreiro",
    index: "02",
    title: "TERREIRO",
    nav: "Terreiro",
    kicker: "O sol",
    heading: "O sol faz metade do trabalho.",
    lead: "Camada fina, rodo a cada três horas, três semanas de paciência. Secar rápido demais trinca o grão; secar devagar demais o entrega à fermentação errada. Onze por cento de umidade é o número que a gente persegue — abaixo disso o café perde doçura, acima ele não atravessa o ano.",
    headline: { lines: ["O sol", "faz metade", "do trabalho."], hot: 0 },
    wall: { wide: 2, mid: 1 },
    caption: "Terreiro suspenso, camada fina, rodo a cada três horas.",
    hero: { value: "21", unit: "dias", label: "No terreiro, secagem natural" },
    stats: [
      { value: "21", unit: "d", label: "Secagem" },
      { value: "11", unit: "%", label: "Umidade final" },
      { value: "4×", label: "Revirado por dia" },
    ],
    images: {
      video: "/shot/terreiro/full.mp4",
      full: "/shot/terreiro/full.webp",
      cluster: ["/shot/terreiro/a.webp", "/shot/terreiro/b.webp", "/shot/terreiro/c.webp"],
      alt: {
        full: "Terreiro de concreto coberto de café secando em leiras paralelas sob o sol da tarde.",
        cluster: [
          "Macro de grãos de café em pergaminho secando ao sol.",
          "Rodo de madeira abrindo um sulco na cama de café, com poeira contra a luz.",
          "Camas suspensas de secagem em fila, com telas esticadas e estrutura de madeira.",
        ],
      },
    },
    // Ocre de terreiro no sol das duas da tarde. O capítulo mais quente.
    color: { bg: "#8a5c14", ink: "#fdf6e4", accent: "#ffe0a0", nav: "#ffe0a0", blend: false },
  },
  {
    key: "tambor",
    index: "03",
    title: "TAMBOR",
    nav: "Tambor",
    kicker: "O fogo",
    heading: "Onze minutos decidem tudo.",
    lead: "Do carregamento ao descarte, onze minutos e quarenta segundos. O primeiro crack chega perto dos nove e vinte e é ali que o café para de ser matéria-prima e vira decisão: mais trinta segundos e o floral some, menos trinta e a adstringência fica. A curva é escrita à mão, lote a lote.",
    headline: { lines: ["Onze minutos", "decidem", "tudo."], hot: 2 },
    wall: { wide: 0, mid: 1 },
    caption: "Tambor de ferro, fogo direto. O primeiro crack aos 9'20\".",
    hero: { value: "232", unit: "°C", label: "Temperatura de descarga" },
    stats: [
      { value: "232", unit: "°C", label: "Descarga" },
      { value: "11'40", label: "Curva total" },
      { value: "12", unit: "kg", label: "Por lote" },
    ],
    images: {
      video: "/shot/tambor/full.mp4",
      full: "/shot/tambor/full.webp",
      cluster: ["/shot/tambor/a.webp", "/shot/tambor/b.webp", "/shot/tambor/c.webp"],
      alt: {
        full: "Torrador de tambor de ferro fundido incandescente numa oficina escura, com chama visível sob a grelha.",
        cluster: [
          "Grãos de café em cascata dentro do tambor quente, iluminados por brasa.",
          "Mãos puxando a colher de prova com grãos escuros e brilhantes, sob luz de fogo.",
          "Macro de um único grão torrado, com a fenda central em S e brilho de óleo.",
        ],
      },
    },
    // Brasa. O ponto mais alto da jornada tem que ser o mais vermelho.
    color: { bg: "#6e2210", ink: "#fdeade", accent: "#ffb573", nav: "#ffb573", blend: true },
  },
  {
    key: "moenda",
    index: "04",
    title: "MOENDA",
    nav: "Moenda",
    kicker: "O ponto",
    heading: "Moído depois que você pede.",
    lead: "Café moído perde metade do aroma em quinze minutos e não volta mais. Por isso nada aqui é moído antes da hora: o pedido chega, a gente calibra pro seu método e o pó vai pro pacote ainda soltando gás. Se você tem moedor em casa, melhor ainda — manda em grão que a gente não encosta.",
    headline: { lines: ["Moído", "depois", "do pedido."], hot: 0 },
    wall: { wide: 0, mid: 2 },
    caption: "Mói na hora, no ponto do seu método — ou não mói.",
    hero: { value: "600", unit: "µm", label: "Ponto padrão, coado" },
    stats: [
      { value: "600", unit: "µm", label: "Ponto padrão" },
      { value: "4", label: "Métodos calibrados" },
      { value: "0", unit: "d", label: "Em prateleira" },
    ],
    images: {
      video: "/shot/moenda/full.mp4",
      full: "/shot/moenda/full.webp",
      cluster: ["/shot/moenda/a.webp", "/shot/moenda/b.webp", "/shot/moenda/c.webp"],
      alt: {
        full: "Moedor de fresas antigo em latão e ferro sobre bancada escura, com pó de café transbordando.",
        cluster: [
          "Macro de café moído fresco, com textura de terra revolvida sob luz rasante.",
          "Porta-filtro de espresso sendo preenchido com pó fresco.",
          "Filete de café moído caindo no ar contra fundo preto, iluminado por trás.",
        ],
      },
    },
    // Cobre e pó moído — a temperatura começa a baixar rumo à mesa.
    color: { bg: "#3c2517", ink: "#f6e9dc", accent: "#e0a468", nav: "#e0a468", blend: true },
  },
  {
    key: "xicara",
    index: "05",
    title: "XÍCARA",
    nav: "Xícara",
    kicker: "A mesa",
    heading: "Sete dias da torra até aqui.",
    lead: "Da bancada até a sua mesa em no máximo uma semana. Água a noventa e dois graus, um pra dezesseis, dois minutos e meio — é a receita que vai escrita no pacote, e é só um ponto de partida. O resto é você achar o seu. Café não é prova: é manhã.",
    headline: { lines: ["Sete dias", "da torra", "até aqui."], hot: 0 },
    wall: { wide: 1, mid: 2 },
    caption: "92 °C, 1:16, dois minutos e meio. O resto é gosto.",
    hero: { value: "92", unit: "°C", label: "Água na extração" },
    stats: [
      { value: "92", unit: "°C", label: "Água" },
      { value: "1:16", label: "Proporção" },
      { value: "7", unit: "d", label: "Da torra à mesa" },
    ],
    images: {
      video: "/shot/xicara/full.mp4",
      full: "/shot/xicara/full.webp",
      cluster: ["/shot/xicara/a.webp", "/shot/xicara/b.webp", "/shot/xicara/c.webp"],
      alt: {
        full: "Vista superior de um coado V60 na fase de bloom, com vapor contra a luz da janela.",
        cluster: [
          "Macro do creme do espresso, com marmoreio cor de avelã.",
          "Xícara branca de café preto sobre mesa de madeira escura, com vapor.",
          "Duas mãos envolvendo uma xícara quente sobre a mesa.",
        ],
      },
    },
    // O CAPÍTULO CLARO. Depois de quatro campos escuros seguidos, a mesa
    // abre em osso e a página respira — é a batida de contraste que impede o
    // scroll inteiro de virar um borrão marrom. Aqui a tinta inverte.
    color: { bg: "#e7dcc9", ink: "#1a1410", accent: "#8a4a1c", nav: "#8a4a1c", blend: false },
  },
];

/** Cor da nav fora dos capítulos (hero, intro, cafés, rodapé). */
export const NEUTRAL_NAV = "#c9b083";
