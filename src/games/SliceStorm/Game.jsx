import { useEffect, useRef } from "react";
import styles from "./Game.module.css";

/**
 * Slice Storm — original swipe-to-slice game (emoji fruit drawn on canvas).
 * Same engine contract as Block Crush:
 *   props: running, reviveKey, onStats({score,lives,level}), onGameOver({score,level})
 */
export const SIZE = { w: 360, h: 500 };
const { w: LW, h: LH } = SIZE;
const G = 560;
const FRUITS = [
  { e: "🍉", c: "#ff5d73" }, { e: "🍊", c: "#ff9f1c" }, { e: "🍎", c: "#e63946" }, { e: "🥝", c: "#7bc043" },
  { e: "🍍", c: "#f4c430" }, { e: "🍋", c: "#f7e04a" }, { e: "🍓", c: "#ff4d6d" }, { e: "🍑", c: "#ffa07a" }, { e: "🍇", c: "#8e5bd6" },
];
const FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function fresh() {
  return { items: [], halves: [], parts: [], popups: [], trail: [], score: 0, lives: 3, level: 1, over: false, overSent: false, overTimer: 0, spawnT: 0.6, grace: 0.4, flash: 0, banner: null, swipe: 0, swiping: false };
}

export default function Game({ running, reviveKey, onStats, onGameOver }) {
  const canvasRef = useRef(null);
  const st = useRef(fresh());
  const live = useRef({ running, onStats, onGameOver });
  live.current = { running, onStats, onGameOver };
  const lastStats = useRef("");

  const emit = () => {
    const s = st.current, key = `${s.score}|${s.lives}|${s.level}`;
    if (key !== lastStats.current) { lastStats.current = key; live.current.onStats?.({ score: s.score, lives: s.lives, level: s.level }); }
  };

  useEffect(() => {
    if (!reviveKey) return;
    const s = st.current;
    s.over = false; s.overSent = false; s.lives = 1; s.items = []; s.spawnT = 1.1; s.grace = 1; s.banner = { text: "Revived!", t: 1.2 };
    emit();
  }, [reviveKey]); // eslint-disable-line

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = LW * dpr; canvas.height = LH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (import.meta.env.DEV) window.__game = st;
    emit();

    const pt = (e) => { const r = canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * LW, y: ((e.clientY - r.top) / r.height) * LH }; };
    const popup = (x, y, text, color = "#26306b", size = 16) => st.current.popups.push({ x, y, text, color, size, t: 0.9 });
    const splash = (x, y, c, n = 10) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = 60 + Math.random() * 160; st.current.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0.45 + Math.random() * 0.4, c, s: 2 + Math.random() * 4 }); } };

    const loseLife = (why) => {
      const s = st.current;
      if (s.over) return;
      s.lives -= 1; s.flash = why === "bomb" ? 0.35 : 0;
      if (s.lives <= 0) { s.over = true; s.overTimer = 0.9; } emit();
    };

    const slice = (it, angle) => {
      const s = st.current;
      it.sliced = true;
      if (it.bomb) {
        splash(it.x, it.y, "#555", 18); popup(it.x, it.y - 10, "Boom! −1 ♥", "#e0556a", 18);
        s.swipe = 0; loseLife("bomb"); return;
      }
      s.swipe += 1;
      s.score += 10; emit(); splash(it.x, it.y, it.c, 12); popup(it.x, it.y - 10, "+10", it.c);
      s.halves.push({ ...it, side: -1, a: angle, vx: it.vx - 70, vy: it.vy - 40, vr: -3 }, { ...it, side: 1, a: angle, vx: it.vx + 70, vy: it.vy - 40, vr: 3 });
    };

    // swipe handling
    const cut = (a, b) => {
      const s = st.current, dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy || 1;
      for (const it of s.items) {
        if (it.sliced) continue;
        const t = Math.max(0, Math.min(1, ((it.x - a.x) * dx + (it.y - a.y) * dy) / len2));
        const cx = a.x + t * dx, cy = a.y + t * dy;
        if ((it.x - cx) ** 2 + (it.y - cy) ** 2 <= (it.r + 4) ** 2) slice(it, Math.atan2(dy, dx));
      }
    };
    let prev = null;
    const down = (e) => { e.preventDefault(); canvas.setPointerCapture?.(e.pointerId); prev = pt(e); const s = st.current; s.swiping = true; s.swipe = 0; s.trail = [{ ...prev, t: 0.25 }]; };
    const move = (e) => {
      if (!st.current.swiping || !live.current.running || st.current.over) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) { const p = pt(ev); if (prev) cut(prev, p); st.current.trail.push({ ...p, t: 0.25 }); prev = p; }
    };
    const up = () => {
      const s = st.current;
      if (s.swipe >= 3) { const bonus = s.swipe * 5; s.score += bonus; emit(); popup(LW / 2, LH / 2, `Combo ×${s.swipe}  +${bonus}`, "#d9730d", 22); }
      s.swiping = false; s.swipe = 0; prev = null;
    };
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("pointerleave", up);

    const spawn = () => {
      const s = st.current;
      const n = 1 + (Math.random() < Math.min(0.75, 0.25 + s.level * 0.08) ? 1 : 0) + (Math.random() < Math.min(0.4, s.level * 0.05) ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const bomb = Math.random() < Math.min(0.22, 0.08 + s.level * 0.02), f = FRUITS[(Math.random() * FRUITS.length) | 0];
        const x = 50 + Math.random() * (LW - 100), peak = LH * (0.5 + Math.random() * 0.3);
        s.items.push({ x, y: LH + 30, vx: (LW / 2 - x) * (0.25 + Math.random() * 0.4) + (Math.random() - 0.5) * 40, vy: -Math.sqrt(2 * G * peak), r: 28, a: Math.random() * 6, vr: (Math.random() - 0.5) * 6, e: bomb ? "💣" : f.e, c: bomb ? "#444" : f.c, bomb, sliced: false });
      }
    };

    const draw = () => {
      const s = st.current;
      const g = ctx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, "#fff6ea"); g.addColorStop(1, "#ffe3cf");
      ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
      ctx.fillStyle = "rgba(255,138,61,.07)";
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(60 + i * 70, 120 + (i % 2) * 190, 54 - i * 4, 0, 6.283); ctx.fill(); }
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#000"; // emoji glyphs inherit fillStyle alpha
      for (const it of s.items) { if (it.sliced) continue; ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.a); ctx.font = `${it.r * 1.9}px ${FONT}`; ctx.fillText(it.e, 0, 2); ctx.restore(); }
      for (const h of s.halves) {
        ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.a + (h.rot || 0)); ctx.beginPath(); ctx.rect(h.side < 0 ? -h.r * 1.2 : 0, -h.r * 1.2, h.r * 1.2, h.r * 2.4); ctx.clip();
        ctx.font = `${h.r * 1.9}px ${FONT}`; ctx.fillText(h.e, 0, 2); ctx.restore();
      }
      for (const q of s.parts) { ctx.globalAlpha = Math.max(0, q.t * 2); ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.s, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
      // blade trail
      if (s.trail.length > 1) {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        for (let i = 1; i < s.trail.length; i++) {
          const a = s.trail[i - 1], b = s.trail[i]; ctx.globalAlpha = Math.max(0, b.t * 4);
          ctx.strokeStyle = "#ff7a2f"; ctx.shadowColor = "rgba(255,122,47,.7)"; ctx.shadowBlur = 10; ctx.lineWidth = 2 + (i / s.trail.length) * 6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      ctx.textBaseline = "alphabetic";
      for (const q of s.popups) { ctx.globalAlpha = Math.min(1, q.t * 2); ctx.fillStyle = q.color; ctx.font = `800 ${q.size}px Poppins, sans-serif`; ctx.fillText(q.text, q.x, q.y - (0.9 - q.t) * 36); }
      ctx.globalAlpha = 1;
      if (s.banner) { ctx.globalAlpha = Math.min(1, s.banner.t); ctx.font = "800 30px Poppins, sans-serif"; ctx.fillStyle = "#8a3d00"; ctx.fillText(s.banner.text, LW / 2, LH / 2); ctx.globalAlpha = 1; }
      if (s.flash > 0) { ctx.fillStyle = `rgba(255,110,100,${s.flash * 1.1})`; ctx.fillRect(0, 0, LW, LH); }
    };

    let raf, last = performance.now();
    const loop = (t) => {
      const dt = Math.min((t - last) / 1000, 1 / 30); last = t;
      const s = st.current;
      if (live.current.running && !s.over) {
        s.grace -= dt; s.spawnT -= dt;
        if (s.spawnT <= 0 && s.grace <= 0) { spawn(); s.spawnT = Math.max(0.5, 1.25 - s.level * 0.08) + Math.random() * 0.4; }
        const lvl = 1 + Math.floor(s.score / 150);
        if (lvl > s.level) { s.level = lvl; s.banner = { text: `Level ${lvl}`, t: 1.2 }; emit(); }
        for (const it of s.items) {
          it.x += it.vx * dt; it.y += it.vy * dt; it.vy += G * dt; it.a += it.vr * dt;
          if (!it.sliced && it.y > LH + 40 && it.vy > 0) { it.gone = true; if (!it.bomb) { popup(Math.max(40, Math.min(LW - 40, it.x)), LH - 24, "Missed −1 ♥", "#e0556a", 14); loseLife("miss"); } }
        }
        s.items = s.items.filter((it) => !it.sliced && !it.gone);
      }
      if (s.over && !s.overSent) { s.overTimer -= dt; if (s.overTimer <= 0) { s.overSent = true; live.current.onGameOver?.({ score: s.score, level: s.level }); } }
      for (const h of s.halves) { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += G * dt; h.rot = (h.rot || 0) + h.vr * dt; } s.halves = s.halves.filter((h) => h.y < LH + 60);
      for (const q of s.parts) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 420 * dt; } s.parts = s.parts.filter((q) => q.t > 0);
      for (const q of s.popups) q.t -= dt; s.popups = s.popups.filter((q) => q.t > 0);
      for (const p of s.trail) p.t -= dt; s.trail = s.trail.filter((p) => p.t > 0);
      if (s.banner) { s.banner.t -= dt; if (s.banner.t <= 0) s.banner = null; }
      if (s.flash > 0) s.flash -= dt;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); canvas.removeEventListener("pointerleave", up);
    };
  }, []); // eslint-disable-line

  return (
    <canvas ref={canvasRef} className={styles.canvas} style={{ aspectRatio: `${LW} / ${LH}` }} role="img"
      aria-label="Slice Storm game board. Swipe with your finger or mouse across the flying fruit to slice it." />
  );
}
