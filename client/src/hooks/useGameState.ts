import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { GameState, SpinResult, PoolStats, RecentWin } from '@shared/schema';

const MIN_BET = 0.01;
const MAX_BET = 1.0;
const BET_INCREMENT = 0.01;
const MOCK_WALLET = '0x1234567890abcdef1234567890abcdef12345678';

interface SpinResponse {
  result: SpinResult;
  balance: number;
}

export function useGameState() {
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    balance: 0,
    betAmount: MIN_BET,
    isSpinning: false,
    lastResult: null,
    comboMultiplier: 1,
    consecutiveWins: 0,
  });

  const { data: balanceData, isLoading: balanceLoading } = useQuery<{ balance: number }>({
    queryKey: ['/api/balance', MOCK_WALLET],
    refetchInterval: false,
    staleTime: 30000,
  });

  useEffect(() => {
    if (balanceData?.balance !== undefined && !gameState.isSpinning) {
      setGameState(prev => ({
        ...prev,
        balance: balanceData.balance,
      }));
    }
  }, [balanceData?.balance, gameState.isSpinning]);

  const spinMutation = useMutation({
    mutationFn: async (betAmount: number) => {
      const response = await apiRequest('POST', '/api/spin', {
        walletAddress: MOCK_WALLET,
        betAmount,
      });
      return response as SpinResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/balance', MOCK_WALLET] });
      queryClient.invalidateQueries({ queryKey: ['/api/recent-wins'] });
    },
  });

  const spin = useCallback(async (): Promise<SpinResult | null> => {
    if (gameState.isSpinning || gameState.balance < gameState.betAmount) {
      return null;
    }

    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      balance: prev.balance - prev.betAmount,
    }));

    await new Promise(resolve => setTimeout(resolve, 2400));

    try {
      const response = await spinMutation.mutateAsync(gameState.betAmount);
      const result = response.result;
      
      setGameState(prev => {
        const won = result.winAmount > 0;
        const newConsecutiveWins = won ? prev.consecutiveWins + 1 : 0;
        const newComboMultiplier = won 
          ? Math.min(1 + (newConsecutiveWins * 0.1), 2.0)
          : 1;

        return {
          ...prev,
          isSpinning: false,
          balance: response.balance,
          lastResult: result,
          consecutiveWins: newConsecutiveWins,
          comboMultiplier: newComboMultiplier,
        };
      });

      return result;
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        isSpinning: false,
        balance: prev.balance + prev.betAmount,
      }));
      return null;
    }
  }, [gameState.isSpinning, gameState.balance, gameState.betAmount, spinMutation]);

  const setBetAmount = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      betAmount: Math.max(MIN_BET, Math.min(MAX_BET, amount)),
    }));
  }, []);

  const increaseBet = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      betAmount: Math.min(MAX_BET, parseFloat((prev.betAmount + BET_INCREMENT).toFixed(3))),
    }));
  }, []);

  const decreaseBet = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      betAmount: Math.max(MIN_BET, parseFloat((prev.betAmount - BET_INCREMENT).toFixed(3))),
    }));
  }, []);

  const setMinBet = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      betAmount: MIN_BET,
    }));
  }, []);

  const setMaxBet = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      betAmount: Math.min(MAX_BET, prev.balance),
    }));
  }, []);

  const doubleBet = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      betAmount: Math.min(MAX_BET, parseFloat((prev.betAmount * 2).toFixed(3))),
    }));
  }, []);

  const halfBet = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      betAmount: Math.max(MIN_BET, parseFloat((prev.betAmount / 2).toFixed(3))),
    }));
  }, []);

  const clearLastResult = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      lastResult: null,
    }));
  }, []);

  return {
    gameState,
    spin,
    setBetAmount,
    increaseBet,
    decreaseBet,
    setMinBet,
    setMaxBet,
    doubleBet,
    halfBet,
    clearLastResult,
    canSpin: !gameState.isSpinning && gameState.balance >= gameState.betAmount && !balanceLoading,
    minBet: MIN_BET,
    maxBet: MAX_BET,
    isLoading: spinMutation.isPending,
    balanceLoading,
  };
}

export function usePoolStats() {
  return useQuery<PoolStats>({
    queryKey: ['/api/pool-stats'],
    refetchInterval: 30000,
  });
}

export function useRecentWins() {
  return useQuery<{ wins: RecentWin[] }>({
    queryKey: ['/api/recent-wins'],
    refetchInterval: 10000,
  });
}
