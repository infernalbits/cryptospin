import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type SymbolType = 
  | 'diamond'
  | 'crown'
  | 'seven'
  | 'star'
  | 'clover'
  | 'lightning'
  | 'fire'
  | 'coin'
  | 'cherry';

export type SymbolRarity = 'common' | 'rare' | 'jackpot';

export interface SlotSymbol {
  id: SymbolType;
  name: string;
  rarity: SymbolRarity;
  multiplier: number;
  color: string;
}

export const SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', name: 'Cherry', rarity: 'common', multiplier: 2, color: '#dc2626' },
  { id: 'coin', name: 'Coin', rarity: 'common', multiplier: 3, color: '#fbbf24' },
  { id: 'clover', name: 'Lucky Clover', rarity: 'common', multiplier: 4, color: '#22c55e' },
  { id: 'lightning', name: 'Lightning', rarity: 'rare', multiplier: 8, color: '#3b82f6' },
  { id: 'fire', name: 'Fire', rarity: 'rare', multiplier: 10, color: '#f97316' },
  { id: 'star', name: 'Star', rarity: 'rare', multiplier: 15, color: '#eab308' },
  { id: 'seven', name: 'Lucky 7', rarity: 'jackpot', multiplier: 25, color: '#dc2626' },
  { id: 'crown', name: 'Crown', rarity: 'jackpot', multiplier: 50, color: '#a855f7' },
  { id: 'diamond', name: 'Diamond', rarity: 'jackpot', multiplier: 100, color: '#06b6d4' },
];

export interface SpinResult {
  reels: [SymbolType, SymbolType, SymbolType][];
  winAmount: number;
  winningLines: number[];
  isJackpot: boolean;
  multiplier: number;
}

export interface GameState {
  balance: number;
  betAmount: number;
  isSpinning: boolean;
  lastResult: SpinResult | null;
  comboMultiplier: number;
  consecutiveWins: number;
}

export interface PoolStats {
  totalLiquidity: number;
  userShare: number;
  volume24h: number;
  apy: number;
}

export interface RecentWin {
  id: string;
  address: string;
  amount: number;
  symbol: SymbolType;
  timestamp: number;
}

export const spinRequestSchema = z.object({
  betAmount: z.number().min(0.001).max(10),
});

export type SpinRequest = z.infer<typeof spinRequestSchema>;
