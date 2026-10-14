import { useEffect, useRef } from "react";
import styles from "./Game.module.css";

/**
 * Block Crush — original paddle-and-ball block breaker.
 * Contract shared by every engine:
 *   props: running, reviveKey, onStats({score,lives,level}), onGameOver({score,level})
 */
export const SIZE = { w: 360, h: 500 };
const { w: LW, h: LH } = SIZE;
const COLORS = ["#6f8dff", "#8b6cff", "#3fc7b0", "#f6b94d", "#ff8f78", "#5aa9ff", "#c07cff", "#59d68c"];
const COLS = 7, PAD = 14, GAP = 5, BH = 20, TOP = 52;
const BW = (LW - PAD * 2 - GAP * (COLS - 1)) / COLS;

function layout(level) {
  const rows = Math.min(5 + Math.floor(level / 2), 8);
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const pattern = level % 3;
      if (pattern === 2 && (r + c) % 4 === 3) continue; // gaps
      if (pattern === 0 && level > 1 && r === rows - 1 && c % 2) continue;
      const tough = level >= 2 && (r === 0 || (level >= 4 && r === 1));
      out.push({ x: PAD + c * (BW + GAP), y: TOP + r * (BH + GAP), w: BW, h: BH, hp: tough ? 2 : 1, max: tough ? 2 : 1, color: COLORS[(r + level) % COLORS.length], alive: true });
    }
  }
  return out;
}

const speedFor = (level) => Math.min(560, 300 + level * 28);

function fresh() {
  return {
    bricks: layout(1), score: 0, lives: 3, level: 1, combo: 0, over: false, overSent: false, overTimer: 0,
    paddle: { x: LW / 2, target: LW / 2, w: 78, h: 12, y: LH - 38 },
    ball: { x: LW / 2, y: LH - 56, vx: 0, vy: 0, r: 7, stuck: true, wait: 1.8 },
    popups: [], parts: [], banner: null, keys: { l: false, r: false }, started: false,
  };
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

  // revive: restore a life and keep score/bricks
  useEffect(() => {
    if (!reviveKey) return;
    const s = st.current;
    s.over = false; s.overSent = false; s.lives = 1; s.combo = 0;
    Object.assign(s.ball, { stuck: true, wait: 1.4, vx: 0, vy: 0 });
    s.banner = { text: "Revived!", t: 1.2 };
    emit();
  }, [reviveKey]); // eslint-disable-line

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = LW * dpr; canvas.height = LH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (import.meta.env.DEV) window.__game = st;
    emit();

    const toX = (e) => { const r = canvas.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * LW; };
    const launch = () => { const s = st.current; if (s.ball.stuck && live.current.running && !s.over) doLaunch(); };
    const doLaunch = () => {
      const s = st.current, sp = speedFor(s.level), a = (Math.random() * 0.5 - 0.25);
      s.ball.stuck = false; s.ball.vx = Math.sin(a) * sp; s.ball.vy = -Math.cos(a) * sp; s.started = true;
    };
    const move = (e) => { st.current.paddle.target = toX(e); };
    const down = (e) => { e.preventDefault(); canvas.setPointerCapture?.(e.pointerId); move(e); launch(); };
    const key = (e, v) => {
      const k = st.current.keys;
      if (e.key === "ArrowLeft" || e.key === "a") { k.l = v; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d") { k.r = v; e.preventDefault(); }
      if (v && (e.key === " " || e.key === "ArrowUp")) { launch(); e.preventDefault(); }
    };
    const kd = (e) => key(e, true), ku = (e) => key(e, false);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);

    const popup = (x, y, text, color = "#26306b") => st.current.popups.push({ x, y, text, color, t: 0.9 });
    const burst = (x, y, color, n = 8) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = 40 + Math.random() * 110; st.current.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, t: 0.5 + Math.random() * 0.3, c: color, s: 2 + Math.random() * 3 }); } };

    const loseLife = () => {
      const s = st.current;
      s.lives -= 1; s.combo = 0;
      if (s.lives <= 0) { s.over = true; s.overTimer = 0.7; s.ball.vx = s.ball.vy = 0; }
      else { Object.assign(s.ball, { stuck: true, wait: 1.5, vx: 0, vy: 0 }); popup(s.paddle.x, LH - 70, "Ball lost", "#e0556a"); }
      emit();
    };

    const step = (dt) => {
      const s = st.current, b = s.ball, p = s.paddle;
      // paddle
      if (s.keys.l) p.target -= 380 * dt;
      if (s.keys.r) p.target += 380 * dt;
      p.target = Math.max(p.w / 2, Math.min(LW - p.w / 2, p.target));
      p.x += (p.target - p.x) * Math.min(1, dt * 22);

      if (b.stuck) {
        b.x = p.x; b.y = p.y - b.r - 1;
        b.wait -= dt; if (b.wait <= 0) doLaunch();
        return;
      }
      const sp = Math.hypot(b.vx, b.vy), n = Math.max(1, Math.ceil((sp * dt) / 5));
      for (let i = 0; i < n; i++) {
        b.x += (b.vx * dt) / n; b.y += (b.vy * dt) / n;
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); }
        if (b.x > LW - b.r) { b.x = LW - b.r; b.vx = -Math.abs(b.vx); }
        if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); }
        // paddle
        if (b.vy > 0 && b.y + b.r >= p.y && b.y - b.r <= p.y + p.h && Math.abs(b.x - p.x) <= p.w / 2 + b.r) {
          const off = Math.max(-1, Math.min(1, (b.x - p.x) / (p.w / 2))), a = off * 1.05, v = speedFor(s.level);
          b.vx = Math.sin(a) * v; b.vy = -Math.cos(a) * v; b.y = p.y - b.r; s.combo = 0;
        }
        // bricks
        for (const k of s.bricks) {
          if (!k.alive) continue;
          const cx = Math.max(k.x, Math.min(b.x, k.x + k.w)), cy = Math.max(k.y, Math.min(b.y, k.y + k.h));
          const dx = b.x - cx, dy = b.y - cy;
          if (dx * dx + dy * dy > b.r * b.r) continue;
          const inX = b.x >= k.x && b.x <= k.x + k.w, inY = b.y >= k.y && b.y <= k.y + k.h;
          if (inX || (!inY && Math.abs(dy) > Math.abs(dx))) { b.vy = dy < 0 ? -Math.abs(b.vy) : Math.abs(b.vy); b.y += dy < 0 ? -1.5 : 1.5; }
          else { b.vx = dx < 0 ? -Math.abs(b.vx) : Math.abs(b.vx); b.x += dx < 0 ? -1.5 : 1.5; }
          k.hp -= 1;
          if (k.hp <= 0) {
            k.alive = false; s.combo += 1;
            const pts = 10 + Math.min(s.combo - 1, 8) * 2;
            s.score += pts; popup(k.x + k.w / 2, k.y, `+${pts}`, k.color); burst(k.x + k.w / 2, k.y + k.h / 2, k.color);
            emit();
          } else { burst(b.x, b.y, "#c9d3ff", 3); }
          break;
        }
        if (b.y - b.r > LH) { loseLife(); return; }
      }
      // level clear
      if (s.bricks.every((k) => !k.alive)) {
        s.level += 1; s.bricks = layout(s.level); s.score += 50;
        Object.assign(b, { stuck: true, wait: 1.6, vx: 0, vy: 0 });
        s.banner = { text: `Level ${s.level}`, t: 1.4 }; popup(LW / 2, LH / 2, "+50 clear bonus", "#1f9d7c");
        emit();
      }
    };

    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
    const draw = () => {
      const s = st.current;
      const g = ctx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, "#f3f6ff"); g.addColorStop(1, "#dfe7ff");
      ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
      ctx.strokeStyle = "rgba(111,141,255,.09)"; ctx.lineWidth = 1;
      for (let x = 0; x <= LW; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, LH); ctx.stroke(); }
      for (let y = 0; y <= LH; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LW, y); ctx.stroke(); }
      for (const k of s.bricks) {
        if (!k.alive) continue;
        ctx.fillStyle = k.color; rr(k.x, k.y, k.w, k.h, 6); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.28)"; rr(k.x + 2, k.y + 2, k.w - 4, 6, 3); ctx.fill();
        if (k.max === 2) { ctx.strokeStyle = k.hp === 2 ? "#1f2757" : "rgba(31,39,87,.35)"; ctx.lineWidth = 2; rr(k.x + 1, k.y + 1, k.w - 2, k.h - 2, 5); ctx.stroke(); }
      }
      for (const q of s.parts) { ctx.globalAlpha = Math.max(0, q.t * 2); ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, q.s, q.s); }
      ctx.globalAlpha = 1;
      const p = s.paddle, pg = ctx.createLinearGradient(p.x - p.w / 2, 0, p.x + p.w / 2, 0); pg.addColorStop(0, "#8b6cff"); pg.addColorStop(1, "#4c86ff");
      ctx.shadowColor = "rgba(76,134,255,.45)"; ctx.shadowBlur = 12; ctx.fillStyle = pg; rr(p.x - p.w / 2, p.y, p.w, p.h, 7); ctx.fill(); ctx.shadowBlur = 0;
      const b = s.ball;
      ctx.shadowColor = "rgba(246,200,90,.8)"; ctx.shadowBlur = 10; ctx.fillStyle = "#26306b"; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#f6c85a"; ctx.beginPath(); ctx.arc(b.x - 2, b.y - 2, 2.4, 0, 6.283); ctx.fill();
      ctx.font = "700 14px Poppins, sans-serif"; ctx.textAlign = "center";
      for (const q of s.popups) { ctx.globalAlpha = Math.min(1, q.t * 2); ctx.fillStyle = q.color; ctx.fillText(q.text, q.x, q.y - (0.9 - q.t) * 34); }
      ctx.globalAlpha = 1;
      if (s.banner) { ctx.globalAlpha = Math.min(1, s.banner.t); ctx.font = "800 30px Poppins, sans-serif"; ctx.fillStyle = "#26306b"; ctx.fillText(s.banner.text, LW / 2, LH / 2 + 40); ctx.globalAlpha = 1; }
      if (b.stuck && !s.over && live.current.running) { ctx.font = "600 12px Poppins, sans-serif"; ctx.fillStyle = "#6a7094"; ctx.fillText("Tap to launch", LW / 2, p.y - 26); }
    };

    let raf, last = performance.now();
    const loop = (t) => {
      const dt = Math.min((t - last) / 1000, 1 / 30); last = t;
      const s = st.current;
      if (live.current.running && !s.over) step(dt);
      if (s.over && !s.overSent) { s.overTimer -= dt; if (s.overTimer <= 0) { s.overSent = true; live.current.onGameOver?.({ score: s.score, level: s.level }); } }
      for (const q of s.popups) q.t -= dt; s.popups = s.popups.filter((q) => q.t > 0);
      for (const q of s.parts) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 300 * dt; } s.parts = s.parts.filter((q) => q.t > 0);
      if (s.banner) { s.banner.t -= dt; if (s.banner.t <= 0) s.banner = null; }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
    };
  }, []); // eslint-disable-line

  return (
    <canvas ref={canvasRef} className={styles.canvas} style={{ aspectRatio: `${LW} / ${LH}` }} role="img"
      aria-label="Block Crush game board. Drag to move the paddle, or use the left and right arrow keys." />
  );
}
