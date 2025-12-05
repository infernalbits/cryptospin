import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { RecentWin } from '@shared/schema';
import { SYMBOLS } from '@shared/schema';
import { useRecentWins } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';

function WinnerItem({ win }: { win: RecentWin }) {
  const symbolData = SYMBOLS.find(s => s.id === win.symbol);
  const isJackpot = symbolData?.rarity === 'jackpot';
  
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full mr-4',
        'bg-card/50 border border-border/50',
        'whitespace-nowrap',
        isJackpot && 'border-gold/30 bg-gold/10'
      )}
    >
      {isJackpot && <Trophy className="w-3 h-3 text-gold" />}
      <span className="font-mono text-xs text-muted-foreground">
        {win.address}
      </span>
      <span 
        className={cn(
          'font-display font-bold text-xs',
          isJackpot ? 'text-gold' : 'text-win'
        )}
      >
        +{win.amount.toFixed(2)} ETH
      </span>
    </div>
  );
}

export function RecentWinners() {
  const { data } = useRecentWins();
  const winners = data?.wins || [];
  const duplicatedWinners = [...winners, ...winners];
  
  if (winners.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-card/30 border-y border-border/50 py-2">
        <div className="flex items-center justify-center gap-2 px-4">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-xs font-medium text-muted-foreground">
            Waiting for wins...
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-hidden bg-card/30 border-y border-border/50 py-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 shrink-0">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent Wins
          </span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {duplicatedWinners.map((win, index) => (
              <WinnerItem key={`${win.id}-${index}`} win={win} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
