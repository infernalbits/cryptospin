import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceDisplayProps {
  balance: number;
  comboMultiplier: number;
  consecutiveWins: number;
}

export function BalanceDisplay({ balance, comboMultiplier, consecutiveWins }: BalanceDisplayProps) {
  const [prevBalance, setPrevBalance] = useState(balance);
  const [balanceChange, setBalanceChange] = useState<number | null>(null);
  const [displayBalance, setDisplayBalance] = useState(balance);

  useEffect(() => {
    if (balance !== prevBalance) {
      const change = balance - prevBalance;
      setBalanceChange(change);
      
      const startValue = displayBalance;
      const endValue = balance;
      const duration = 500;
      const startTime = Date.now();
      
      const animateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        setDisplayBalance(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };
      
      requestAnimationFrame(animateValue);
      setPrevBalance(balance);
      
      setTimeout(() => {
        setBalanceChange(null);
      }, 2000);
    }
  }, [balance, prevBalance, displayBalance]);

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Balance
      </div>
      
      <div className="relative">
        <motion.div
          className={cn(
            'font-display font-bold text-3xl md:text-4xl',
            'text-foreground'
          )}
          animate={balanceChange ? {
            scale: [1, 1.05, 1],
            color: balanceChange > 0 
              ? ['hsl(var(--foreground))', 'hsl(var(--win))', 'hsl(var(--foreground))']
              : ['hsl(var(--foreground))', 'hsl(var(--destructive))', 'hsl(var(--foreground))'],
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {displayBalance.toFixed(4)}
          <span className="text-lg md:text-xl text-muted-foreground ml-2">ETH</span>
        </motion.div>
        
        <AnimatePresence>
          {balanceChange !== null && balanceChange !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: 0 }}
              animate={{ opacity: 1, y: -20, x: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className={cn(
                'absolute -right-2 top-0 flex items-center gap-1',
                'font-display font-bold text-sm',
                balanceChange > 0 ? 'text-win' : 'text-destructive'
              )}
            >
              {balanceChange > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {balanceChange > 0 ? '+' : ''}{balanceChange.toFixed(4)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {consecutiveWins > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gold/20 rounded-full border border-gold/30">
              <span className="text-xs font-medium text-gold">
                {consecutiveWins}x Streak
              </span>
            </div>
            {comboMultiplier > 1 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded-full border border-accent/30">
                <span className="text-xs font-medium text-accent">
                  {comboMultiplier.toFixed(1)}x Multiplier
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
