import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./CategoryTabs.module.css";

/** Horizontally scrollable filter chips: All, Puzzle, Arcade… The active chip is kept in view. */
export default function CategoryTabs({ items, active, onSelect }) {
  const bar = useRef(null);
  useEffect(() => {
    const el = bar.current?.querySelector('[aria-pressed="true"]');
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <div className={styles.wrap}>
      <div ref={bar} className={styles.bar} role="group" aria-label="Filter games by category">
        {items.map(({ name, count }) => {
          const on = name === active;
          return (
            <button key={name} type="button" className={`${styles.chip} ${on ? styles.on : ""}`} aria-pressed={on} onClick={() => onSelect(name)}>
              {on && <motion.span layoutId="cat-pill" className={styles.pill} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={styles.label}>{name}</span>
              <span className={styles.count}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
