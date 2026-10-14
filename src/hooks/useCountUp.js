import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/** Tweens a displayed number toward `value` (used so balance changes feel earned, not teleported). */
export function useCountUp(value, ms = 700) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || from.current === value) { from.current = value; setShown(value); return; }
    const start = performance.now(), a = from.current;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / ms), e = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(a + (value - a) * e));
      if (p < 1) raf = requestAnimationFrame(step); else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value, ms, reduced]);
  return shown;
}
