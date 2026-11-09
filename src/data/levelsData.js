/**
 * Level definitions — the single source of truth for BOTH the engines and the Game Home level map.
 * Every level has a real objective, a completion condition and harder parameters than the one before.
 */

/* ───────── Block Crush ─────────
   layout rows use 7 columns:  .  empty · 1/2/3  block needing that many hits · S  steel block (can't be broken, bounce off it) */
export const blockCrushLevels = [
  { level: 1, name: "Warm-up", layout: ["1111111", "1111111", "1111111"], speed: 290, paddle: 86 },
  { level: 2, name: "Double Hit", layout: ["2222222", "1111111", "1111111", "1111111"], speed: 310, paddle: 84 },
  { level: 3, name: "Diamond", layout: ["...1...", "..111..", ".11211.", "1112111", ".11211.", "..111..", "...1..."], speed: 330, paddle: 82 },
  { level: 4, name: "Steel Posts", layout: ["1111111", "1S1S1S1", "2222222", "1S1S1S1", "1111111"], speed: 350, paddle: 80 },
  { level: 5, name: "Stripes", layout: ["2222222", "1111111", "2222222", "1111111", "2222222"], speed: 370, paddle: 78 },
  { level: 6, name: "Heavy Roof", layout: ["3333333", "2S2S2S2", "1111111", "1S1S1S1", "2222222"], speed: 390, paddle: 74 },
  { level: 7, name: "Checkerboard", layout: ["2121212", "1212121", "2121212", "1212121", "1S1S1S1", "2121212"], speed: 410, paddle: 72 },
  { level: 8, name: "Fortress", layout: ["SSS.SSS", "3333333", "2222222", "3.3.3.3", "2222222", "3333333"], speed: 430, paddle: 68 },
  { level: 9, name: "Iron Wall", layout: ["3333333", "3S333S3", "3333333", "2S2S2S2", "2222222", "1111111", "S1S1S1S"], speed: 450, paddle: 64 },
  { level: 10, name: "Block Boss", layout: ["3333333", "3S3S3S3", "3333333", "2S2S2S2", "3333333", "2222222", "3S3S3S3"], speed: 480, paddle: 60 },
];

/* ───────── Slice Storm ─────────
   goal.type: slice (N fruits) · score (N points this level) · combo (N swipes of 3+ fruits) · fruit (N of one fruit)
   time: seconds allowed (null = untimed) · lives per level · wave: items per launch [min,max]
   interval: seconds between launches [min,max] · bomb: chance an item is a bomb · gMul: faster flights */
export const sliceStormLevels = [
  { level: 1, name: "First Cuts", goal: { type: "slice", target: 12, label: "Fruits", text: "Slice 12 fruits" }, lives: 3, time: null, wave: [1, 1], interval: [1.3, 1.7], bomb: 0, gMul: 1 },
  { level: 2, name: "Double Trouble", goal: { type: "slice", target: 22, label: "Fruits", text: "Slice 22 fruits — watch for bombs" }, lives: 3, time: null, wave: [1, 2], interval: [1.15, 1.5], bomb: 0.07, gMul: 1.03 },
  { level: 3, name: "Beat the Clock", goal: { type: "score", target: 300, label: "Points", text: "Score 300 points in 40s" }, lives: 3, time: 40, wave: [1, 2], interval: [0.95, 1.25], bomb: 0.1, gMul: 1.06 },
  { level: 4, name: "Combo Time", goal: { type: "combo", target: 4, label: "Combos", text: "Make 4 combos (3 fruits in one swipe) in 75s" }, lives: 3, time: 75, wave: [3, 3], interval: [1.8, 2.3], bomb: 0.05, gMul: 1.08 },
  { level: 5, name: "Melon Hunt", goal: { type: "fruit", target: 14, fruit: "🍉", label: "🍉", text: "Slice 14 watermelons 🍉 in 60s" }, lives: 3, time: 60, wave: [2, 3], interval: [0.95, 1.3], bomb: 0.13, gMul: 1.12 },
  { level: 6, name: "Steady Hands", goal: { type: "slice", target: 40, label: "Fruits", text: "Slice 40 fruits — only 2 lives" }, lives: 2, time: null, wave: [1, 3], interval: [0.85, 1.15], bomb: 0.16, gMul: 1.17 },
  { level: 7, name: "Speed Round", goal: { type: "score", target: 600, label: "Points", text: "Score 600 points in 50s" }, lives: 3, time: 50, wave: [2, 3], interval: [0.85, 1.1], bomb: 0.14, gMul: 1.2 },
  { level: 8, name: "Combo Master", goal: { type: "combo", target: 5, label: "Combos", text: "Make 5 combos in 70s — only 2 lives" }, lives: 2, time: 70, wave: [3, 4], interval: [1.4, 1.8], bomb: 0.14, gMul: 1.26 },
  { level: 9, name: "Bomb Squad", goal: { type: "fruit", target: 18, fruit: "🍉", label: "🍉", text: "Slice 18 watermelons 🍉 — bombs everywhere" }, lives: 2, time: 55, wave: [2, 4], interval: [0.8, 1.05], bomb: 0.18, gMul: 1.3 },
  { level: 10, name: "Storm Boss", goal: { type: "score", target: 900, label: "Points", text: "Score 900 points in 60s" }, lives: 3, time: 60, wave: [2, 3], interval: [0.7, 0.9], bomb: 0.18, gMul: 1.36 },
];

export const levelsBySlug = { "block-crush": blockCrushLevels, "slice-storm": sliceStormLevels };
export const getLevels = (slug) => levelsBySlug[slug] || [];
export const getLevel = (slug, n) => { const l = getLevels(slug); return l[Math.min(Math.max(n, 1), l.length) - 1]; };

export const levelObjective = (slug, n) => {
  const l = getLevel(slug, n);
  if (!l) return "";
  return slug === "slice-storm" ? l.goal.text : `Break every block${l.layout.some((r) => r.includes("S")) ? " — steel blocks can't be broken" : ""}`;
};
