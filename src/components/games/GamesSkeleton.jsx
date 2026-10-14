import styles from "./GamesSkeleton.module.css";

/** Loading state shaped like the real compact cards — no blank area while data loads. */
export default function GamesSkeleton() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label="Loading games">
      <div className={styles.row} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => <div key={i} className={styles.card}><span /></div>)}
      </div>
      <p className={styles.msg}>Loading games…</p>
    </div>
  );
}
