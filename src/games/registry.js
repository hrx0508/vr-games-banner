import BlockCrush, { SIZE as bcSize } from "./BlockCrush/Game";
import SliceStorm, { SIZE as ssSize } from "./SliceStorm/Game";

/** Maps game.engine → playable component. Add a new game here and in data/gamesData.js. */
export const engines = {
  blockCrush: { Component: BlockCrush, size: bcSize },
  sliceStorm: { Component: SliceStorm, size: ssSize },
};
