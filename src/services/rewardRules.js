import { getGame } from "../data/gamesData";

/**
 * Client-side reward calculation (prototype only).
 * PRODUCTION: never trust this. The backend must validate the game session,
 * the score and completion, then calculate and apply the reward itself.
 */
export function calculateReward(slug, score) {
  const rule = getGame(slug)?.reward;
  if (!rule || score <= 0) return 0;
  return Math.max(rule.min, Math.min(rule.cap, Math.floor(score / rule.perPoints)));
}
