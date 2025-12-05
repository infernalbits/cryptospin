import { type User, type InsertUser, type SymbolType, type SpinResult, type RecentWin, type PoolStats, SYMBOLS } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBalance(walletAddress: string): Promise<number>;
  updateBalance(walletAddress: string, amount: number): Promise<number>;
  
  spin(walletAddress: string, betAmount: number): Promise<SpinResult>;
  
  getRecentWins(): Promise<RecentWin[]>;
  addRecentWin(win: RecentWin): Promise<void>;
  
  getPoolStats(): Promise<PoolStats>;
}

const generateRandomSymbol = (): SymbolType => {
  const weights: Record<SymbolType, number> = {
    cherry: 25,
    coin: 22,
    clover: 20,
    lightning: 12,
    fire: 10,
    star: 6,
    seven: 3,
    crown: 1.5,
    diamond: 0.5,
  };
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const [symbol, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return symbol as SymbolType;
    }
  }
  
  return 'cherry';
};

const generateReels = (): [SymbolType, SymbolType, SymbolType][] => {
  return [
    [generateRandomSymbol(), generateRandomSymbol(), generateRandomSymbol()],
    [generateRandomSymbol(), generateRandomSymbol(), generateRandomSymbol()],
    [generateRandomSymbol(), generateRandomSymbol(), generateRandomSymbol()],
  ];
};

const checkWinningLines = (reels: [SymbolType, SymbolType, SymbolType][]): number[] => {
  const winningLines: number[] = [];
  
  for (let row = 0; row < 3; row++) {
    if (reels[0][row] === reels[1][row] && reels[1][row] === reels[2][row]) {
      winningLines.push(row);
    }
  }
  
  if (reels[0][0] === reels[1][1] && reels[1][1] === reels[2][2]) {
    winningLines.push(3);
  }
  
  if (reels[0][2] === reels[1][1] && reels[1][1] === reels[2][0]) {
    winningLines.push(4);
  }
  
  return winningLines;
};

const calculateWinAmount = (
  reels: [SymbolType, SymbolType, SymbolType][],
  winningLines: number[],
  betAmount: number
): { amount: number; isJackpot: boolean; multiplier: number } => {
  if (winningLines.length === 0) {
    return { amount: 0, isJackpot: false, multiplier: 0 };
  }
  
  let totalMultiplier = 0;
  let isJackpot = false;
  
  for (const lineIndex of winningLines) {
    let symbol: SymbolType;
    
    if (lineIndex < 3) {
      symbol = reels[0][lineIndex];
    } else {
      symbol = reels[1][1];
    }
    
    const symbolData = SYMBOLS.find(s => s.id === symbol);
    if (symbolData) {
      totalMultiplier += symbolData.multiplier;
      if (symbolData.rarity === 'jackpot') {
        isJackpot = true;
      }
    }
  }
  
  const amount = betAmount * totalMultiplier;
  
  return { amount, isJackpot, multiplier: totalMultiplier };
};

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private balances: Map<string, number>;
  private recentWins: RecentWin[];
  private poolStats: PoolStats;

  constructor() {
    this.users = new Map();
    this.balances = new Map();
    this.recentWins = [
      { id: '1', address: '0x1a2b...3c4d', amount: 2.5, symbol: 'diamond', timestamp: Date.now() - 60000 },
      { id: '2', address: '0x5e6f...7g8h', amount: 0.85, symbol: 'crown', timestamp: Date.now() - 120000 },
      { id: '3', address: '0x9i0j...1k2l', amount: 0.42, symbol: 'seven', timestamp: Date.now() - 180000 },
      { id: '4', address: '0x3m4n...5o6p', amount: 1.2, symbol: 'star', timestamp: Date.now() - 240000 },
      { id: '5', address: '0x7q8r...9s0t', amount: 0.15, symbol: 'lightning', timestamp: Date.now() - 300000 },
    ];
    this.poolStats = {
      totalLiquidity: 1250.45,
      userShare: 0.05,
      volume24h: 342.18,
      apy: 12.5,
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBalance(walletAddress: string): Promise<number> {
    if (!this.balances.has(walletAddress)) {
      this.balances.set(walletAddress, 1.5);
    }
    return this.balances.get(walletAddress) || 0;
  }

  async updateBalance(walletAddress: string, amount: number): Promise<number> {
    const currentBalance = await this.getBalance(walletAddress);
    const newBalance = currentBalance + amount;
    this.balances.set(walletAddress, newBalance);
    return newBalance;
  }

  async spin(walletAddress: string, betAmount: number): Promise<SpinResult> {
    const balance = await this.getBalance(walletAddress);
    
    if (balance < betAmount) {
      throw new Error('Insufficient balance');
    }
    
    await this.updateBalance(walletAddress, -betAmount);
    
    const reels = generateReels();
    const winningLines = checkWinningLines(reels);
    const { amount, isJackpot, multiplier } = calculateWinAmount(reels, winningLines, betAmount);
    
    if (amount > 0) {
      await this.updateBalance(walletAddress, amount);
      
      const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
      const winSymbol = winningLines.length > 0 
        ? (winningLines[0] < 3 ? reels[0][winningLines[0]] : reels[1][1])
        : 'star';
      
      await this.addRecentWin({
        id: randomUUID(),
        address: shortAddress,
        amount,
        symbol: winSymbol,
        timestamp: Date.now(),
      });
    }
    
    this.poolStats.volume24h += betAmount;
    
    return {
      reels,
      winAmount: amount,
      winningLines,
      isJackpot,
      multiplier,
    };
  }

  async getRecentWins(): Promise<RecentWin[]> {
    return this.recentWins.slice(0, 10);
  }

  async addRecentWin(win: RecentWin): Promise<void> {
    this.recentWins.unshift(win);
    if (this.recentWins.length > 20) {
      this.recentWins = this.recentWins.slice(0, 20);
    }
  }

  async getPoolStats(): Promise<PoolStats> {
    return this.poolStats;
  }
}

export const storage = new MemStorage();
