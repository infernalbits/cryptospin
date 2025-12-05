import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlotMachine } from '@/components/slot/SlotMachine';
import { SpinButton } from '@/components/slot/SpinButton';
import { BetControls } from '@/components/slot/BetControls';
import { BalanceDisplay } from '@/components/slot/BalanceDisplay';
import { WalletConnection, NetworkIndicator } from '@/components/slot/WalletConnection';
import { WinCelebration } from '@/components/slot/WinCelebration';
import { ParticleBackground } from '@/components/slot/ParticleBackground';
import { RecentWinners } from '@/components/slot/RecentWinners';
import { PoolStats } from '@/components/slot/PoolStats';
import { useGameState } from '@/hooks/useGameState';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Game() {
  const {
    gameState,
    spin,
    increaseBet,
    decreaseBet,
    setMinBet,
    setMaxBet,
    doubleBet,
    halfBet,
    clearLastResult,
    canSpin,
    minBet,
    maxBet,
  } = useGameState();

  const [showWinCelebration, setShowWinCelebration] = useState(false);

  useEffect(() => {
    if (gameState.lastResult && gameState.lastResult.winAmount > 0 && !gameState.isSpinning) {
      const timer = setTimeout(() => {
        setShowWinCelebration(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastResult, gameState.isSpinning]);

  const handleSpin = async () => {
    setShowWinCelebration(false);
    await spin();
  };

  const handleClaimWin = () => {
    setShowWinCelebration(false);
    clearLastResult();
  };

  const insufficientFunds = gameState.balance < gameState.betAmount;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <ParticleBackground />
      
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%)',
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <motion.h1 
              className="font-display font-bold text-xl md:text-2xl bg-gold-gradient bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              CRYPTOSPIN
            </motion.h1>
            <NetworkIndicator />
          </div>
          
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost"
                  data-testid="button-provably-fair"
                >
                  <Shield className="w-4 h-4 text-win" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Provably Fair - Verified on Blockchain</p>
              </TooltipContent>
            </Tooltip>
            
            <Button 
              size="icon" 
              variant="ghost"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <WalletConnection />
          </div>
        </header>
        
        <RecentWinners />
        
        <main className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SlotMachine
              isSpinning={gameState.isSpinning}
              result={gameState.lastResult}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
          >
            <BalanceDisplay
              balance={gameState.balance}
              comboMultiplier={gameState.comboMultiplier}
              consecutiveWins={gameState.consecutiveWins}
            />
            
            <SpinButton
              onClick={handleSpin}
              isSpinning={gameState.isSpinning}
              disabled={!canSpin}
              insufficientFunds={insufficientFunds}
            />
            
            <BetControls
              betAmount={gameState.betAmount}
              onIncrease={increaseBet}
              onDecrease={decreaseBet}
              onSetMin={setMinBet}
              onSetMax={setMaxBet}
              onDouble={doubleBet}
              onHalf={halfBet}
              minBet={minBet}
              maxBet={maxBet}
              disabled={gameState.isSpinning}
            />
          </motion.div>
        </main>
        
        <footer className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <PoolStats />
          
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <a 
              href="#" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
              data-testid="link-how-to-play"
            >
              <Info className="w-3 h-3" />
              How to Play
            </a>
            <span>|</span>
            <a 
              href="#" 
              className="hover:text-foreground transition-colors"
              data-testid="link-terms"
            >
              Terms
            </a>
            <span>|</span>
            <a 
              href="#" 
              className="hover:text-foreground transition-colors"
              data-testid="link-privacy"
            >
              Privacy
            </a>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-win" />
              Provably Fair
            </span>
          </div>
        </footer>
      </div>
      
      <WinCelebration
        result={gameState.lastResult}
        isVisible={showWinCelebration}
        onClaim={handleClaimWin}
      />
    </div>
  );
}
