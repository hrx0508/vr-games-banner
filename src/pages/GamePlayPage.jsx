import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import GameHeader from "../components/games/GameHeader";
import GameGuide from "../components/games/GameGuide";
import ReviveModal from "../components/games/ReviveModal";
import GameOver from "../components/games/GameOver";
import ErrorState from "../components/games/ErrorState";
import Modal from "../components/ui/Modal";
import { getGame } from "../data/gamesData";
import { themes } from "../data/themes";
import { engines } from "../games/registry";
import { abandonSession, isSessionActive } from "../services/gameService";
import { useGameSession } from "../hooks/useGameSession";
import { useBodyBg } from "../hooks/useBodyBg";
import styles from "./GamePlayPage.module.css";

export default function GamePlayPage() {
  const { slug } = useParams();
  const game = getGame(slug);
  const sessionId = useLocation().state?.sessionId;
  useBodyBg(themes[slug]?.["--g-bg-1"] || "#f4f7ff");

  if (!game?.playable || !engines[game.engine]) return <Navigate to="/games" replace />;
  // no paid session (e.g. page refreshed / URL typed) → back to the Game Home, never a free play
  if (!sessionId || !isSessionActive(sessionId)) return <Navigate to={`/games/${slug}`} replace />;
  return <Run game={game} sessionId={sessionId} />;
}

function Run({ game, sessionId }) {
  const navigate = useNavigate();
  const [quit, setQuit] = useState(false);
  const s = useGameSession({ game, sessionId });
  const { Component, size } = engines[game.engine];
  const home = () => navigate(`/games/${game.slug}`, { replace: true });

  if (!Component) return <ErrorState onBack={() => navigate("/games")} />;

  return (
    <div className={styles.page} style={themes[game.slug]}>
      <GameHeader onBack={() => (s.phase === "result" ? home() : setQuit(true))} backLabel="Leave game" title={game.name} />
      <main className={styles.main}>
        <div className={styles.hud} aria-live="off">
          <div><span>Score</span><b>{s.stats.score}</b></div>
          <div className={styles.lives} aria-label={`${s.stats.lives} lives left`}>
            {[0, 1, 2].map((i) => <Heart key={i} size={22} fill={i < s.stats.lives ? "#ff5d73" : "none"} color={i < s.stats.lives ? "#ff5d73" : "#c4c9e6"} />)}
          </div>
          <div><span>Level</span><b>{s.stats.level}</b></div>
        </div>
        <div className={styles.board} style={{ "--ratio": size.w / size.h }}>
          <Component running={s.running} reviveKey={s.reviveKey} onStats={s.onStats} onGameOver={s.onGameOver} />
        </div>
      </main>

      <GameGuide game={game} open={s.phase === "guide"} onClose={s.closeGuide} cta="Got it — Start!" />
      <ReviveModal open={s.phase === "revive"} score={s.stats.score} onRevive={s.revive} onDecline={s.decline} />
      {s.phase === "result" && s.result && (
        <GameOver game={game} score={s.result.score} reward={s.result.reward} isBest={s.result.isBest} landed={s.landed} onLanded={s.onLanded} onContinue={home} />
      )}
      <Modal open={quit} onClose={() => setQuit(false)} title="Leave this game?">
        <p className={styles.quitText}>Your 20 Tokens are already spent and this run's reward will be lost.</p>
        <button type="button" className={styles.stay} onClick={() => setQuit(false)}>Keep Playing</button>
        <button type="button" className={styles.leave} onClick={() => { abandonSession(sessionId); home(); }}>Leave Game</button>
      </Modal>
    </div>
  );
}
