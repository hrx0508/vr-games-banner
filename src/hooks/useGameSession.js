import { useCallback, useEffect, useRef, useState } from "react";
import { finishSession } from "../services/gameService";
import { useGameCoins } from "../context/GameCoinContext";
import { getLevels } from "../data/levelsData";

/**
 * Orchestrates one paid run:  guide → playing → (levelup ↔ playing)* → (revive?) → result.
 *  - a cleared level is SAVED immediately (context + localStorage) and the next one unlocks,
 *    so leaving at any moment never loses progress
 *  - the reward is calculated from score + levels cleared and credited to the CENTRAL balance once
 */
export function useGameSession({ game, sessionId, startLevel }) {
  const { seenGuides, markGuideSeen, earnCoins, recordScore, best, completeLevel } = useGameCoins();
  const total = getLevels(game.slug).length;
  const [phase, setPhase] = useState(seenGuides[game.slug] ? "playing" : "guide");
  const [level, setLevel] = useState(startLevel);
  const [levelKey, setLevelKey] = useState(0);
  const [stats, setStats] = useState({ score: 0, lives: 3, maxLives: 3, level: startLevel, goal: null, time: null });
  const [levelResult, setLevelResult] = useState(null);
  const [reviveKey, setReviveKey] = useState(0);
  const [revivesLeft, setRevivesLeft] = useState(1);
  const [result, setResult] = useState(null); // { score, reward|null, isBest, levelsCleared }
  const [landed, setLanded] = useState(false);
  const final = useRef(null);
  const pending = useRef(0);
  const credited = useRef(false);
  const cleared = useRef(0);
  const bestBefore = useRef(best[game.slug] || 0);

  const credit = useCallback(() => {
    if (credited.current || !pending.current) return;
    credited.current = true;
    earnCoins(pending.current);
  }, [earnCoins]);
  useEffect(() => () => credit(), [credit]); // leaving mid-animation never loses coins

  const finish = useCallback(async (res) => {
    setPhase("result");
    setResult({ score: res.score, reward: null, isBest: res.score > bestBefore.current, levelsCleared: cleared.current });
    recordScore(game.slug, res.score);
    try {
      const r = await finishSession({ slug: game.slug, sessionId, score: res.score, levelsCleared: cleared.current });
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

  const onLevelComplete = useCallback((res) => {
    cleared.current += 1;
    final.current = { score: res.score };
    completeLevel(game.slug, res.level, res.stars, total); // ← saved right now
    setLevelResult({ ...res, isLast: res.level >= total });
    setPhase("levelup");
  }, [completeLevel, game.slug, total]);

  const nextLevel = useCallback(() => {
    setLevel((l) => l + 1); setLevelKey((k) => k + 1); setPhase("playing");
  }, []);

  return {
    phase, stats, level, levelKey, levelResult, result, landed, reviveKey, revivesLeft, total,
    running: phase === "playing",
    onStats: setStats,
    onGameOver, onLevelComplete, nextLevel,
    closeGuide: () => { markGuideSeen(game.slug); setPhase("playing"); },
    revive: () => { setRevivesLeft(0); setReviveKey((k) => k + 1); setPhase("playing"); },
    decline: () => finish(final.current || { score: stats.score }),
    collect: () => finish(final.current || { score: stats.score }),
    onLanded: () => { credit(); setLanded(true); },
  };
}
