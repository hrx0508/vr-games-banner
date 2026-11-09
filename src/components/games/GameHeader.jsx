import { ChevronLeft } from "lucide-react";
import GameCoinBalance from "./GameCoinBalance";
import styles from "./GameHeader.module.css";

/** Sub-page header, same pattern as the VELoop site (Daily Streak / Spin the Wheel): rounded bar, circular back button, title. Balance on the right. */
export default function GameHeader({ onBack, backLabel = "Back", title, children, balance = true }) {
  return (
    <header className={styles.wrap}>
      <div className={styles.bar}>
        <button type="button" className={styles.back} onClick={onBack} aria-label={backLabel}><ChevronLeft size={24} strokeWidth={2.6} /></button>
        {title && <h1 className={styles.title}>{title}</h1>}
        <div className={styles.right}>{children}{balance && <GameCoinBalance target />}</div>
      </div>
    </header>
  );
}
