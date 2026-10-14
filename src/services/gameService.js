import { games, ENTRY_COST } from "../data/gamesData";
import { calculateReward } from "./rewardRules";

const active = new Set(); // sessions that were paid for and not finished yet
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wantsError = () => new URLSearchParams(window.location.search).has("simulateError");

/** Mock of GET /games. Swap for a real fetch() later. */
export async function fetchGames() {
  await sleep(750);
  return games;
}

/** Mock of POST /games/:slug/sessions — a real backend would also charge the Tokens. */
export async function startSession(slug) {
  await sleep(350);
  if (wantsError()) throw new Error("Simulated start failure");
  const sessionId = `${slug}-${Date.now().toString(36)}`;
  active.add(sessionId);
  return { sessionId, slug, cost: ENTRY_COST };
}

/**
 * Mock of POST /games/sessions/:id/finish.
 * The UI must display the *backend-confirmed* reward returned here.
 */
export async function finishSession({ slug, sessionId, score }) {
  await sleep(250);
  active.delete(sessionId);
  return { sessionId, score, reward: calculateReward(slug, score), confirmed: true };
}

export const isSessionActive = (id) => active.has(id);
export const abandonSession = (id) => active.delete(id);
