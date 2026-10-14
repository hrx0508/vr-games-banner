import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Modal.module.css";

export default function Modal({ open, onClose, title, children, tone = "light", dismissible = true, labelledBy = "modal-title" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const t = setTimeout(() => ref.current?.querySelector("button, [href], input")?.focus(), 60);
    const onKey = (e) => { if (e.key === "Escape" && dismissible) onClose?.(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [open, dismissible, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && dismissible && onClose?.()}>
          <motion.div
            ref={ref}
            role="dialog" aria-modal="true" aria-labelledby={labelledBy}
            className={`${styles.panel} ${tone === "dark" ? styles.dark : ""}`}
            initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {title && <h2 id={labelledBy} className={styles.title}>{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
