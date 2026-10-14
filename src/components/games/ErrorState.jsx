import { AlertTriangle } from "lucide-react";
import styles from "./ErrorState.module.css";

export default function ErrorState({ onRetry, onBack, message = "We couldn't start the game." }) {
  return (
    <div className={styles.wrap} role="alert">
      <div className={styles.icon}><AlertTriangle size={30} /></div>
      <h2>Something went wrong.</h2>
      <p>{message}</p>
      {onRetry && <button type="button" className={styles.primary} onClick={onRetry}>Try Again</button>}
      <button type="button" className={styles.secondary} onClick={onBack}>Back to Games</button>
    </div>
  );
}
