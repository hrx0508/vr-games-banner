import { Check, Lock, Star } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./LevelSelect.module.css";

/** Level map: completed levels show their stars, the next one glows, the rest are locked. Choosing a level never costs extra. */
export default function LevelSelect({ levels, unlocked, selected, stars, onSelect }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.strip} role="group" aria-label="Choose a level">
        {levels.map((l) => {
          const locked = l.level > unlocked, done = (stars[l.level] || 0) > 0, current = l.level === unlocked && !done, on = l.level === selected;
          return (
            <button key={l.level} type="button" disabled={locked} aria-pressed={on} aria-label={locked ? `Level ${l.level} locked` : `Level ${l.level}: ${l.name}${done ? `, ${stars[l.level]} stars` : ""}`}
              className={`${styles.lvl} ${locked ? styles.locked : ""} ${done ? styles.done : ""} ${current ? styles.current : ""} ${on ? styles.on : ""}`} onClick={() => onSelect(l.level)}>
              {on && <motion.i layoutId="lvl-ring" className={styles.ring} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
              <span className={styles.num}>{locked ? <Lock size={16} /> : l.level}</span>
              <span className={styles.stars} aria-hidden="true">
                {[1, 2, 3].map((n) => <Star key={n} size={11} fill={n <= (stars[l.level] || 0) ? "#f6b92b" : "none"} color={n <= (stars[l.level] || 0) ? "#f6b92b" : "#c3c9e6"} strokeWidth={2} />)}
              </span>
              {done && <b className={styles.tick}><Check size={11} strokeWidth={3.4} /></b>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
