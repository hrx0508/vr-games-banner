import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import coinIcon from "../../assets/ui/coin.avif";
import { useGameCoins } from "../../context/GameCoinContext";
import { useCountUp } from "../../hooks/useCountUp";
import styles from "./GameCoinBalance.module.css";

/** Reads the single central balance. `target` marks it as the landing spot for the reward-flight animation. */
export default function GameCoinBalance({ target = false, large = false }) {
  const { gameCoins } = useGameCoins();
  const shown = useCountUp(gameCoins);
  const controls = useAnimation();
  const prev = useRef(gameCoins);
  useEffect(() => {
    if (prev.current !== gameCoins) { controls.start({ scale: [1, 1.14, 1], transition: { duration: 0.5 } }); prev.current = gameCoins; }
  }, [gameCoins, controls]);
  return (
    <motion.div id={target ? "game-coin-target" : undefined} className={`${styles.chip} ${large ? styles.large : ""}`} animate={controls} role="status" aria-label={`${gameCoins} Game Coins`}>
      <img src={coinIcon} alt="" width="28" height="28" />
      <span className={styles.num}>{shown}</span>
      <span className={styles.lbl}>Game<br />Coins</span>
    </motion.div>
  );
}
