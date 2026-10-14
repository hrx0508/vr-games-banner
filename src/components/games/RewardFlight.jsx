import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import coinIcon from "../../assets/ui/coin.avif";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Coins fly from `fromRef` to the balance chip (#game-coin-target), then onLand() fires once. */
export default function RewardFlight({ fromRef, count = 8, onLand }) {
  const [geo, setGeo] = useState(null);
  const reduced = useReducedMotion();
  const done = useRef(false);
  const land = () => { if (!done.current) { done.current = true; onLand?.(); } };

  useLayoutEffect(() => {
    const t = document.getElementById("game-coin-target")?.getBoundingClientRect();
    const f = fromRef.current?.getBoundingClientRect();
    if (!t || !f || reduced) { setGeo(false); return; }
    setGeo({ fx: f.left + f.width / 2, fy: f.top + f.height / 2, tx: t.left + 22, ty: t.top + t.height / 2 });
  }, [fromRef, reduced]);

  useEffect(() => { if (geo === false) { const id = setTimeout(land, 250); return () => clearTimeout(id); } }, [geo]); // eslint-disable-line
  if (!geo) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1100 }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <motion.img key={i} src={coinIcon} alt="" width="30" height="30"
          style={{ position: "fixed", left: geo.fx - 15, top: geo.fy - 15, width: 30, height: 30 }}
          initial={{ x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 40, scale: 0.4, opacity: 0 }}
          animate={{ x: geo.tx - geo.fx, y: geo.ty - geo.fy, scale: [0.4, 1.2, 0.7], opacity: [0, 1, 1, 0.9] }}
          transition={{ delay: 0.15 + i * 0.09, duration: 0.85, ease: [0.5, 0, 0.3, 1] }}
          onAnimationComplete={i === count - 1 ? land : undefined} />
      ))}
    </div>
  );
}
