# VELOOP Rewards — Games Banner & Game Coin Ecosystem

A responsive Games section for VELOOP Rewards: **13 game banners** in a seamless auto-scrolling carousel, **2 fully playable games** (Block Crush, Slice Storm), a **centralised Game Coin economy**, revive system, first-time game guide and a **Game Coin redemption center**.

## Features

**Games banner section (compact storefront design)**
- VELOOP brand header (logo + PLAY • EARN • REDEEM) with a hamburger menu: navigation, live Token / Game Coin balances and demo tools
- No page headings — just a **Browse All Games →** pill and the carousel
- 13 small cards built from one data file by one reusable `GameCard`: full-bleed artwork (cropped AVIF), category (green dot = playable), game name, compact **Play Now →** pill with infinite shimmer, and a 20 px token chip with the entry fee (`20`)
- Seamless auto-scrolling carousel: pauses on hover/touch/wheel/focus/hidden tab, touch swipe, trackpad, wheel, mouse drag; the next card peeks out at the screen edge; clickable dots + a small pause/play control; no arrows
- States: default, hover, active, loading (`Starting…`), insufficient tokens (red `12/20` chip + `Earn Tokens` button)
- Responsive card sizes: ~148–196 px on phones (2 visible + a peek), 188 px tablet, ~200 px desktop; the All Games grid is 2 columns on phones and auto-fits on larger screens
- Skeleton loader, lazy-loaded images, `prefers-reduced-motion` support, keyboard + screen-reader support

**View All & categories**
- A **View All →** button above the carousel opens `/all-games`
- Category chips with counts: All, Puzzle, Arcade, Action, Strategy, Skill, Shooter, Word, Sports (derived from `gamesData.js`, so adding a game with a new `category` creates its chip automatically)
- **All** shows every game grouped under its category heading; picking a chip shows only that category
- The selected category lives in the URL (`/all-games?category=Puzzle`) so it can be deep-linked and the Back button restores it
- Same `GameCard` and Play Now rules as the carousel (shared `usePlayGame` hook): 2 columns on phones, auto-fit grid up to 5+ columns on desktop, animated filter transitions

**Game ecosystem**
- Journey: Banner → Game Home → Play Now (−20 Tokens) → first-time Guide → Gameplay → Game Over → **Revive / No Thanks** → reward → balance updated → Game Home
- Light, game-specific themes and decorations per game home page
- One central balance (`GameCoinContext`) shared by all games, home pages and Redeem; persisted in `localStorage`
- Reward animation: Game Coins fly to the balance chip, the number counts up
- Redeem center: Game Coins → VEs / SVEs / Gems / Tokens / Spins, confirmation modal, success state, "Not Enough Game Coins" state, redemption history
- Error handling (`Something went wrong` → Try Again / Back to Games). Test it with `?simulateError` on a game home page URL

## Tech stack
React 18 · Vite 5 · Bootstrap 5 (reset + layout utilities) · CSS Modules (`*.module.css`) · React Hooks · React Router 6 · Framer Motion · Lucide React

## Project structure
```
src/
├── main.jsx / App.jsx            router + providers
├── pages/                        Games, AllGames, GameHomePage, GamePlayPage, GameRedeemPage
├── components/
│   ├── games/                    GameCard, GamesCarousel, PlayNowButton, TokenCost, CarouselDots,
│   │                             GamesSkeleton, CategoryTabs, AppHeader, GameHeader, GameCoinBalance, GameNavigation, GameGuide,
│   │                             ReviveModal, GameOver, RewardFlight, RedeemCard, RedeemConfirmModal, ErrorState
│   └── ui/                       Modal, Toast
├── games/                        BlockCrush/, SliceStorm/ (Game.jsx + Game.module.css), registry.js
├── context/GameCoinContext.jsx   the single Game Coin / Token balance
├── hooks/                        useCarousel, useGameSession, useCountUp, useReducedMotion, useBodyBg
├── services/                     gameService.js (mock API), rewardRules.js
├── data/                         gamesData.js, redeemData.js, themes.js
├── assets/games|ui/              optimised AVIF artwork and icons
└── styles/                       variables.css (tokens), global.css
```

## Component behaviour
- **GameCard** – memoised; image area has a fixed aspect ratio (640:781) so every card has the same height; the footer switches to a stacked layout with a CSS container query when the card is narrow (mobile).
- **GamesCarousel / useCarousel** – the list is rendered 3× inside a native scroll container. The carousel always sits in the middle copy and silently jumps one set-width, so there is never a visible rewind. A `requestAnimationFrame` loop adds ~32 px/s. Because the container is a normal scroller, touch swipe, trackpad and wheel work natively; mouse drag uses pointer events. Duplicate copies are `inert` + `aria-hidden`.
- **useGameSession** – phases `guide → playing → revive → result`; one free revive per run; credits the reward exactly once.

## Asset preparation & image optimisation
1. Source artwork supplied as a PDF; the 12 game images were extracted at full resolution.
2. The baked-in bottom strip ("Aim, Throw…", `+20 XP`, green Play Now) was **cropped off**; the feature strip and artwork are kept untouched, never stretched (`object-fit: cover; object-position: top`).
3. Resized to 640×781 and encoded to **AVIF** (`game-01.avif … game-13.avif`, all 13 supplied artworks, ~35–120 KB each, ~1 MB total).
4. The token and Game Coin icons were cut out onto a **transparent background** (flood-fill from the border) and saved as small AVIF with alpha (96 px source for the 20 px display).
5. First 4 cards load eagerly (`fetchpriority=high`); the rest use `loading="lazy"`.

## The two playable games
Both are original implementations of generic mechanics (no third-party code or assets).
| Game | Controls | Lives / Revive | Reward |
|---|---|---|---|
| **Block Crush** (paddle & ball block breaker) | drag / touch, ← → keys | 3 lives; revive restores a life, keeps score & blocks | 1 Game Coin / 30 pts, max 40 |
| **Slice Storm** (swipe to slice fruit, avoid bombs) | swipe / mouse drag | 3 lives (miss a fruit or hit a bomb); revive restores a life | 1 Game Coin / 25 pts, max 40 |

## Security / backend preparation
Reward values are calculated client-side **for the prototype only** (`services/rewardRules.js`). The UI always displays the value returned by `finishSession()`, so a backend can later validate the session, score and completion, calculate the reward and update the balance. A play session is only accepted if it was created by `startSession()` (a refresh on the play page returns to Game Home).

## Installation & running locally
```bash
npm install
npm run dev        # http://localhost:5173
```
Useful URLs: `/games`, `/all-games`, `/all-games?category=Puzzle`, `/games/block-crush`, `/games/slice-storm`, `/redeem`.
Use **Demo tools** in the hamburger menu to set Tokens to 12 (insufficient state) or reset the data.

## Build
```bash
npm run build      # outputs dist/
npm run preview
```

## Deployment
- **Vercel**: import the repo (framework: Vite). `vercel.json` already rewrites all routes to `index.html`.
- **Netlify**: build command `npm run build`, publish dir `dist`. `public/_redirects` handles SPA routing.

## Test checklist (all passed)
1. Games → Block Crush → Game Home → Play Now (−20 Tokens) → Guide → Play → Game Over → Revive → Continue → Game Over → reward → balance updated on Game Home
2. Slice Storm → same journey → **No Thanks** → reward → balance continues from the previous total (central balance)
3. Revive actually restores a life and continues the same run
4. Redeem → confirm → Game Coins deducted, reward shown, history updated
5. Insufficient Tokens → game does not start, message + *Earn More Tokens*
6. Insufficient Game Coins → redemption blocked with a helpful message
7. Layout verified at 320, 375, 768, 1440 px — no horizontal overflow
