import { ChevronLeft } from "lucide-react";
import GameCoinBalance from "./GameCoinBalance";
import styles from "./GameHeader.module.css";

export default function GameHeader({ onBack, backLabel = "Back", title, children, balance = true }) {
  return (
    <header className={styles.header}>
      <button type="button" className={styles.back} onClick={onBack} aria-label={backLabel}>
        <ChevronLeft size={20} /><span>Back</span>
      </button>
      {title && <h1 className={styles.title}>{title}</h1>}
      <div className={styles.right}>{children}{balance && <GameCoinBalance target />}</div>
    </header>
  );
}
