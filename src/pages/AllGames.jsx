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

  const load = () => { setFailed(false); setGames(null); fetchGames().then(setGames).catch(() => setFailed(true)); };
  useEffect(load, []);

  const requested = params.get("category");
  const active = requested && categories.includes(requested) ? requested : "All";
  const tabs = useMemo(() => ["All", ...categories].map((name) => ({ name, count: countIn(name) })), []);
  const select = (name) => setParams(name === "All" ? {} : { category: name }, { replace: true });

  // All → grouped by category; a category → just that group
  const groups = useMemo(() => {
    if (!games) return [];
    return (active === "All" ? categories : [active])
      .map((c) => ({ name: c, items: games.filter((g) => g.category === c) }))
      .filter((g) => g.items.length);
  }, [games, active]);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <AppHeader />
      <main className={styles.container}>
        <h1 className="sr-only">All Games</h1>
        <Link to="/games" className={styles.back}><ArrowLeft size={18} /> Back</Link>

        <CategoryTabs items={tabs} active={active} onSelect={select} />

        {failed ? <ErrorState message="We couldn't load the games." onRetry={load} onBack={() => navigate("/games")} /> : !games ? <GamesSkeleton /> : (
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
              {groups.map((grp) => (
                <section key={grp.name} className={styles.group} aria-labelledby={`cat-${grp.name}`}>
                  <h2 id={`cat-${grp.name}`} className={styles.groupHead}>{grp.name}<span>{grp.items.length} {grp.items.length === 1 ? "game" : "games"}</span></h2>
                  <div className={styles.grid}>
                    {grp.items.map((g, i) => (
                      <motion.div key={g.id} className={styles.cell} initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                        <GameCard fluid game={g} index={i} tokens={tokens} loading={loadingId === g.id} onPlay={onPlay} eager={i < 8} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
