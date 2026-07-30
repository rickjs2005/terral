import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query como fonte externa, e não como estado sincronizado num efeito.
 *
 * A versão com `useState` + `useEffect` funciona, mas custa um render extra
 * logo depois da montagem — e nesta página esse render extra remonta o
 * <Canvas> do R3F. Com `useSyncExternalStore` o valor já chega certo no
 * primeiro render do cliente e ainda acompanha mudanças (girar o aparelho,
 * plugar um mouse num tablet).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // No servidor não há tela: assume o caminho conservador (desktop, sem
    // toque), que é o que o HTML estático já descreve.
    () => false,
  );
}
