import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BetControlsProps {
  betAmount: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onSetMin: () => void;
  onSetMax: () => void;
  onDouble: () => void;
  onHalf: () => void;
  minBet: number;
  maxBet: number;
  disabled: boolean;
}

export function BetControls({
  betAmount,
  onIncrease,
  onDecrease,
  onSetMin,
  onSetMax,
  onDouble,
  onHalf,
  minBet,
  maxBet,
  disabled,
}: BetControlsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Bet Amount
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          data-testid="button-decrease-bet"
          size="icon"
          variant="secondary"
          onClick={onDecrease}
          disabled={disabled || betAmount <= minBet}
          className="rounded-full"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <motion.div
          key={betAmount}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            'min-w-[140px] md:min-w-[160px] px-4 py-3',
            'bg-card rounded-xl border-2 border-gold/30',
            'flex items-center justify-center',
            'shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
          )}
        >
          <span className="font-display font-bold text-xl md:text-2xl text-gold">
            {betAmount.toFixed(3)}
          </span>
          <span className="ml-2 text-sm text-muted-foreground font-medium">
            ETH
          </span>
        </motion.div>
        
        <Button
          data-testid="button-increase-bet"
          size="icon"
          variant="secondary"
          onClick={onIncrease}
          disabled={disabled || betAmount >= maxBet}
          className="rounded-full"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          data-testid="button-min-bet"
          variant="outline"
          size="sm"
          onClick={onSetMin}
          disabled={disabled || betAmount <= minBet}
          className="text-xs font-medium"
        >
          MIN
        </Button>
        <Button
          data-testid="button-half-bet"
          variant="outline"
          size="sm"
          onClick={onHalf}
          disabled={disabled || betAmount <= minBet}
          className="text-xs font-medium"
        >
          1/2
        </Button>
        <Button
          data-testid="button-double-bet"
          variant="outline"
          size="sm"
          onClick={onDouble}
          disabled={disabled || betAmount >= maxBet}
          className="text-xs font-medium"
        >
          x2
        </Button>
        <Button
          data-testid="button-max-bet"
          variant="outline"
          size="sm"
          onClick={onSetMax}
          disabled={disabled || betAmount >= maxBet}
          className="text-xs font-medium"
        >
          MAX
        </Button>
      </div>
    </div>
  );
}
