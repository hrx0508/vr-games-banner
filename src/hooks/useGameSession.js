import { useCallback, useEffect, useRef, useState } from "react";
import { finishSession } from "../services/gameService";
import { useGameCoins } from "../context/GameCoinContext";

/**
 * Orchestrates one paid run:  guide → playing → (revive?) → result.
 * Rewards come from finishSession() (backend-confirmed in production) and are credited
 * to the CENTRAL balance exactly once — when the coins land on the balance chip.
 */
export function useGameSession({ game, sessionId }) {
  const { seenGuides, markGuideSeen, earnCoins, recordScore, best } = useGameCoins();
  const [phase, setPhase] = useState(seenGuides[game.slug] ? "playing" : "guide");
  const [stats, setStats] = useState({ score: 0, lives: 3, level: 1 });
  const [reviveKey, setReviveKey] = useState(0);
  const [revivesLeft, setRevivesLeft] = useState(1);
  const [result, setResult] = useState(null); // { score, reward|null, isBest }
  const [landed, setLanded] = useState(false);
  const final = useRef(null);
  const pending = useRef(0);
  const credited = useRef(false);
  const bestBefore = useRef(best[game.slug] || 0);

  const credit = useCallback(() => {
    if (credited.current || !pending.current) return;
    credited.current = true;
    earnCoins(pending.current);
  }, [earnCoins]);

  useEffect(() => () => credit(), [credit]); // leaving mid-animation never loses coins

  const finish = useCallback(async (res) => {
    setPhase("result");
    setResult({ score: res.score, reward: null, isBest: res.score > bestBefore.current });
    recordScore(game.slug, res.score);
    try {
      const r = await finishSession({ slug: game.slug, sessionId, score: res.score });
      pending.current = r.reward;
      setResult((p) => ({ ...p, reward: r.reward }));
      if (r.reward === 0) { credited.current = true; setLanded(true); }
    } catch {
      setResult((p) => ({ ...p, reward: 0 })); setLanded(true);
    }
  }, [game.slug, recordScore, sessionId]);

  const onGameOver = useCallback((res) => {
    final.current = res;
    if (revivesLeft > 0) setPhase("revive"); else finish(res);
  }, [finish, revivesLeft]);

  return {
    phase, stats, result, landed, reviveKey, revivesLeft,
    running: phase === "playing",
    onStats: setStats,
    onGameOver,
    closeGuide: () => { markGuideSeen(game.slug); setPhase("playing"); },
    revive: () => { setRevivesLeft(0); setReviveKey((k) => k + 1); setPhase("playing"); },
    decline: () => finish(final.current || { score: stats.score }),
    onLanded: () => { credit(); setLanded(true); },
  };
}
