import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import coinIcon from "../../assets/ui/coin.avif";
import styles from "./RedeemCard.module.css";

export default function RedeemCard({ option, balance, onRedeem, index = 0 }) {
  const can = balance >= option.cost;
  return (
    <motion.article className={`${styles.card} ${can ? "" : styles.locked}`} style={{ "--tint": option.color }}
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index, duration: 0.4 }}>
      <div className={styles.top}>
        <div className={styles.icons}>
          <img src={coinIcon} alt="" width="30" height="30" /><ArrowRight size={16} />
          <img src={option.icon} alt="" width="40" height="40" className={styles.reward} />
        </div>
        <div className={styles.copy}><h3>Game Coins → {option.name}</h3><p>{option.description}</p></div>
      </div>
      <div className={styles.rate}><strong>{option.cost}</strong> Coins <ArrowRight size={14} /> <strong>{option.amount}</strong> {option.name}</div>
      <button type="button" className={styles.btn} onClick={() => onRedeem(option)} aria-label={`Redeem ${option.cost} Game Coins for ${option.amount} ${option.name}`}>
        {can ? "Redeem" : `Need ${option.cost - balance} more`}
      </button>
    </motion.article>
  );
}
