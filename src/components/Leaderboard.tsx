import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface LiveGame {
  _id: string;
  playerName: string;
  currentScore: number;
}

interface Player {
  _id: string;
  name: string;
  highScore: number;
  totalGames: number;
}

export function Leaderboard() {
  const leaderboard = useQuery(api.players.getLeaderboard) as Player[] | undefined;
  const liveGames = useQuery(api.liveGames.getLiveGames) as LiveGame[] | undefined;

  return (
    <div className="space-y-6">
      {/* Live Games */}
      {liveGames && liveGames.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-xl p-4 border border-red-500/30">
          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live Now
          </h3>
          <div className="space-y-2">
            {liveGames.map((game: LiveGame) => (
              <div
                key={game._id}
                className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2"
              >
                <span className="text-white/90 font-medium truncate max-w-[120px]">
                  {game.playerName}
                </span>
                <span className="text-orange-400 font-bold">
                  {game.currentScore.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All-Time Leaderboard */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-orange-500/20">
        <h3 className="text-lg font-bold text-orange-400 mb-3">🏆 Top Ninjas</h3>
        {leaderboard === undefined ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-white/50 text-center py-4">No scores yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player: Player, index: number) => (
              <div
                key={player._id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-600/30 to-amber-600/30 border border-yellow-500/30"
                    : index === 1
                    ? "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/30"
                    : index === 2
                    ? "bg-gradient-to-r from-orange-700/20 to-amber-700/20 border border-orange-600/30"
                    : "bg-black/20"
                }`}
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                    index === 0
                      ? "bg-yellow-500 text-black"
                      : index === 1
                      ? "bg-slate-400 text-black"
                      : index === 2
                      ? "bg-orange-600 text-white"
                      : "bg-slate-700 text-white/70"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{player.name}</p>
                  <p className="text-white/50 text-xs">{player.totalGames} games</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold">{player.highScore.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
