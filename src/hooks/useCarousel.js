import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Seamless auto-scrolling carousel on a *native* scroll container.
 *  - the track renders the list 3x; we always sit in the middle copy and
 *    silently jump by one set-width, so there is never a visible rewind
 *  - native overflow scrolling = touch swipe, trackpad and wheel for free
 *  - mouse drag is added with pointer events
 *  - pauses on hover / touch / wheel / focus / hidden tab / off-screen
 */
export function useCarousel({ count, speed = 30, resumeDelay = 2200 }) {
  const trackRef = useRef(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const s = useRef({ pos: 0, setW: 0, step: 1, paused: false, timer: null, idle: null, drag: null, moved: false, visible: true, lastActive: 0, locked: false });
  const userPausedRef = useRef(false);
  userPausedRef.current = userPaused;

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.children.length < count * 2) return;
    const st = s.current;
    st.setW = el.children[count].offsetLeft - el.children[0].offsetLeft;
    st.step = el.children[1].offsetLeft - el.children[0].offsetLeft;
    if (!st.ready) { el.scrollLeft = st.setW; st.pos = st.setW; st.ready = true; }
  }, [count]);

  const normalise = useCallback(() => {
    const el = trackRef.current, st = s.current;
    if (!el || !st.setW) return;
    let x = el.scrollLeft;
    if (x >= st.setW * 2) x -= st.setW;
    else if (x < st.setW) x += st.setW;
    if (x !== el.scrollLeft) { el.scrollLeft = x; }
    st.pos = el.scrollLeft;
  }, []);

  const updateActive = useCallback(() => {
    const st = s.current, el = trackRef.current;
    if (!el || !st.setW) return;
    const rel = (((el.scrollLeft - st.setW) % st.setW) + st.setW) % st.setW;
    const idx = Math.round(rel / st.step) % count;
    if (idx !== st.lastActive) { st.lastActive = idx; setActive(idx); }
  }, [count]);

  const pause = useCallback(() => { const st = s.current; st.paused = true; clearTimeout(st.timer); }, []);
  const resume = useCallback((delay = resumeDelay) => {
    const st = s.current;
    clearTimeout(st.timer);
    st.timer = setTimeout(() => {
      const el = trackRef.current;
      if (el) { normalise(); st.pos = el.scrollLeft; }
      st.paused = false;
    }, delay);
  }, [normalise, resumeDelay]);

  // measure + animation loop
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.querySelectorAll("[data-dup]").forEach((n) => n.setAttribute("inert", ""));
    measure();
    const ro = new ResizeObserver(() => { const st = s.current; const was = st.setW; measure(); if (was && st.setW && was !== st.setW) { el.scrollLeft = st.pos = st.setW + (st.pos - was) * (st.setW / was); } });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { s.current.visible = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(el);
    const onVis = () => { if (document.hidden) pause(); else resume(300); };
    document.addEventListener("visibilitychange", onVis);

    let raf, last = performance.now();
    const tick = (t) => {
      const st = s.current;
      const dt = Math.min(t - last, 50);
      last = t;
      if (!reduced && !userPausedRef.current && !st.paused && st.visible && st.setW && !st.drag) {
        st.pos += (speed * dt) / 1000;
        if (st.pos >= st.setW * 2) st.pos -= st.setW;
        el.scrollLeft = st.pos;
        updateActive();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      clearTimeout(s.current.timer); clearTimeout(s.current.idle);
    };
  }, [measure, pause, resume, reduced, speed, updateActive]);

  // user scroll → keep our position in sync, update dots, wrap when settled
  const onScroll = useCallback(() => {
    const st = s.current, el = trackRef.current;
    if (!el) return;
    if (Math.abs(el.scrollLeft - st.pos) > 2) {
      st.pos = el.scrollLeft;
      updateActive();
      clearTimeout(st.idle);
      st.idle = setTimeout(normalise, 160);
    }
  }, [normalise, updateActive]);

  const goTo = useCallback((i) => {
    const el = trackRef.current, st = s.current;
    if (!el) return;
    pause();
    normalise();
    el.scrollTo({ left: st.setW + i * st.step, behavior: reduced ? "auto" : "smooth" });
    resume(resumeDelay + 600);
  }, [normalise, pause, reduced, resume, resumeDelay]);

  const handlers = {
    onScroll,
    onPointerEnter: (e) => { if (e.pointerType === "mouse") pause(); },
    onPointerLeave: (e) => { if (e.pointerType === "mouse" && !s.current.drag) resume(300); },
    onTouchStart: () => pause(),
    onTouchEnd: () => resume(),
    onTouchCancel: () => resume(),
    onWheel: () => { pause(); resume(); },
    onFocus: () => pause(),
    onBlur: () => resume(600),
    onPointerDown: (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      s.current.drag = { x: e.clientX, left: trackRef.current.scrollLeft, active: false };
      s.current.moved = false;
    },
    onPointerMove: (e) => {
      const d = s.current.drag;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (!d.active && Math.abs(dx) > 5) { d.active = true; s.current.moved = true; trackRef.current.setPointerCapture?.(e.pointerId); trackRef.current.dataset.dragging = "true"; }
      if (d.active) { trackRef.current.scrollLeft = d.left - dx; }
    },
    onPointerUp: (e) => {
      const el = trackRef.current;
      if (s.current.drag?.active) { el.releasePointerCapture?.(e.pointerId); delete el.dataset.dragging; }
      s.current.drag = null;
    },
    onClickCapture: (e) => { if (s.current.moved) { e.preventDefault(); e.stopPropagation(); s.current.moved = false; } },
  };

  return { trackRef, active, goTo, handlers, userPaused, setUserPaused, reduced };
}
