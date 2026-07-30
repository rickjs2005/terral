"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

/** Tempo mínimo de tela preta, mesmo com tudo em cache. */
const MIN_HOLD = 0.9;

/**
 * O portão — deliberadamente quase nada.
 *
 * Antes ele desenhava a marca em estêncil, e isso era um erro: gastava o
 * momento de abertura num logotipo e deixava a formação do grão como
 * sobremesa de um público já saciado. Agora ele só segura o escuro enquanto
 * a malha e o decodificador Draco chegam, e sai — porque o espetáculo de
 * abertura é o pó se juntando, e ele precisa acontecer no vazio.
 *
 * O que sobrou: um fio de ouro que atravessa a base. É o suficiente pra
 * dizer "está vindo" sem competir com o que vem.
 *
 * Regra de ouro: portão nenhum pode virar parede. Se a GPU falhar, o
 * `sceneReady` chega por timeout no shell e o site abre do mesmo jeito.
 */
export function Loader({ sceneReady, onDone }: { sceneReady: boolean; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const [held, setHeld] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setGone(true);
      onDone();
      return;
    }
    // A barra avança até 88% por conta própria: o resto só quando a cena
    // avisa. Barra que chega a 100% e fica esperando mente pro usuário.
    gsap.fromTo(
      ".loader-bar",
      { scaleX: 0 },
      { scaleX: 0.88, duration: 2.2, ease: "power2.out" },
    );
    gsap.fromTo(
      ".loader-note",
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.25 },
    );
    const timer = window.setTimeout(() => setHeld(true), MIN_HOLD * 1000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  useEffect(() => {
    if (!sceneReady || !held || gone || reduced.current) return;
    const tl = gsap.timeline({
      onComplete: () => {
        setGone(true);
        onDone();
      },
    });
    tl.to(".loader-bar", { scaleX: 1, duration: 0.35, ease: "power2.inOut" })
      .to(".loader-note", { opacity: 0, duration: 0.3 }, 0.1)
      .to(".loader", { opacity: 0, duration: 0.4, ease: "power2.inOut" }, 0.25);
    return () => {
      tl.kill();
    };
  }, [sceneReady, held, gone, onDone]);

  if (gone) return null;

  return (
    <div ref={root}>
      <div className="loader">
        <p className="loader-note t-micro text-[var(--color-gold)] opacity-0">
          Torrefação artesanal · Minas Gerais
        </p>
        <div className="loader-bar" />
      </div>
      <p className="sr-only" role="status">
        Carregando TERRAL
      </p>
    </div>
  );
}
