import { memo, useState } from "react";
import TokenCost from "./TokenCost";
import PlayNowButton from "./PlayNowButton";
import styles from "./GameCard.module.css";

/**
 * Compact banner: full-bleed artwork with a gradient info layer (category, name, Play Now)
 * and the entry-fee chip. Memoised so unrelated updates don't re-render all 13×3 cards.
 */
function GameCard({ game, index, tokens, loading, onPlay, eager, fluid = false }) {
  const [ready, setReady] = useState(false);
  const insufficient = tokens < game.cost;
  const state = loading ? "loading" : insufficient ? "insufficient" : "idle";

  return (
    <article className={`${styles.card} ${fluid ? styles.fluid : ""}`} aria-label={game.name}>
      <div className={`${styles.art} ${ready ? styles.ready : ""}`}>
        <img
          src={game.image} alt={`${game.name} — game artwork`} width="640" height="781"
          loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"}
          draggable="false" onLoad={() => setReady(true)}
          ref={(el) => { if (el?.complete && el.naturalWidth) setReady(true); }}
        />
      </div>

      <div className={styles.tok}><TokenCost cost={game.cost} balance={tokens} insufficient={insufficient} /></div>

      <div className={styles.info}>
        <span className={styles.cat}>
          {game.playable && <i className={styles.dot} title="Playable now" aria-label="Playable now" />}
          {game.category}
        </span>
        <h3 className={styles.name}>{game.name}</h3>
        <PlayNowButton
          size="sm" state={state} delay={(index % 6) * 0.45} onClick={() => onPlay(game)}
          ariaLabel={insufficient ? `Earn more Tokens — ${game.name} needs ${game.cost} Tokens` : `Play ${game.name} for ${game.cost} Tokens`}
        />
      </div>
    </article>
  );
}

export default memo(GameCard);
