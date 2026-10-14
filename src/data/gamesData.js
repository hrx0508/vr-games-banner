import g01 from "../assets/games/game-01.avif";
import g02 from "../assets/games/game-02.avif";
import g03 from "../assets/games/game-03.avif";
import g04 from "../assets/games/game-04.avif";
import g05 from "../assets/games/game-05.avif";
import g06 from "../assets/games/game-06.avif";
import g07 from "../assets/games/game-07.avif";
import g08 from "../assets/games/game-08.avif";
import g09 from "../assets/games/game-09.avif";
import g10 from "../assets/games/game-10.avif";
import g11 from "../assets/games/game-11.avif";
import g12 from "../assets/games/game-12.avif";
import g13 from "../assets/games/game-13.avif";

export const ENTRY_COST = 20;
export const CURRENCY = "Tokens";

const base = { cost: ENTRY_COST, currency: CURRENCY, playable: false };

/** Single source of truth for all 13 banners. Cards are generated from this list. */
export const games = [
  { ...base, id: 1, slug: "blade-master", name: "Blade Master", image: g01, category: "Skill" },
  { ...base, id: 2, slug: "nutcraft", name: "Nutcraft", image: g02, category: "Puzzle" },
  {
    ...base, id: 3, slug: "block-crush", name: "Block Crush", image: g03, category: "Arcade",
    playable: true, engine: "blockCrush", accent: "#4c86ff",
    tagline: "Aim, bounce and break every block.",
    description: "Slide the paddle, keep the ball alive and smash through colourful blocks. Chain hits for combo points.",
    reward: { perPoints: 30, cap: 40, min: 1, label: "1 Game Coin per 30 points · up to 40 per run" },
    guide: [
      { icon: "move", title: "Move the paddle", text: "Drag your finger or mouse (or use ← → keys) to slide the paddle." },
      { icon: "target", title: "Break the blocks", text: "Bounce the ball into blocks. Tougher blocks take two hits." },
      { icon: "heart", title: "Keep the ball alive", text: "You have 3 lives. Miss the ball and you lose one." },
      { icon: "coins", title: "Earn Game Coins", text: "The higher your score, the more Game Coins you win." },
    ],
  },
  {
    ...base, id: 4, slug: "slice-storm", name: "Slice Storm", image: g04, category: "Action",
    playable: true, engine: "sliceStorm", accent: "#ff8a3d",
    tagline: "Slice the fruit. Dodge the bombs.",
    description: "Swipe across flying fruit to slice it. Chain several in one swipe for bonus points — and stay away from bombs!",
    reward: { perPoints: 25, cap: 40, min: 1, label: "1 Game Coin per 25 points · up to 40 per run" },
    guide: [
      { icon: "swipe", title: "Swipe to slice", text: "Drag across fruit with your finger or mouse to cut it." },
      { icon: "combo", title: "Chain combos", text: "Slice 3 or more fruits in a single swipe for bonus points." },
      { icon: "bomb", title: "Avoid bombs", text: "Slicing a bomb costs a life. Missing a fruit does too." },
      { icon: "coins", title: "Earn Game Coins", text: "Your final score is converted into Game Coins." },
    ],
  },
  { ...base, id: 5, slug: "cosmo-warrior", name: "Cosmo Warrior", image: g05, category: "Shooter" },
  { ...base, id: 6, slug: "toilet-tactics", name: "Toilet Tactics", image: g06, category: "Strategy" },
  { ...base, id: 7, slug: "word-hunt", name: "Word Hunt", image: g07, category: "Word" },
  { ...base, id: 8, slug: "bubble-blast-legend", name: "Bubble Blast Legend", image: g08, category: "Puzzle" },
  { ...base, id: 9, slug: "merge-master", name: "Merge Master", image: g09, category: "Puzzle" },
  { ...base, id: 10, slug: "wormzy", name: "Wormzy", image: g10, category: "Puzzle" },
  { ...base, id: 11, slug: "aqua-fill", name: "Aqua Fill", image: g11, category: "Puzzle" },
  { ...base, id: 12, slug: "realm-clash", name: "Realm Clash", image: g12, category: "Strategy" },
  { ...base, id: 13, slug: "bowlexa", name: "Bowlexa", image: g13, category: "Sports" },
];

export const getGame = (slug) => games.find((g) => g.slug === slug);
export const playableGames = games.filter((g) => g.playable);

/** Category filter chips, in display order ("All" is added by the UI). Derived so it never drifts from the games list. */
const CATEGORY_ORDER = ["Puzzle", "Arcade", "Action", "Strategy", "Skill", "Shooter", "Word", "Sports"];
export const categories = [
  ...CATEGORY_ORDER.filter((c) => games.some((g) => g.category === c)),
  ...[...new Set(games.map((g) => g.category))].filter((c) => !CATEGORY_ORDER.includes(c)),
];
export const countIn = (category) => (category === "All" ? games.length : games.filter((g) => g.category === category).length);
