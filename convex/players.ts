import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrCreatePlayer = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("players", {
      name: args.name,
      userId,
      highScore: 0,
      totalGames: 0,
      lastPlayedAt: Date.now(),
    });
  },
});

export const getCurrentPlayer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updatePlayerName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    await ctx.db.patch(player._id, { name: args.name });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_high_score")
      .order("desc")
      .take(10);

    return players;
  },
});

export const updateHighScore = mutation({
  args: { score: v.number(), duration: v.number(), obstaclesAvoided: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    const newHighScore = args.score > player.highScore ? args.score : player.highScore;
    const difficulty = Math.floor(args.score / 500) + 1;

    await ctx.db.patch(player._id, {
      highScore: newHighScore,
      totalGames: player.totalGames + 1,
      lastPlayedAt: Date.now(),
    });

    await ctx.db.insert("gameHistory", {
      playerId: player._id,
      score: args.score,
      difficulty,
      duration: args.duration,
      obstaclesAvoided: args.obstaclesAvoided,
      playedAt: Date.now(),
    });

    return { newHighScore, isNewRecord: args.score > player.highScore };
  },
});
