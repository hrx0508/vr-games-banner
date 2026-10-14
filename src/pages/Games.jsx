import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AppHeader from "../components/games/AppHeader";
import GamesCarousel from "../components/games/GamesCarousel";
import GamesSkeleton from "../components/games/GamesSkeleton";
import ErrorState from "../components/games/ErrorState";
import { usePlayGame } from "../hooks/usePlayGame";
import { useGameCoins } from "../context/GameCoinContext";
import { fetchGames } from "../services/gameService";
import styles from "./Games.module.css";

export default function Games() {
  const [games, setGames] = useState(null);
  const [failed, setFailed] = useState(false);
  const { tokens } = useGameCoins();
  const { onPlay, loadingId } = usePlayGame();

  const load = useCallback(() => { setFailed(false); setGames(null); fetchGames().then(setGames).catch(() => setFailed(true)); }, []);
  useEffect(load, [load]);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <AppHeader />
      <main className={styles.container}>
        <h1 className="sr-only">Games</h1>
        <Link to="/all-games" className={styles.browse}>Browse All Games <ArrowRight size={18} /></Link>
        {failed ? <ErrorState message="We couldn't load the games." onRetry={load} onBack={load} /> : !games ? <GamesSkeleton /> : (
          <GamesCarousel games={games} tokens={tokens} loadingId={loadingId} onPlay={onPlay} />
        )}
      </main>
    </div>
  );
}
