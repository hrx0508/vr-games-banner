import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import AppHeader from "../components/games/AppHeader";
import GameCard from "../components/games/GameCard";
import CategoryTabs from "../components/games/CategoryTabs";
import GamesSkeleton from "../components/games/GamesSkeleton";
import ErrorState from "../components/games/ErrorState";
import { usePlayGame } from "../hooks/usePlayGame";
import { useGameCoins } from "../context/GameCoinContext";
import { categories, countIn } from "../data/gamesData";
import { fetchGames } from "../services/gameService";
import styles from "./AllGames.module.css";

export default function AllGames() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { tokens } = useGameCoins();
  const { onPlay, loadingId } = usePlayGame();
  const [games, setGames] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    setGames(null);

    fetchGames()
      .then(setGames)
      .catch(() => setFailed(true));

  };

  useEffect(() => {
    load();
  }, []);

  const requested = params.get("category");

  const active =
    requested && categories.includes(requested)
      ? requested
      : "All";

  const tabs = useMemo(
    () =>
      ["All", ...categories].map((name) => ({
        name,
        count: countIn(name),
      })),
    []
  );

  const select = (name) => {
    setParams(
      name === "All" ? {} : { category: name },
      { replace: true }
    );
  };

  const filteredGames = useMemo(() => {
    if (!games) return [];


    return active === "All"
      ? games
      : games.filter((game) => game.category === active);


  }, [games, active]);

  return (<div className={styles.page}> <div
    className={styles.glow}
    aria-hidden="true"
  />


    <AppHeader />

    <main className={styles.container}>
      <h1 className="sr-only">All Games</h1>

      <Link to="/games" className={styles.back}>
        <ArrowLeft size={18} />
        Back
      </Link>

      <CategoryTabs
        items={tabs}
        active={active}
        onSelect={select}
      />

      {failed ? (
        <ErrorState
          message="We couldn't load the games."
          onRetry={load}
          onBack={() => navigate("/games")}
        />
      ) : !games ? (
        <GamesSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <div className={styles.grid}>
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  className={styles.cell}
                  initial={{
                    opacity: 0,
                    y: 22,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: Math.min(index, 8) * 0.05,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <GameCard
                    fluid
                    game={game}
                    index={index}
                    tokens={tokens}
                    loading={loadingId === game.id}
                    onPlay={onPlay}
                    eager={index < 8}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  </div>

  );
}
