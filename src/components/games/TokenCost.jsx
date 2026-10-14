import tokenIcon from "../../assets/ui/token.avif";
import styles from "./TokenCost.module.css";

/** Compact entry-fee chip: token icon (20px) + "20". Insufficient state shows "12/20" in warning colour. */
export default function TokenCost({ cost, balance, insufficient = false, size = 20 }) {
  return (
    <span className={`${styles.chip} ${insufficient ? styles.low : ""}`} title={`Entry fee: ${cost} Tokens`}
      aria-label={insufficient ? `You have ${balance} Tokens, ${cost} required` : `Entry fee ${cost} Tokens`}>
      <img src={tokenIcon} alt="" width={size} height={size} className={styles.icon} style={{ width: size, height: size }} />
      <b>{insufficient ? `${balance}/${cost}` : cost}</b>
    </span>
  );
}
