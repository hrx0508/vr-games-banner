import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/Toast";
import { useGameCoins } from "../context/GameCoinContext";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Play Now behaviour shared by the carousel and the All Games page. */
export function usePlayGame() {
  const { tokens } = useGameCoins();
  const navigate = useNavigate();
  const toast = useToast();
  const [loadingId, setLoadingId] = useState(null);

  const onPlay = useCallback(async (game) => {
    if (loadingId) return;
    if (tokens < game.cost) { toast(`You need ${game.cost} Tokens to play. Redeem Game Coins for Tokens.`, "error"); navigate("/redeem"); return; }
    if (!game.playable) { toast(`${game.name} is coming soon — try Block Crush or Slice Storm!`); return; }
    setLoadingId(game.id);
    await sleep(500);
    navigate(`/games/${game.slug}`);
  }, [loadingId, tokens, navigate, toast]);

  return { onPlay, loadingId };
}
