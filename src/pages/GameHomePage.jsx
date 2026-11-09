import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Gift, Play, Target, Trophy } from "lucide-react";
import GameHeader from "../components/games/GameHeader";
import GameNavigation from "../components/games/GameNavigation";
import GameGuide from "../components/games/GameGuide";
import GameScene from "../components/games/GameScene";
import LevelSelect from "../components/games/LevelSelect";
import ErrorState from "../components/games/ErrorState";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { useGameCoins } from "../context/GameCoinContext";
import { getGame } from "../data/gamesData";
import { getLevel, getLevels, levelObjective } from "../data/levelsData";
import { themes } from "../data/themes";
import { startSession } from "../services/gameService";
import { useBodyBg } from "../hooks/useBodyBg";
import tokenIcon from "../assets/ui/token.avif";
import coinIcon from "../assets/ui/coin.avif";
import styles from "./GameHomePage.module.css";

export default function GameHomePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  const navigate = useNavigate();
  const toast = useToast();
  const { tokens, best, progress, spendTokens, setLastGame } = useGameCoins();
  const levels = getLevels(slug);
  const prog = progress[slug] || { unlocked: 1, stars: {}, cleared: 0 };
  const [selected, setSelected] = useState(prog.unlocked);
  const [guideOpen, setGuideOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [short, setShort] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);
  const theme = themes[slug];
  useBodyBg(theme?.["--g-bg-1"] || "#f4f7ff");
  useEffect(() => { if (game?.playable) setLastGame(slug); }, [slug]); // eslint-disable-line
  useEffect(() => { setSelected(prog.unlocked); }, [prog.unlocked]);

  if (!game || !game.playable) return <Navigate to="/games" replace />;

  const enough = tokens >= game.cost;
  const lvl = getLevel(slug, selected);
  const resuming = prog.unlocked > 1 && selected === prog.unlocked;
  const allDone = prog.cleared >= levels.length;

  const play = async () => {
    if (starting) return;
    if (!enough) { setShort(true); return; }
    setStarting(true); setError(false);
    try {
      const session = await startSession(slug);
      if (!spendTokens(game.cost)) { setShort(true); setStarting(false); return; }
      toast(`${game.cost} Tokens deducted — Level ${selected}, good luck!`, "success");
      navigate(`/games/${slug}/play`, { state: { sessionId: session.sessionId, level: selected } });
    } catch {
      setError(true); setStarting(false);
    }
  };

  return (
    <div className={styles.page} style={theme} data-game={slug}>
      <GameHeader onBack={() => navigate("/games")} backLabel="Back to Games" title={game.name} />
      {error ? (
        <ErrorState onRetry={play} onBack={() => navigate("/games")} />
      ) : (
        <main className={styles.main}>
          <motion.section className={styles.stageCol} initial={{ opacity: 0, y: 22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <GameScene slug={slug} game={game} />
          </motion.section>

          <motion.section className={styles.panel} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <div className={styles.titleBlock}>
              <div className={styles.pills}>
                <span className={styles.cat}>{game.category}</span>
                <span className={styles.lvlPill}><Target size={13} /> {prog.cleared}/{levels.length} levels cleared</span>
              </div>
              <h2>{game.name}</h2>
              <p className={styles.tag}>{game.tagline}</p>
              <p className={styles.desc}>{game.description}</p>
            </div>

            <section className={styles.card} aria-labelledby="lv-h">
              <div className={styles.cardHead}>
                <h3 id="lv-h">Select Level</h3>
                {resuming && <span className={styles.resume}>Continue where you left off</span>}
                {allDone && <span className={styles.resume}>All levels cleared 🎉</span>}
              </div>
              <LevelSelect levels={levels} unlocked={prog.unlocked} selected={selected} stars={prog.stars} onSelect={setSelected} />
              <div className={styles.objective} aria-live="polite">
                <b>Level {selected} · {lvl?.name}</b>
                <span>{levelObjective(slug, selected)}</span>
              </div>
            </section>

            <div className={styles.playBox}>
              <button type="button" className={`${styles.play} ${enough ? "" : styles.low}`} onClick={play} disabled={starting} aria-busy={starting}
                aria-label={`Play ${game.name} level ${selected}. Entry fee ${game.cost} Tokens`}>
                <span className={styles.shine} aria-hidden="true" />
                <span className={styles.playTop}>{starting ? "Starting…" : <><Play size={20} fill="currentColor" /> Play Now</>}</span>
                <span className={styles.playFee}>
                  Entry Fee <img src={tokenIcon} alt="" width="20" height="20" /> <b>{game.cost} Tokens</b>
                </span>
              </button>
              <p className={`${styles.balance} ${enough ? "" : styles.warn}`}>
                <img src={tokenIcon} alt="" width="18" height="18" />
                {enough ? <>You have <b>{tokens} Tokens</b></> : <>You have <b>{tokens} Tokens</b> — you need {game.cost} to play</>}
              </p>
            </div>

            <div className={styles.cards}>
              <button type="button" className={styles.tile} onClick={() => setGuideOpen(true)}>
                <span className={styles.tileIc}><BookOpen size={20} /></span><span><b>How to Play</b><small>Controls &amp; objectives</small></span>
              </button>
              <button type="button" className={styles.tile} onClick={() => setRewardsOpen(true)}>
                <span className={styles.tileIc}><Gift size={20} /></span><span><b>Rewards</b><small>Earn Game Coins</small></span>
              </button>
            </div>

            <div className={styles.stats}>
              <div><Trophy size={18} /><span>Best score</span><b>{best[slug] || 0}</b></div>
              <div><img src={coinIcon} alt="" width="20" height="20" /><span>Max reward / run</span><b>{game.reward.cap}</b></div>
            </div>
          </motion.section>
        </main>
      )}
      <GameNavigation slug={slug} />

      <GameGuide game={game} open={guideOpen} onClose={() => setGuideOpen(false)} />
      <Modal open={rewardsOpen} onClose={() => setRewardsOpen(false)} title="Rewards">
        <div className={styles.rw}>
          <div><img src={coinIcon} alt="" width="30" height="30" /><span>{game.reward.label}</span></div>
          <div><Trophy size={26} /><span>Every cleared level also saves your progress and unlocks the next one.</span></div>
        </div>
        <button type="button" className={styles.mClose} onClick={() => setRewardsOpen(false)}>Got it</button>
      </Modal>
      <Modal open={short} onClose={() => setShort(false)} title="Not Enough Tokens">
        <p className={styles.shortText}>You need {game.cost} Tokens to play.</p>
        <div className={styles.shortBal}><img src={tokenIcon} alt="" width="26" height="26" /> Your Balance: <b>{tokens} Tokens</b></div>
        <button type="button" className={styles.shortCta} onClick={() => navigate("/redeem")}>Earn More Tokens</button>
        <button type="button" className={styles.shortGhost} onClick={() => setShort(false)}>Close</button>
      </Modal>
    </div>
  );
}
