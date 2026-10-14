import { Navigate, Route, Routes } from "react-router-dom";
import { GameCoinProvider } from "./context/GameCoinContext";
import { ToastProvider } from "./components/ui/Toast";
import Games from "./pages/Games";
import AllGames from "./pages/AllGames";
import GameHomePage from "./pages/GameHomePage";
import GamePlayPage from "./pages/GamePlayPage";
import GameRedeemPage from "./pages/GameRedeemPage";

export default function App() {
  return (
    <GameCoinProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/games" replace />} />
          <Route path="/games" element={<Games />} />
          <Route path="/all-games" element={<AllGames />} />
          <Route path="/games/:slug" element={<GameHomePage />} />
          <Route path="/games/:slug/play" element={<GamePlayPage />} />
          <Route path="/redeem" element={<GameRedeemPage />} />
          <Route path="*" element={<Navigate to="/games" replace />} />
        </Routes>
      </ToastProvider>
    </GameCoinProvider>
  );
}
