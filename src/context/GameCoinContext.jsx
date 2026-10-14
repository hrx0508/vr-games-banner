import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { getRedeemOption } from "../data/redeemData";

const KEY = "veloop-games-state-v1";
const day = 86400000;

const seed = () => ({
  tokens: 150,
  gameCoins: 20,
  wallet: { ve: 0, sve: 0, gems: 0, spins: 0 },
  history: [
    { id: "h2", optionId: "gems", coins: 50, amount: 5, at: Date.now() - day },
    { id: "h1", optionId: "ve", coins: 100, amount: 10, at: Date.now() - 3 * day },
  ],
  seenGuides: {},
  best: {},
  lastGame: null,
});

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return raw ? { ...seed(), ...raw, wallet: { ...seed().wallet, ...raw.wallet } } : seed();
  } catch {
    return seed();
  }
}

function reducer(s, a) {
  switch (a.type) {
    case "SPEND_TOKENS": return { ...s, tokens: s.tokens - a.n };
    case "EARN_COINS": return { ...s, gameCoins: s.gameCoins + a.n };
    case "SET_TOKENS": return { ...s, tokens: a.n };
    case "GUIDE_SEEN": return { ...s, seenGuides: { ...s.seenGuides, [a.slug]: true } };
    case "BEST": return a.score > (s.best[a.slug] || 0) ? { ...s, best: { ...s.best, [a.slug]: a.score } } : s;
    case "LAST_GAME": return s.lastGame === a.slug ? s : { ...s, lastGame: a.slug };
    case "REDEEM": {
      const o = a.option;
      const entry = { id: `h${Date.now()}`, optionId: o.id, coins: o.cost, amount: o.amount, at: Date.now() };
      const next = { ...s, gameCoins: s.gameCoins - o.cost, history: [entry, ...s.history].slice(0, 20) };
      if (o.id === "tokens") next.tokens = s.tokens + o.amount;
      else next.wallet = { ...s.wallet, [o.walletKey]: s.wallet[o.walletKey] + o.amount };
      return next;
    }
    case "RESET": return seed();
    default: return s;
  }
}

const Ctx = createContext(null);

/** The ONE centralised balance used by every game, the home pages and Redeem. */
export function GameCoinProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }, [state]);

  const spendTokens = useCallback((n) => {
    if (ref.current.tokens < n) return false;
    dispatch({ type: "SPEND_TOKENS", n });
    return true;
  }, []);

  const redeem = useCallback((optionId) => {
    const option = getRedeemOption(optionId);
    if (!option || ref.current.gameCoins < option.cost) return { ok: false, option };
    dispatch({ type: "REDEEM", option });
    return { ok: true, option };
  }, []);

  const api = useMemo(() => ({
    ...state,
    spendTokens,
    redeem,
    earnCoins: (n) => dispatch({ type: "EARN_COINS", n }),
    setTokens: (n) => dispatch({ type: "SET_TOKENS", n }),
    markGuideSeen: (slug) => dispatch({ type: "GUIDE_SEEN", slug }),
    recordScore: (slug, score) => dispatch({ type: "BEST", slug, score }),
    setLastGame: (slug) => dispatch({ type: "LAST_GAME", slug }),
    resetDemo: () => dispatch({ type: "RESET" }),
  }), [state, spendTokens, redeem]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useGameCoins = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGameCoins must be used inside GameCoinProvider");
  return v;
};
