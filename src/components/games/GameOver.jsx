import { useRef } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import coinIcon from "../../assets/ui/coin.avif";
import RewardFlight from "./RewardFlight";
import styles from "./GameOver.module.css";

/** Final result: calculates → shows reward → flies coins to the balance → lets the user return. */
export default function GameOver({ game, score, reward, isBest, landed, onLanded, onContinue }) {
  const coinRef = useRef(null);
  const ready = reward !== null;
  return (
    <motion.div className={styles.wrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className={styles.card} initial={{ y: 40, scale: 0.94, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}>
        <h2>Game Over</h2>
        <p className={styles.game}>{game.name}</p>
        <div className={styles.score}><span>Score</span><strong>{score}</strong>{isBest && <em><Trophy size={13} /> New best!</em>}</div>
        <div className={styles.earn}>
          <span>You earned</span>
          <div className={styles.row}>
            <motion.img ref={coinRef} src={coinIcon} alt="" width="46" height="46" animate={ready ? { rotateY: [0, 360] } : {}} transition={{ duration: 1.1, ease: "easeInOut" }} />
            <strong aria-live="polite">{ready ? `+${reward}` : "…"}</strong>
            <small>Game Coins</small>
          </div>
        </div>
        {ready && !landed && <RewardFlight fromRef={coinRef} count={Math.min(10, Math.max(3, reward))} onLand={onLanded} />}
        <button type="button" className={styles.cta} onClick={onContinue} disabled={!landed}>
          {landed ? "Back to Game Home" : "Adding to your balance…"}
        </button>
      </motion.div>
    </motion.div>
  );
}
