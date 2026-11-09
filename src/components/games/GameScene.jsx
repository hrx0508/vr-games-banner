import styles from "./GameScene.module.css";

const BRICKS = ["#6f8dff", "#8b6cff", "#3fc7b0", "#f6b94d", "#ff8f78", "#5aa9ff", "#c07cff", "#59d68c", "#6f8dff", "#f6b94d"];
const FRUIT = ["🍉", "🍊", "🍓", "🥝", "🍍", "🍋", "🍎", "🍇"];

/**
 * Game-specific hero illustration for the Game Home.
 *  Block Crush → clean arcade "blueprint": grid, glossy floating blocks, a ball bouncing off a paddle
 *  Slice Storm → citrus "sunburst": rotating rays, fruit flying in arcs, a slash cutting through the poster
 * The supplied artwork stays the focal point (poster).
 */
export default function GameScene({ slug, game }) {
  const poster = <div className={styles.poster}><img src={game.image} alt={`${game.name} artwork`} width="640" height="781" /></div>;

  if (slug === "slice-storm") {
    return (
      <div className={`${styles.stage} ${styles.ss}`} aria-hidden={false}>
        <div className={styles.rays} aria-hidden="true" />
        <div className={styles.sun} aria-hidden="true" />
        {FRUIT.map((f, i) => <span key={i} className={styles.fruit} style={{ "--i": i }} aria-hidden="true">{f}</span>)}
        {poster}
        <i className={styles.slash} aria-hidden="true" /><i className={`${styles.slash} ${styles.slash2}`} aria-hidden="true" />
        {[0, 1, 2, 3, 4, 5].map((i) => <b key={i} className={styles.drop} style={{ "--i": i }} aria-hidden="true" />)}
      </div>
    );
  }
  return (
    <div className={`${styles.stage} ${styles.bc}`}>
      <div className={styles.grid} aria-hidden="true" />
      {BRICKS.map((c, i) => <span key={i} className={styles.brick} style={{ "--i": i, "--c": c }} aria-hidden="true" />)}
      {poster}
      <div className={styles.court} aria-hidden="true"><i className={styles.ball} /><i className={styles.paddle} /></div>
    </div>
  );
}
