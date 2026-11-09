import { useEffect, useRef } from "react";
import { getLevel } from "../../data/levelsData";
import styles from "./Game.module.css";

/**
 * Slice Storm — original swipe-to-slice game with 10 objective-based levels.
 * Same engine contract as Block Crush:
 *   props  level, levelKey, running, reviveKey,
 *          onStats({score,lives,level,goal,time}), onLevelComplete({level,stars,score,bonus}), onGameOver({score,level,reason})
 */
export const SIZE = { w: 360, h: 500 };
const { w: LW, h: LH } = SIZE;
const G = 560;
const FRUITS = [
  { e: "🍉", c: "#ff5d73" }, { e: "🍊", c: "#ff9f1c" }, { e: "🍎", c: "#e63946" }, { e: "🥝", c: "#7bc043" },
  { e: "🍍", c: "#f4c430" }, { e: "🍋", c: "#f7e04a" }, { e: "🍓", c: "#ff4d6d" }, { e: "🍑", c: "#ffa07a" }, { e: "🍇", c: "#8e5bd6" },
];
const FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const cfgOf = (level) => getLevel("slice-storm", level);

function levelState(level) {
  const cfg = cfgOf(level);
  return {
    cfg, level: cfg.level, items: [], levelScore: 0, sliced: 0, combos: 0, fruitHits: 0, livesLost: 0,
    lives: cfg.lives, maxLives: cfg.lives, timeLeft: cfg.time, waiting: false, over: false, overSent: false, overTimer: 0, overReason: "",
    spawnT: 0.5, grace: 1.3, flash: 0, banner: { text: `Level ${cfg.level}`, sub: cfg.goal.text, t: 2.4 }, swipe: 0, swiping: false, comboCounted: false,
  };
}
function fresh(level) {
  return { halves: [], parts: [], popups: [], trail: [], score: 0, ...levelState(level) };
}
const progressOf = (s) => {
  const t = s.cfg.goal.type;
  return t === "slice" ? s.sliced : t === "score" ? s.levelScore : t === "combo" ? s.combos : s.fruitHits;
};

export default function Game({ level, levelKey, running, reviveKey, onStats, onLevelComplete, onGameOver }) {
  const canvasRef = useRef(null);
  const st = useRef(fresh(level));
  const live = useRef({ level, running, onStats, onLevelComplete, onGameOver });
  live.current = { level, running, onStats, onLevelComplete, onGameOver };
  const lastStats = useRef("");

  const emit = () => {
    const s = st.current, g = s.cfg.goal, done = Math.min(progressOf(s), g.target), time = s.timeLeft == null ? null : Math.ceil(s.timeLeft);
    const key = `${s.score}|${s.lives}|${s.level}|${done}|${time}`;
    if (key !== lastStats.current) {
      lastStats.current = key;
      live.current.onStats?.({ score: s.score, lives: s.lives, maxLives: s.maxLives, level: s.level, goal: { label: g.label, done, total: g.target, text: g.text }, time });
    }
  };

  useEffect(() => {
    if (!levelKey) return;
    const s = st.current;
    Object.assign(s, levelState(live.current.level)); s.halves = []; s.parts = []; s.trail = [];
    emit();
  }, [levelKey]); // eslint-disable-line

  useEffect(() => {
    if (!reviveKey) return;
    const s = st.current;
    s.over = false; s.overSent = false; s.lives = 1; s.items = []; s.spawnT = 1.1; s.grace = 1;
    if (s.timeLeft != null) s.timeLeft = Math.max(s.timeLeft, 15) + (s.overReason === "time" ? 0 : 0); // out of time → +15s
    s.banner = { text: "Revived!", sub: s.overReason === "time" ? "+15 seconds" : "1 life restored", t: 1.3 };
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

    const gameOver = (reason) => {
      const s = st.current;
      if (s.over) return;
      s.over = true; s.overReason = reason; s.overTimer = 0.9; emit();
    };
    const loseLife = (why) => {
      const s = st.current;
      if (s.over || s.waiting) return;
      s.lives -= 1; s.livesLost += 1; s.flash = why === "bomb" ? 0.35 : 0;
      if (s.lives <= 0) gameOver("lives");
      emit();
    };

    const checkGoal = () => {
      const s = st.current;
      if (s.waiting || s.over) return;
      if (progressOf(s) >= s.cfg.goal.target) {
        s.waiting = true; s.items = [];
        const stars = s.livesLost === 0 ? 3 : s.livesLost <= 1 ? 2 : 1;
        const bonus = (s.timeLeft != null ? Math.floor(s.timeLeft) * 2 : 0) + 20 * s.level + (stars - 1) * 15;
        s.score += bonus; emit();
        s.banner = { text: "Level Clear!", sub: `+${bonus} bonus`, t: 2 };
        live.current.onLevelComplete?.({ level: s.level, stars, score: s.score, bonus });
      }
    };

    const slice = (it, angle) => {
      const s = st.current;
      it.sliced = true;
      if (it.bomb) {
        splash(it.x, it.y, "#555", 18); popup(it.x, it.y - 10, "Boom! −1 ♥", "#e0556a", 18);
        s.swipe = 0; loseLife("bomb"); return;
      }
      s.swipe += 1; s.sliced += 1;
      if (it.e === s.cfg.goal.fruit) s.fruitHits += 1;
      s.score += 10; s.levelScore += 10; splash(it.x, it.y, it.c, 12); popup(it.x, it.y - 10, "+10", it.c);
      if (s.swipe === 3 && !s.comboCounted) { s.comboCounted = true; s.combos += 1; popup(LW / 2, LH / 2 - 30, "COMBO!", "#d9730d", 24); }
      s.halves.push({ ...it, side: -1, a: angle, vx: it.vx - 70, vy: it.vy - 40, vr: -3 }, { ...it, side: 1, a: angle, vx: it.vx + 70, vy: it.vy - 40, vr: 3 });
      emit(); checkGoal();
    };

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
    const down = (e) => { e.preventDefault(); canvas.setPointerCapture?.(e.pointerId); prev = pt(e); const s = st.current; s.swiping = true; s.swipe = 0; s.comboCounted = false; s.trail = [{ ...prev, t: 0.25 }]; };
    const move = (e) => {
      if (!st.current.swiping || !live.current.running || st.current.over || st.current.waiting) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) { const p = pt(ev); if (prev) cut(prev, p); st.current.trail.push({ ...p, t: 0.25 }); prev = p; }
    };
    const up = () => {
      const s = st.current;
      if (s.swipe >= 3) { const bonus = s.swipe * 5; s.score += bonus; s.levelScore += bonus; popup(LW / 2, LH / 2, `Combo ×${s.swipe}  +${bonus}`, "#d9730d", 22); emit(); checkGoal(); }
      s.swiping = false; s.swipe = 0; prev = null;
    };
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("pointerleave", up);

    const spawn = () => {
      const s = st.current, c = s.cfg, n = randInt(c.wave[0], c.wave[1]), cluster = n >= 3;
      const x0 = rand(80, LW - 80), peak0 = LH * rand(0.55, 0.8), Ge = G * c.gMul;
      for (let i = 0; i < n; i++) {
        const bomb = Math.random() < c.bomb;
        let f = FRUITS[(Math.random() * FRUITS.length) | 0];
        if (c.goal.type === "fruit" && Math.random() < 0.3) f = FRUITS.find((q) => q.e === c.goal.fruit);
        const x = cluster ? x0 + (i - (n - 1) / 2) * 46 : rand(50, LW - 50), peak = cluster ? peak0 + rand(-14, 14) : LH * rand(0.5, 0.82);
        s.items.push({ x, y: LH + 30 + (cluster ? i * 6 : 0), vx: cluster ? (LW / 2 - x0) * 0.25 + rand(-8, 8) : (LW / 2 - x) * rand(0.25, 0.65) + rand(-40, 40), vy: -Math.sqrt(2 * Ge * peak), g: Ge, r: 28, a: rand(0, 6), vr: rand(-3, 3), e: bomb ? "💣" : f.e, c: bomb ? "#444" : f.c, bomb, sliced: false });
      }
    };

    const draw = () => {
      const s = st.current;
      const g = ctx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, "#fff6ea"); g.addColorStop(1, "#ffe3cf");
      ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
      ctx.fillStyle = "rgba(255,138,61,.07)";
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(60 + i * 70, 120 + (i % 2) * 190, 54 - i * 4, 0, 6.283); ctx.fill(); }
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#000"; // emoji glyphs inherit fillStyle alpha
      for (const it of s.items) {
        if (it.sliced) continue;
        ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.a); ctx.font = `${it.r * 1.9}px ${FONT}`;
        if (s.cfg.goal.fruit && it.e === s.cfg.goal.fruit) { ctx.shadowColor = "rgba(255,93,115,.9)"; ctx.shadowBlur = 16; } // highlight the target fruit
        ctx.fillText(it.e, 0, 2); ctx.restore();
      }
      for (const h of s.halves) {
        ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.a + (h.rot || 0)); ctx.beginPath(); ctx.rect(h.side < 0 ? -h.r * 1.2 : 0, -h.r * 1.2, h.r * 1.2, h.r * 2.4); ctx.clip();
        ctx.font = `${h.r * 1.9}px ${FONT}`; ctx.fillText(h.e, 0, 2); ctx.restore();
      }
      for (const q of s.parts) { ctx.globalAlpha = Math.max(0, q.t * 2); ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.s, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
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
      if (s.banner) {
        ctx.globalAlpha = Math.min(1, s.banner.t);
        ctx.font = "800 30px Poppins, sans-serif"; ctx.fillStyle = "#8a3d00"; ctx.fillText(s.banner.text, LW / 2, LH / 2 - 6);
        ctx.font = "600 14px Poppins, sans-serif"; ctx.fillStyle = "#a8683d"; ctx.fillText(s.banner.sub || "", LW / 2, LH / 2 + 20); ctx.globalAlpha = 1;
      }
      if (s.flash > 0) { ctx.fillStyle = `rgba(255,110,100,${s.flash * 1.1})`; ctx.fillRect(0, 0, LW, LH); }
    };

    let raf, last = performance.now();
    const loop = (t) => {
      const dt = Math.min((t - last) / 1000, 1 / 30); last = t;
      const s = st.current;
      if (live.current.running && !s.over && !s.waiting) {
        s.grace -= dt; s.spawnT -= dt;
        if (s.spawnT <= 0 && s.grace <= 0) { spawn(); s.spawnT = rand(s.cfg.interval[0], s.cfg.interval[1]); }
        if (s.timeLeft != null) { s.timeLeft -= dt; if (s.timeLeft <= 0) { s.timeLeft = 0; emit(); gameOver("time"); } else emit(); }
        for (const it of s.items) {
          it.x += it.vx * dt; it.y += it.vy * dt; it.vy += it.g * dt; it.a += it.vr * dt;
          if (!it.sliced && it.y > LH + 40 && it.vy > 0) {
            it.gone = true;
            const costs = !it.bomb && (s.cfg.goal.type !== "fruit" || it.e === s.cfg.goal.fruit); // in a target-fruit level only a missed target costs a life
            if (costs) { popup(Math.max(40, Math.min(LW - 40, it.x)), LH - 24, "Missed −1 ♥", "#e0556a", 14); loseLife("miss"); }
          }
        }
        s.items = s.items.filter((it) => !it.sliced && !it.gone);
        if (s.cfg.goal.type === "score") checkGoal();
      }
      if (s.over && !s.overSent) { s.overTimer -= dt; if (s.overTimer <= 0) { s.overSent = true; live.current.onGameOver?.({ score: s.score, level: s.level, reason: s.overReason }); } }
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
