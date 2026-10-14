import { useEffect } from "react";
/** Keeps the page background (incl. iOS overscroll) consistent with the active theme. */
export function useBodyBg(color) {
  useEffect(() => { const prev = document.body.style.background; document.body.style.background = color; return () => { document.body.style.background = prev; }; }, [color]);
}
