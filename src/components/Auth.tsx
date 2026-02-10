import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid email or password" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-orange-500/20 shadow-2xl shadow-orange-500/10">
        {/* Logo/Title */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-3xl">🍥</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {flow === "signIn" ? "Welcome Back, Ninja!" : "Join the Village!"}
          </h2>
          <p className="text-white/60 text-sm">
            {flow === "signIn"
              ? "Sign in to continue your journey"
              : "Create an account to save your scores"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="naruto@konoha.ninja"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <input name="flow" type="hidden" value={flow} />

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : flow === "signIn" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
          >
            {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900/80 text-white/40">or</span>
          </div>
        </div>

        <button
          onClick={handleAnonymous}
          disabled={isLoading}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue as Guest
        </button>

        <p className="mt-4 text-center text-white/40 text-xs">
          Guest scores won't be saved to the leaderboard
        </p>
      </div>
    </div>
  );
}
