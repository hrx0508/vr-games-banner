import { useMemo } from "react";
import { Pause, Play } from "lucide-react";
import GameCard from "./GameCard";
import CarouselDots from "./CarouselDots";
import { useCarousel } from "../../hooks/useCarousel";
import styles from "./GamesCarousel.module.css";

export default function GamesCarousel({ games, tokens, loadingId, onPlay }) {
  const count = games.length;
  const { trackRef, active, goTo, handlers, userPaused, setUserPaused, reduced } = useCarousel({ count, speed: 30 });
  const names = useMemo(() => games.map((g) => g.name), [games]);
  const sets = [0, 1, 2]; // 3 copies → seamless loop (copies 1 and 3 are inert + hidden from assistive tech)

  return (
    <section className={styles.wrap} aria-roledescription="carousel" aria-label="Games">
      <div className={styles.viewport}>
        <div ref={trackRef} className={styles.track} {...handlers}>
          {sets.flatMap((set) =>
            games.map((g, i) => (
              <div key={`${set}-${g.id}`} className={styles.slot} {...(set !== 1 ? { "data-dup": "", "aria-hidden": "true" } : {})} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
                <GameCard game={g} index={i} tokens={tokens} loading={loadingId === g.id} onPlay={onPlay} eager={set < 2 && i < 8} />
              </div>
            ))
          )}
        </div>
        <span className={`${styles.fade} ${styles.left}`} aria-hidden="true" />
        <span className={`${styles.fade} ${styles.right}`} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <CarouselDots count={count} active={active} onSelect={goTo} names={names} />
        {!reduced && (
          <button type="button" className={styles.pauseBtn} onClick={() => setUserPaused((p) => !p)} aria-pressed={userPaused} aria-label={userPaused ? "Resume auto-scroll" : "Pause auto-scroll"}>
            {userPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
          </button>
        )}
      </div>
    </section>
  );
}
