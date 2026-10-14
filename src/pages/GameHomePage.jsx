import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Gift } from "lucide-react";
import GameHeader from "../components/games/GameHeader";
import GameNavigation from "../components/games/GameNavigation";
import GameGuide from "../components/games/GameGuide";
import ErrorState from "../components/games/ErrorState";
import PlayNowButton from "../components/games/PlayNowButton";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { useGameCoins } from "../context/GameCoinContext";
import { getGame } from "../data/gamesData";
import { themes } from "../data/themes";
import { startSession } from "../services/gameService";
import { useBodyBg } from "../hooks/useBodyBg";
import tokenIcon from "../assets/ui/token.avif";
import coinIcon from "../assets/ui/coin.avif";
import styles from "./GameHomePage.module.css";

const DECOR = {
  "block-crush": { cls: "bricks", items: ["#6f8dff", "#8b6cff", "#3fc7b0", "#f6b94d", "#ff8f78", "#5aa9ff", "#c07cff", "#59d68c"] },
  "slice-storm": { cls: "fruit", items: ["🍉", "🍊", "🍓", "🥝", "🍍", "🍋", "🍎", "🍇"] },
};

function Decor({ slug }) {
  const d = DECOR[slug];
  if (!d) return null;
  return (
    <div className={`${styles.decor} ${styles[d.cls]}`} aria-hidden="true">
      {d.items.map((it, i) => (
        <span key={i} style={{ "--i": i, ...(d.cls === "bricks" ? { background: it } : {}) }}>{d.cls === "fruit" ? it : null}</span>
      ))}
      {d.cls === "fruit" && <i className={styles.slash} />}
    </div>
  );
}

export default function GameHomePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  const navigate = useNavigate();
  const toast = useToast();
  const { tokens, best, spendTokens, setLastGame } = useGameCoins();
  const [guideOpen, setGuideOpen] = useState(false);
  const [short, setShort] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);
  const theme = themes[slug];
  useBodyBg(theme?.["--g-bg-1"] || "#f4f7ff");
  useEffect(() => { if (game?.playable) setLastGame(slug); }, [slug]); // eslint-disable-line

  if (!game || !game.playable) return <Navigate to="/games" replace />;

  const enough = tokens >= game.cost;
  const play = async () => {
    if (starting) return;
    if (!enough) { setShort(true); return; }
    setStarting(true); setError(false);
    try {
      const session = await startSession(slug);
      if (!spendTokens(game.cost)) { setShort(true); setStarting(false); return; }
      toast(`${game.cost} Tokens deducted — good luck!`, "success");
      navigate(`/games/${slug}/play`, { state: { sessionId: session.sessionId } });
    } catch {
      setError(true); setStarting(false);
    }
  };

  return (
    <div className={styles.page} style={theme}>
      <Decor slug={slug} />
      <GameHeader onBack={() => navigate("/games")} backLabel="Back to Games" />
      {error ? (
        <ErrorState onRetry={play} onBack={() => navigate("/games")} />
      ) : (
        <main className={styles.main}>
          <motion.div className={styles.hero} initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className={styles.art}><img src={game.image} alt={`${game.name} artwork`} width="640" height="781" /></div>
          </motion.div>

          <motion.section className={styles.info} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.55 }}>
            <span className={styles.cat}>{game.category}</span>
            <h1>{game.name}</h1>
            <p className={styles.tag}>{game.tagline}</p>
            <p className={styles.desc}>{game.description}</p>

            <div className={styles.stats}>
              <div><Trophy size={16} /><span>Best score</span><b>{best[slug] || 0}</b></div>
              <div><img src={coinIcon} alt="" width="18" height="18" /><span>Reward</span><b>up to {game.reward.cap}</b></div>
            </div>

            <div className={styles.playBox}>
              <PlayNowButton size="lg" block icon label={starting ? "Starting…" : "Play Now"} state={starting ? "loading" : "idle"} onClick={play} ariaLabel={`Play ${game.name}, entry fee ${game.cost} Tokens`} />
              <div className={`${styles.entry} ${enough ? "" : styles.low}`}>
                <img src={tokenIcon} alt="" width="22" height="22" />
                <span>Entry fee <b>{game.cost} Tokens</b></span>
                <em>You have {tokens}</em>
              </div>
            </div>

            <div className={styles.cards}>
              <button type="button" className={styles.how} onClick={() => setGuideOpen(true)}><BookOpen size={18} /><span><b>How to Play</b><small>Quick guide</small></span></button>
              <div className={styles.rewards}><Gift size={18} /><span><b>Rewards</b><small>{game.reward.label}</small></span></div>
            </div>
          </motion.section>
        </main>
      )}
      <GameNavigation slug={slug} />

      <GameGuide game={game} open={guideOpen} onClose={() => setGuideOpen(false)} />
      <Modal open={short} onClose={() => setShort(false)} title="Not Enough Tokens">
        <p className={styles.shortText}>You need {game.cost} Tokens to play.</p>
        <div className={styles.shortBal}><img src={tokenIcon} alt="" width="26" height="26" /> Your Balance: <b>{tokens} Tokens</b></div>
        <button type="button" className={styles.shortCta} onClick={() => navigate("/redeem")}>Earn More Tokens</button>
        <button type="button" className={styles.shortGhost} onClick={() => setShort(false)}>Close</button>
      </Modal>
    </div>
  );
}
