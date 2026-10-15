import { useMemo } from "react";
import { Pause, Play } from "lucide-react";
import GameCard from "./GameCard";
import CarouselDots from "./CarouselDots";
import { useCarousel } from "../../hooks/useCarousel";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import styles from "./GamesCarousel.module.css";

const SETS = [0, 1, 2]; // 3 copies → seamless loop (copies 1 and 3 are inert + hidden from assistive tech)

/** One auto-scrolling strip of cards. */
function Track({ games, row, trackRef, handlers, className, tokens, loadingId, onPlay, label }) {
  return (
    <div ref={trackRef} className={className} {...handlers} role="group" aria-label={label}>
      {SETS.flatMap((set) =>
        games.map((g, i) => (
          <div key={`${row}-${set}-${g.id}`} className={styles.slot} {...(set !== 1 ? { "data-dup": "", "aria-hidden": "true" } : {})} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${games.length}`}>
            <GameCard game={g} index={i} tokens={tokens} loading={loadingId === g.id} onPlay={onPlay} eager={set < 2 && i < 8} />
          </div>
        ))
      )}
    </div>
  );
}

export default function GamesCarousel({ games, tokens, loadingId, onPlay }) {
  const count = games.length;
  const isMobile = useMediaQuery("(max-width: 767px)"); // phones: two counter-moving rows · tablet/desktop: one row

  // row 1 — moves right → left (default, same as before)
  const r1 = useCarousel({ count, speed: 30, direction: "rtl" });
  // row 2 — phones only — moves left → right; follows row 1's pause button
  const r2 = useCarousel({ count, speed: 30, direction: "ltr", enabled: isMobile, paused: r1.userPaused });
  // same 13 games, started from a different card so the two rows never line up
  const row2Games = useMemo(() => [...games.slice(6), ...games.slice(0, 6)], [games]);
  const names = useMemo(() => games.map((g) => g.name), [games]);

  return (
    <section className={styles.wrap} aria-roledescription="carousel" aria-label="Games">
      <div className={styles.viewport}>
        <Track games={games} row={1} trackRef={r1.trackRef} handlers={r1.handlers} className={`${styles.track} ${isMobile ? styles.top : ""}`}
          tokens={tokens} loadingId={loadingId} onPlay={onPlay} label={isMobile ? "Games, row 1" : "Games"} />
        {isMobile && (
          <Track games={row2Games} row={2} trackRef={r2.trackRef} handlers={r2.handlers} className={`${styles.track} ${styles.bottom}`}
            tokens={tokens} loadingId={loadingId} onPlay={onPlay} label="Games, row 2" />
        )}
        <span className={`${styles.fade} ${styles.left}`} aria-hidden="true" />
        <span className={`${styles.fade} ${styles.right}`} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <CarouselDots count={count} active={r1.active} onSelect={r1.goTo} names={names} />
        {!r1.reduced && (
          <button type="button" className={styles.pauseBtn} onClick={() => r1.setUserPaused((p) => !p)} aria-pressed={r1.userPaused} aria-label={r1.userPaused ? "Resume auto-scroll" : "Pause auto-scroll"}>
            {r1.userPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
          </button>
        )}
      </div>
    </section>
  );
}
