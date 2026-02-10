import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AuthForm } from "./components/Auth";
import { GameCanvas } from "./components/Game";
import { Leaderboard } from "./components/Leaderboard";
import { Id } from "../convex/_generated/dataModel";

type GameState = "menu" | "playing" | "gameOver";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [lastGameStats, setLastGameStats] = useState<{
    score: number;
    duration: number;
    obstaclesAvoided: number;
    isNewRecord: boolean;
  } | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [gameId, setGameId] = useState<Id<"liveGames"> | null>(null);

  const currentPlayer = useQuery(api.players.getCurrentPlayer);
  const getOrCreatePlayer = useMutation(api.players.getOrCreatePlayer);
  const updateHighScore = useMutation(api.players.updateHighScore);
  const startGame = useMutation(api.liveGames.startGame);
  const endGame = useMutation(api.liveGames.endGame);

  useEffect(() => {
    if (isAuthenticated && currentPlayer === null && !isLoading) {
      setShowNameInput(true);
    } else if (currentPlayer) {
      setShowNameInput(false);
    }
  }, [isAuthenticated, currentPlayer, isLoading]);

  const handleCreatePlayer = async () => {
    if (!playerName.trim()) return;
    await getOrCreatePlayer({ name: playerName.trim() });
    setShowNameInput(false);
  };

  const handleStartGame = async () => {
    if (!currentPlayer) {
      setShowNameInput(true);
      return;
    }
    const id = await startGame();
    setGameId(id);
    setScore(0);
    setGameState("playing");
  };

  const handleGameOver = async (
    finalScore: number,
    duration: number,
    obstaclesAvoided: number
  ) => {
    if (gameId) {
      await endGame({ gameId });
    }

    const result = await updateHighScore({
      score: finalScore,
      duration,
      obstaclesAvoided,
    });

    setLastGameStats({
      score: finalScore,
      duration,
      obstaclesAvoided,
      isNewRecord: result.isNewRecord,
    });
    setGameState("gameOver");
    setGameId(null);
  };

  const handleReturnToMenu = () => {
    setGameState("menu");
    setLastGameStats(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 mb-2 tracking-tight">
              NARUTO RUNNER
            </h1>
            <p className="text-white/60 text-lg md:text-xl">
              Dash to Ichiraku Ramen! 🍜
            </p>
          </div>

          <AuthForm />
        </div>

        <Footer />
      </div>
    );
  }

  // Name input for new players
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-orange-500/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-3xl">🥷</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Choose Your Ninja Name</h2>
              <p className="text-white/60 text-sm">This will appear on the leaderboard</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your ninja name..."
                maxLength={20}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />

              <button
                onClick={handleCreatePlayer}
                disabled={!playerName.trim()}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
              >
                Let's Go!
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Game Over Screen
  if (gameState === "gameOver" && lastGameStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
          <div className="w-full max-w-lg">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-orange-500/20 shadow-2xl text-center">
              {lastGameStats.isNewRecord && (
                <div className="mb-4 py-2 px-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-full inline-block">
                  <span className="text-yellow-400 font-bold">🎉 NEW HIGH SCORE!</span>
                </div>
              )}

              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                {lastGameStats.isNewRecord ? "Amazing Run!" : "Game Over!"}
              </h2>

              <div className="my-8 grid grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-white/50 text-xs mb-1">SCORE</div>
                  <div className="text-2xl md:text-3xl font-bold text-orange-400">
                    {lastGameStats.score.toLocaleString()}
                  </div>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-white/50 text-xs mb-1">TIME</div>
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {Math.floor(lastGameStats.duration)}s
                  </div>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-white/50 text-xs mb-1">AVOIDED</div>
                  <div className="text-2xl md:text-3xl font-bold text-green-400">
                    {lastGameStats.obstaclesAvoided}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStartGame}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/30"
                >
                  Try Again
                </button>
                <button
                  onClick={handleReturnToMenu}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium rounded-xl transition-all"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Playing state
  if (gameState === "playing") {
    return (
      <div className="h-screen w-screen bg-slate-900 overflow-hidden">
        <GameCanvas
          onGameOver={handleGameOver}
          score={score}
          setScore={setScore}
          gameId={gameId}
        />
      </div>
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <span className="text-xl">🍥</span>
          </div>
          <div>
            <p className="text-white font-bold">{currentPlayer?.name || "Ninja"}</p>
            <p className="text-white/50 text-xs">High Score: {currentPlayer?.highScore?.toLocaleString() || 0}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-white/60 hover:text-white/90 text-sm transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 py-6 relative z-10">
        {/* Left - Game Info */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 mb-3 tracking-tight">
              NARUTO RUNNER
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-md mx-auto">
              Help Naruto reach Ichiraku Ramen Shop while avoiding his friends who want to give him missions!
            </p>
          </div>

          {/* Obstacles Preview */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8 max-w-lg">
            {[
              { emoji: "⚔️", name: "Sasuke", color: "from-blue-500/20 to-indigo-500/20" },
              { emoji: "🌸", name: "Sakura", color: "from-pink-500/20 to-rose-500/20" },
              { emoji: "💜", name: "Hinata", color: "from-purple-500/20 to-violet-500/20" },
              { emoji: "📖", name: "Kakashi", color: "from-slate-500/20 to-gray-500/20" },
              { emoji: "📜", name: "Mission", color: "from-amber-500/20 to-yellow-500/20" },
              { emoji: "🗡️", name: "Kunai", color: "from-slate-500/20 to-zinc-500/20" },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${item.color} rounded-xl p-3 text-center border border-white/5`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-white/60 text-xs">{item.name}</div>
              </div>
            ))}
          </div>

          {/* Play Button */}
          <button
            onClick={handleStartGame}
            className="group relative px-12 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xl rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60"
          >
            <span className="relative z-10">START GAME</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          {/* Controls */}
          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm mb-2">Controls</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-lg text-white/60 text-sm">← → Move</span>
              <span className="px-3 py-1 bg-white/5 rounded-lg text-white/60 text-sm">SPACE Jump</span>
              <span className="px-3 py-1 bg-white/5 rounded-lg text-white/60 text-sm md:hidden">Swipe to play</span>
            </div>
          </div>
        </div>

        {/* Right - Leaderboard */}
        <div className="lg:w-80 xl:w-96">
          <Leaderboard />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 py-4 text-center">
      <p className="text-white/30 text-xs">
        Requested by{" "}
        <a
          href="https://twitter.com/HakuramaSam"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/40 hover:text-white/60 transition-colors"
        >
          @HakuramaSam
        </a>{" "}
        · Built by{" "}
        <a
          href="https://twitter.com/clonkbot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/40 hover:text-white/60 transition-colors"
        >
          @clonkbot
        </a>
      </p>
    </footer>
  );
}

export default App;
