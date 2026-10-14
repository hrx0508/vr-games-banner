import veIcon from "../assets/ui/ve.avif";
import sveIcon from "../assets/ui/sve.avif";
import gemIcon from "../assets/ui/gem.avif";
import tokenIcon from "../assets/ui/token.avif";
import spinIcon from "../assets/ui/spin.avif";

/** Dummy conversion rates for the prototype (replace with backend-provided rates). */
export const redeemOptions = [
  { id: "ve", name: "VEs", short: "VE", description: "Convert Game Coins to VEs", cost: 100, amount: 10, icon: veIcon, color: "#f0a91c", walletKey: "ve" },
  { id: "sve", name: "SVEs", short: "SVE", description: "Convert to Silver VEs", cost: 100, amount: 5, icon: sveIcon, color: "#8b95b8", walletKey: "sve" },
  { id: "gems", name: "Gems", short: "Gems", description: "Convert to Gems", cost: 50, amount: 5, icon: gemIcon, color: "#8b6cff", walletKey: "gems" },
  { id: "tokens", name: "Tokens", short: "Tokens", description: "Convert to play-ready Tokens", cost: 25, amount: 20, icon: tokenIcon, color: "#d99a1f", walletKey: "tokens" },
  { id: "spins", name: "Spins", short: "Spins", description: "Convert to Spin Wheel spins", cost: 60, amount: 3, icon: spinIcon, color: "#4c86ff", walletKey: "spins" },
];

export const getRedeemOption = (id) => redeemOptions.find((o) => o.id === id);
