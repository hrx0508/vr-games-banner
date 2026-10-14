import styles from "./CarouselDots.module.css";

export default function CarouselDots({ count, active, onSelect, names = [] }) {
  return (
    <div className={styles.dots} role="group" aria-label="Choose a game in the carousel">
      {Array.from({ length: count }, (_, i) => (
        <button key={i} type="button" className={`${styles.dot} ${i === active ? styles.on : ""}`} aria-label={`Go to game ${i + 1}${names[i] ? `: ${names[i]}` : ""}`} aria-current={i === active ? "true" : undefined} onClick={() => onSelect(i)} />
      ))}
    </div>
  );
}
