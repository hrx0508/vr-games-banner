import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History } from "lucide-react";
import GameHeader from "../components/games/GameHeader";
import GameNavigation from "../components/games/GameNavigation";
import GameCoinBalance from "../components/games/GameCoinBalance";
import RedeemCard from "../components/games/RedeemCard";
import RedeemConfirmModal from "../components/games/RedeemConfirmModal";
import { useGameCoins } from "../context/GameCoinContext";
import { getRedeemOption, redeemOptions } from "../data/redeemData";
import { themes } from "../data/themes";
import { useBodyBg } from "../hooks/useBodyBg";
import coinIcon from "../assets/ui/coin.avif";
import tokenIcon from "../assets/ui/token.avif";
import veIcon from "../assets/ui/ve.avif";
import sveIcon from "../assets/ui/sve.avif";
import gemIcon from "../assets/ui/gem.avif";
import spinIcon from "../assets/ui/spin.avif";
import styles from "./GameRedeemPage.module.css";

const when = (at) => {
  const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(at).setHours(0, 0, 0, 0)) / 86400000);
  return d <= 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
};

export default function GameRedeemPage() {
  const navigate = useNavigate();
  const { gameCoins, tokens, wallet, history, lastGame } = useGameCoins();
  const [selected, setSelected] = useState(null);
  const homeSlug = lastGame || "block-crush";
  const theme = themes[homeSlug] || themes.redeem;
  useBodyBg(theme["--g-bg-1"]);

  const wal = [
    { k: "ve", icon: veIcon, v: wallet.ve, n: "VEs" }, { k: "sve", icon: sveIcon, v: wallet.sve, n: "SVEs" },
    { k: "gems", icon: gemIcon, v: wallet.gems, n: "Gems" }, { k: "tokens", icon: tokenIcon, v: tokens, n: "Tokens" },
    { k: "spins", icon: spinIcon, v: wallet.spins, n: "Spins" },
  ];

  return (
    <div className={styles.page} style={theme}>
      <GameHeader onBack={() => navigate(`/games/${homeSlug}`)} backLabel="Back to game" title="Redeem" />
      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>REDEEM GAME COINS</span>
          <GameCoinBalance large />
          <p>Convert your Game Coins into VELOOP rewards.</p>
        </section>

        <section className={styles.wallet} aria-label="Your rewards">
          {wal.map((w) => (<div key={w.k}><img src={w.icon} alt="" width="30" height="30" /><b>{w.v}</b><span>{w.n}</span></div>))}
        </section>

        <section className={styles.grid} aria-label="Redemption options">
          {redeemOptions.map((o, i) => <RedeemCard key={o.id} option={o} index={i} balance={gameCoins} onRedeem={setSelected} />)}
        </section>

        <section className={styles.history} aria-labelledby="hist">
          <h2 id="hist"><History size={16} /> Recent Redemptions</h2>
          {history.length === 0 ? <p className={styles.empty}>No redemptions yet.</p> : (
            <ul>
              {history.slice(0, 6).map((h) => {
                const o = getRedeemOption(h.optionId);
                return (
                  <li key={h.id}>
                    <img src={coinIcon} alt="" width="22" height="22" /><b>{h.coins}</b><span className={styles.to}>→</span>
                    <img src={o?.icon} alt="" width="24" height="24" /><b>{h.amount} {o?.name}</b><time>{when(h.at)}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <GameNavigation slug={homeSlug} />
      <RedeemConfirmModal option={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
