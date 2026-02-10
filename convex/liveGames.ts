import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startGame = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    // End any existing game
    const existingGame = await ctx.db
      .query("liveGames")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .first();

    if (existingGame) {
      await ctx.db.delete(existingGame._id);
    }

    return await ctx.db.insert("liveGames", {
      playerId: player._id,
      playerName: player.name,
      currentScore: 0,
      isActive: true,
      startedAt: Date.now(),
    });
  },
});

export const updateLiveScore = mutation({
  args: { gameId: v.id("liveGames"), score: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.isActive) return;

    await ctx.db.patch(args.gameId, {
      currentScore: args.score,
    });
  },
});

export const endGame = mutation({
  args: { gameId: v.id("liveGames") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;

    await ctx.db.delete(args.gameId);
  },
});

export const getLiveGames = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("liveGames")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});
