import { getGame } from "../data/gamesData";

/**
 * Client-side reward calculation (prototype only).
 * coins = score / perPoints  +  perLevel x levels cleared this run, capped.
 * PRODUCTION: never trust this. The backend must validate the game session, the score,
 * the levels and completion, then calculate and apply the reward itself.
 */
export function calculateReward(slug, score, levelsCleared = 0) {
  const rule = getGame(slug)?.reward;
  if (!rule || (score <= 0 && levelsCleared <= 0)) return 0;
  const raw = Math.floor(score / rule.perPoints) + (rule.perLevel || 0) * levelsCleared;
  return Math.max(rule.min, Math.min(rule.cap, raw));
}
