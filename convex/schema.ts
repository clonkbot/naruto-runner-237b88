import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  players: defineTable({
    name: v.string(),
    userId: v.id("users"),
    highScore: v.number(),
    totalGames: v.number(),
    lastPlayedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_high_score", ["highScore"]),
  gameHistory: defineTable({
    playerId: v.id("players"),
    score: v.number(),
    difficulty: v.number(),
    duration: v.number(),
    obstaclesAvoided: v.number(),
    playedAt: v.number(),
  })
    .index("by_player", ["playerId"])
    .index("by_score", ["score"]),
  liveGames: defineTable({
    playerId: v.id("players"),
    playerName: v.string(),
    currentScore: v.number(),
    isActive: v.boolean(),
    startedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_player", ["playerId"]),
});
