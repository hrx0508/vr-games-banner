import { Bomb, Coins, Heart, MoveHorizontal, Target, Hand, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../ui/Modal";
import styles from "./GameGuide.module.css";

const icons = { move: MoveHorizontal, target: Target, heart: Heart, coins: Coins, swipe: Hand, combo: Zap, bomb: Bomb };

/** HOW TO PLAY — shown automatically the first time, reopenable from the Game Home page. */
export default function GameGuide({ game, open, onClose, cta = "Got it" }) {
  return (
    <Modal open={open} onClose={onClose} title="How to play" dismissible={false}>
      <div className={styles.art}><img src={game.image} alt="" width="120" height="146" /></div>
      <p className={styles.sub}>{game.name}</p>
      <ol className={styles.steps}>
        {game.guide.map((s, i) => {
          const Icon = icons[s.icon] || Target;
          return (
            <motion.li key={s.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
              <span className={styles.ic}><Icon size={18} /></span>
              <span><strong>{s.title}</strong><small>{s.text}</small></span>
            </motion.li>
          );
        })}
      </ol>
      <button type="button" className={styles.cta} onClick={onClose}>{cta}</button>
    </Modal>
  );
}
