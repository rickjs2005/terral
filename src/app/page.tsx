import { ChapterSection } from "@/components/chapter";
import { Coffees } from "@/components/coffees";
import { Hero } from "@/components/hero";
import { Intro } from "@/components/intro";
import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteShell } from "@/components/site-shell";
import { CHAPTERS } from "@/lib/chapters";

/**
 * A página é uma leitura só, do começo ao fim:
 *
 *   hero        o grão e o nome
 *   manifesto   o ar antes da faixa
 *   01..05      cinco capítulos horizontais fixados
 *   cafés       o que dá pra levar pra casa
 *   rodapé      o fecho e o que está escondido nele
 */
export default function Home() {
  return (
    <SiteShell>
      <Nav />
      <main>
        <Hero />
        <Intro />
        {CHAPTERS.map((chapter, i) => (
          <ChapterSection key={chapter.key} chapter={chapter} first={i === 0} />
        ))}
        <Coffees />
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
