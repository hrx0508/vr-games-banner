import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Clock, Heart } from "lucide-react";
import GameHeader from "../components/games/GameHeader";
import GameGuide from "../components/games/GameGuide";
import ReviveModal from "../components/games/ReviveModal";
import LevelComplete from "../components/games/LevelComplete";
import GameOver from "../components/games/GameOver";
import ErrorState from "../components/games/ErrorState";
import Modal from "../components/ui/Modal";
import { getGame } from "../data/gamesData";
import { getLevel } from "../data/levelsData";
import { themes } from "../data/themes";
import { engines } from "../games/registry";
import { abandonSession, isSessionActive } from "../services/gameService";
import { useGameSession } from "../hooks/useGameSession";
import { useGameCoins } from "../context/GameCoinContext";
import { useBodyBg } from "../hooks/useBodyBg";
import styles from "./GamePlayPage.module.css";

export default function GamePlayPage() {
  const { slug } = useParams();
  const game = getGame(slug);
  const state = useLocation().state;
  const { progress } = useGameCoins();
  useBodyBg(themes[slug]?.["--g-bg-1"] || "#f4f7ff");

  // Decided ONCE when the page opens. (Re-checking on every render would bounce the player home the moment
  // the run finishes and the Game Coin balance updates.)
  const [entry] = useState(() => {
    const unlocked = progress[slug]?.unlocked || 1;
    return { valid: !!state?.sessionId && isSessionActive(state.sessionId), startLevel: Math.min(Math.max(1, state?.level || unlocked), unlocked) };
  });

  if (!game?.playable || !engines[game.engine]) return <Navigate to="/games" replace />;
  // no paid session (e.g. page refreshed / URL typed) → back to the Game Home, never a free play
  if (!entry.valid) return <Navigate to={`/games/${slug}`} replace />;
  return <Run game={game} sessionId={state.sessionId} startLevel={entry.startLevel} />;
}

function Run({ game, sessionId, startLevel }) {
  const navigate = useNavigate();
  const [quit, setQuit] = useState(false);
  const s = useGameSession({ game, sessionId, startLevel });
  const { Component, size } = engines[game.engine];
  const home = () => navigate(`/games/${game.slug}`, { replace: true });
  if (!Component) return <ErrorState onBack={() => navigate("/games")} />;

  const cfg = getLevel(game.slug, s.stats.level || s.level);
  const g = s.stats.goal;
  const pct = g ? Math.min(100, Math.round((g.done / g.total) * 100)) : 0;
  const maxLives = s.stats.maxLives || 3;

  return (
    <div className={styles.page} style={themes[game.slug]}>
      <GameHeader onBack={() => (s.phase === "result" ? home() : setQuit(true))} backLabel="Leave game" title={game.name} />
      <main className={styles.main}>
        <div className={styles.hud} aria-live="off">
          <div><span>Score</span><b>{s.stats.score}</b></div>
          <div className={styles.mid}>
            <div className={styles.lives} aria-label={`${s.stats.lives} of ${maxLives} lives left`}>
              {Array.from({ length: maxLives }, (_, i) => <Heart key={i} size={20} fill={i < s.stats.lives ? "#ff5d73" : "none"} color={i < s.stats.lives ? "#ff5d73" : "#c4c9e6"} />)}
            </div>
            {s.stats.time != null && <span className={`${styles.time} ${s.stats.time <= 10 ? styles.hot : ""}`}><Clock size={13} /> {s.stats.time}s</span>}
          </div>
          <div className={styles.lvl}><span>Level</span><b>{s.stats.level} <small>/ {s.total}</small></b></div>
        </div>

        <div className={styles.goal}>
          <div className={styles.goalTop}>
            <span>{cfg?.name}</span>
            <b>{g ? `${g.label} ${g.done}/${g.total}` : ""}</b>
          </div>
          <div className={styles.bar}><i style={{ width: `${pct}%` }} /></div>
        </div>

        <div className={styles.board} style={{ "--ratio": size.w / size.h }}>
          <Component level={s.level} levelKey={s.levelKey} running={s.running} reviveKey={s.reviveKey} onStats={s.onStats} onLevelComplete={s.onLevelComplete} onGameOver={s.onGameOver} />
        </div>
      </main>

      <GameGuide game={game} open={s.phase === "guide"} onClose={s.closeGuide} cta="Got it — Start!" />
      <ReviveModal open={s.phase === "revive"} score={s.stats.score} onRevive={s.revive} onDecline={s.decline} />
      <LevelComplete open={s.phase === "levelup"} result={s.levelResult} game={game} onNext={s.nextLevel} onCollect={s.collect} />
      {s.phase === "result" && s.result && (
        <GameOver game={game} score={s.result.score} reward={s.result.reward} isBest={s.result.isBest} levelsCleared={s.result.levelsCleared} landed={s.landed} onLanded={s.onLanded} onContinue={home} />
      )}
      <Modal open={quit} onClose={() => setQuit(false)} title="Leave this game?">
        <p className={styles.quitText}>Your 20 Tokens are already spent and this run's Game Coins will be lost. Cleared levels stay saved.</p>
        <button type="button" className={styles.stay} onClick={() => setQuit(false)}>Keep Playing</button>
        <button type="button" className={styles.leave} onClick={() => { abandonSession(sessionId); home(); }}>Leave Game</button>
      </Modal>
    </div>
  );
}
