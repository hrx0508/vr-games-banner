import { Heart } from "lucide-react";
import Modal from "../ui/Modal";
import styles from "./ReviveModal.module.css";

export default function ReviveModal({ open, score, onRevive, onDecline }) {
  return (
    <Modal open={open} title="Game Over" dismissible={false}>
      <div className={styles.score}><span>Score</span><strong>{score}</strong></div>
      <p className={styles.q}>Continue playing?</p>
      <button type="button" className={styles.revive} onClick={onRevive}><Heart size={18} fill="currentColor" /> Revive</button>
      <small className={styles.note}>One free revive per run — you keep your score.</small>
      <button type="button" className={styles.no} onClick={onDecline}>No Thanks</button>
    </Modal>
  );
}
