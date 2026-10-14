import { useState } from "react";
import { CheckCircle2, Frown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import coinIcon from "../../assets/ui/coin.avif";
import { useGameCoins } from "../../context/GameCoinContext";
import styles from "./RedeemConfirmModal.module.css";

/** Confirm → success, or "Not Enough Game Coins" (with a path back to playing). */
export default function RedeemConfirmModal({ option, onClose }) {
  const { gameCoins, redeem } = useGameCoins();
  const navigate = useNavigate();
  const [done, setDone] = useState(null);
  const open = !!option;
  if (!option && !done) return <Modal open={false} />;
  const o = option || done;
  const short = gameCoins < o.cost;
  const close = () => { setDone(null); onClose(); };

  const confirm = () => { const r = redeem(o.id); if (r.ok) setDone(o); };

  if (done) {
    return (
      <Modal open onClose={close} title="Redemption Successful">
        <div className={styles.ok}><CheckCircle2 size={44} /></div>
        <div className={styles.get}><img src={done.icon} alt="" width="46" height="46" /><strong>+{done.amount} {done.name}</strong></div>
        <p className={styles.sub}>Remaining: <b>{gameCoins}</b> Game Coins</p>
        <button type="button" className={styles.primary} onClick={close}>Done</button>
      </Modal>
    );
  }

  if (short) {
    return (
      <Modal open={open} onClose={close} title="Not Enough Game Coins">
        <div className={styles.sad}><Frown size={40} /></div>
        <div className={styles.rows}>
          <div><span>You have</span><b><img src={coinIcon} alt="" width="20" height="20" /> {gameCoins}</b></div>
          <div><span>Required</span><b><img src={coinIcon} alt="" width="20" height="20" /> {o.cost}</b></div>
        </div>
        <p className={styles.sub}>Keep playing games to earn more!</p>
        <button type="button" className={styles.primary} onClick={() => { close(); navigate("/games"); }}>Play Games</button>
        <button type="button" className={styles.ghost} onClick={close}>Close</button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} title="Redeem Game Coins?">
      <p className={styles.sub}>You are about to convert</p>
      <div className={styles.conv}>
        <div><img src={coinIcon} alt="" width="40" height="40" /><b>{o.cost}</b><span>Game Coins</span></div>
        <span className={styles.arrow}>→</span>
        <div><img src={o.icon} alt="" width="44" height="44" /><b>{o.amount}</b><span>{o.name}</span></div>
      </div>
      <p className={styles.sub}>Remaining: <b>{gameCoins - o.cost}</b> Game Coins</p>
      <div className={styles.actions}>
        <button type="button" className={styles.ghost} onClick={close}>Cancel</button>
        <button type="button" className={styles.primary} onClick={confirm}>Confirm</button>
      </div>
    </Modal>
  );
}
