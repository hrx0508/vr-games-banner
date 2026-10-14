import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Grid2x2, Gamepad2, Menu, RotateCcw, X } from "lucide-react";
import { useGameCoins } from "../../context/GameCoinContext";
import tokenIcon from "../../assets/ui/token.avif";
import coinIcon from "../../assets/ui/coin.avif";
import styles from "./AppHeader.module.css";

/** Brand bar + hamburger menu (navigation, live balances and the demo tools). */
export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const { tokens, gameCoins, setTokens, resetDemo } = useGameCoins();
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => panel.current?.querySelector("a,button")?.focus(), 60);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open]);

  const link = ({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`;
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/games" className={styles.brand} aria-label="VELOOP — Games home">
          <span className={styles.logo}>V</span>
          <span className={styles.text}><b>VELOOP</b><small>PLAY <i>•</i> EARN <i>•</i> REDEEM</small></span>
        </Link>
        <button type="button" className={styles.burger} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className={styles.scrim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.nav ref={panel} className={styles.panel} aria-label="Main menu" initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.2 }}>
              <NavLink to="/games" end className={link} onClick={() => setOpen(false)}><Gamepad2 size={18} /> Games</NavLink>
              <NavLink to="/all-games" className={link} onClick={() => setOpen(false)}><Grid2x2 size={18} /> Browse All Games</NavLink>
              <NavLink to="/redeem" className={link} onClick={() => setOpen(false)}><Gift size={18} /> Redeem</NavLink>

              <div className={styles.bal}>
                <span><img src={tokenIcon} alt="" width="22" height="22" /><b>{tokens}</b><small>Tokens</small></span>
                <span><img src={coinIcon} alt="" width="22" height="22" /><b>{gameCoins}</b><small>Game Coins</small></span>
              </div>

              <div className={styles.demo}>
                <small>Demo tools</small>
                <div>
                  <button type="button" onClick={() => setTokens(150)}>Tokens 150</button>
                  <button type="button" onClick={() => setTokens(12)}>Tokens 12</button>
                  <button type="button" onClick={resetDemo}><RotateCcw size={13} /> Reset</button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
