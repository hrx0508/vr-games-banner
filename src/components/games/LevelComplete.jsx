import { motion } from "framer-motion";
import { Star, Trophy } from "lucide-react";
import Modal from "../ui/Modal";
import styles from "./LevelComplete.module.css";

/** Shown the moment a level is cleared. Progress is already saved by then. */
export default function LevelComplete({ open, result, game, onNext, onCollect }) {
  if (!result) return <Modal open={false} />;
  const { level, stars, score, bonus, isLast } = result;
  return (
    <Modal open={open} title={isLast ? "All Levels Cleared!" : `Level ${level} Complete!`} dismissible={false}>
      <div className={styles.stars} aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <motion.span key={n} initial={{ scale: 0, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ delay: 0.15 + n * 0.18, type: "spring", stiffness: 360, damping: 14 }}>
            <Star size={44} fill={n <= stars ? "#f6b92b" : "none"} color={n <= stars ? "#f6b92b" : "#c9cee8"} strokeWidth={1.6} />
          </motion.span>
        ))}
      </div>
      <div className={styles.row}>
        <div><span>Score</span><b>{score}</b></div>
        <div><span>Level bonus</span><b>+{bonus}</b></div>
      </div>
      <p className={styles.saved}><Trophy size={14} /> Progress saved{isLast ? "" : ` · Level ${level + 1} unlocked`}</p>
      {!isLast && <button type="button" className={styles.next} onClick={onNext}>Next Level →</button>}
      <button type="button" className={isLast ? styles.next : styles.collect} onClick={onCollect}>{isLast ? "Collect Game Coins" : "Finish & Collect Coins"}</button>
    </Modal>
  );
}
