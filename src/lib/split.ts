/**
 * Splitter de texto próprio (sem SplitText, que é pago).
 *
 * A parte que importa não é quebrar em letras — é AGRUPAR POR LINHA. Sem
 * isso o stagger atravessa a quebra de linha e o texto sobe torto; com isso
 * cada linha entra como uma unidade e a leitura cascateia de cima pra baixo,
 * que é o que faz parecer tipografia e não animação.
 *
 * As linhas são medidas por `offsetTop` DEPOIS das palavras existirem e
 * ANTES de qualquer wrapper — envolver primeiro mudaria a quebra e a medida
 * sairia errada.
 */

export type Split = {
  lines: HTMLElement[];
  words: HTMLElement[];
  chars: HTMLElement[];
  revert: () => void;
};

const EMPTY: Split = { lines: [], words: [], chars: [], revert: () => {} };

/** Segmenta respeitando grafemas — "ç", "ã" e emoji não podem ser partidos. */
function toChars(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("pt-BR", { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * Achata o conteúdo em letras, guardando de qual destaque cada uma veio.
 *
 * Sem isso o splitter lia `el.textContent` e reescrevia o `innerHTML` inteiro:
 * um `<em class="voice">sua</em>` dentro da manchete virava texto comum e o
 * itálico sumia da tela. Aqui a árvore é percorrida de verdade e a classe do
 * ancestral viaja junto com o grafema, então o destaque sobrevive ao corte.
 *
 * Só CLASSES viajam — um `<a>` dentro de um bloco cortado continua perdendo o
 * href, porque o splitter troca a marcação por spans. Não coloque link dentro
 * de `data-reveal`.
 */
type Piece = { grapheme: string; cls: string };

function flatten(node: Node, inherited: string, out: Piece[]) {
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      for (const grapheme of toChars(child.nodeValue ?? "")) {
        out.push({ grapheme, cls: inherited });
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const own = (child as HTMLElement).className;
      flatten(child, [inherited, own].filter(Boolean).join(" "), out);
    }
  }
}

export function splitText(el: HTMLElement, mode: "chars" | "words" = "chars"): Split {
  const source = el.textContent ?? "";
  if (!source.trim()) return EMPTY;

  const original = el.innerHTML;

  const pieces: Piece[] = [];
  flatten(el, "", pieces);

  // 1. palavras em inline-block, separadas por nós de texto de verdade —
  //    é o espaço solto que deixa o navegador continuar quebrando linha.
  const frag = document.createDocumentFragment();
  const words: HTMLElement[] = [];
  const groups: Piece[][] = [];
  let current: Piece[] | null = null;

  for (const piece of pieces) {
    if (/^\s+$/.test(piece.grapheme)) {
      if (current) current = null;
      // um único espaço por corrida de espaços: o resto é ruído de indentação
      if (frag.lastChild?.nodeType !== Node.TEXT_NODE) {
        frag.appendChild(document.createTextNode(" "));
      }
      continue;
    }
    if (!current) {
      current = [];
      groups.push(current);
      const word = document.createElement("span");
      word.className = "split-word";
      words.push(word);
      frag.appendChild(word);
    }
    current.push(piece);
  }

  // texto puro por enquanto: a medida de linha do passo 2 precisa da palavra
  // inteira, e as letras só existem no passo 4.
  for (let i = 0; i < words.length; i++) {
    words[i].textContent = groups[i].map((p) => p.grapheme).join("");
    // em modo palavra não há letra pra carregar a classe — se a palavra toda
    // vem de um destaque só, ela mesma carrega.
    const cls = groups[i][0].cls;
    if (mode === "words" && cls && groups[i].every((p) => p.cls === cls)) {
      words[i].className = `split-word ${cls}`;
    }
  }

  el.textContent = "";
  el.appendChild(frag);

  // 2. medir a quebra real e agrupar por linha
  const rows = new Map<number, HTMLElement[]>();
  for (const word of words) {
    // arredonda: subpixel de baseline não pode inventar uma linha nova
    const top = Math.round(word.offsetTop);
    const bucket = rows.get(top);
    if (bucket) bucket.push(word);
    else rows.set(top, [word]);
  }

  // 3. envolver cada linha numa máscara (overflow hidden mora aqui)
  const lines: HTMLElement[] = [];
  for (const [, group] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
    const line = document.createElement("span");
    line.className = "split-line";
    group[0].parentNode?.insertBefore(line, group[0]);
    for (let i = 0; i < group.length; i++) {
      if (i > 0) line.appendChild(document.createTextNode(" "));
      line.appendChild(group[i]);
    }
    lines.push(line);
  }

  // 4. letras, se pedido
  const chars: HTMLElement[] = [];
  if (mode === "chars") {
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      word.textContent = "";
      for (const piece of groups[i]) {
        const char = document.createElement("span");
        char.className = piece.cls ? `split-char ${piece.cls}` : "split-char";
        char.textContent = piece.grapheme;
        word.appendChild(char);
        chars.push(char);
      }
    }
  }

  return {
    lines,
    words,
    chars,
    revert: () => {
      el.innerHTML = original;
    },
  };
}

/** Índice da linha de cada palavra/letra — usado pra escalonar por linha. */
export function lineIndexOf(node: HTMLElement, lines: HTMLElement[]): number {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].contains(node)) return i;
  }
  return 0;
}
