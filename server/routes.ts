import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { spinRequestSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await storage.getBalance(address);
      res.json({ balance });
    } catch (error) {
      res.status(500).json({ error: "Failed to get balance" });
    }
  });

  app.post("/api/spin", async (req, res) => {
    try {
      const { walletAddress, betAmount } = req.body;
      
      const parsed = spinRequestSchema.safeParse({ betAmount });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid bet amount" });
      }
      
      const result = await storage.spin(walletAddress || "0x1234567890abcdef", betAmount);
      const balance = await storage.getBalance(walletAddress || "0x1234567890abcdef");
      
      res.json({ 
        result,
        balance,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Insufficient balance") {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      res.status(500).json({ error: "Failed to process spin" });
    }
  });

  app.get("/api/recent-wins", async (req, res) => {
    try {
      const wins = await storage.getRecentWins();
      res.json({ wins });
    } catch (error) {
      res.status(500).json({ error: "Failed to get recent wins" });
    }
  });

  app.get("/api/pool-stats", async (req, res) => {
    try {
      const stats = await storage.getPoolStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get pool stats" });
    }
  });

  return httpServer;
}
