import { motion } from 'framer-motion';
import { 
  Diamond, 
  Crown, 
  Flame, 
  Zap, 
  Star, 
  Coins
} from 'lucide-react';
import type { SymbolType, SlotSymbol as SlotSymbolType } from '@shared/schema';
import { SYMBOLS } from '@shared/schema';
import { cn } from '@/lib/utils';

interface SlotSymbolProps {
  symbol: SymbolType;
  isWinning?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isSpinning?: boolean;
}

function CherryIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M12 2C10.5 2 9.2 2.6 8.3 3.6C7.9 2.7 7 2 6 2C4.3 2 3 3.3 3 5C3 6.7 4.3 8 6 8C6.4 8 6.7 7.9 7 7.8V8C7 11.9 10.1 15 14 15C17.9 15 21 11.9 21 8C21 4.1 17.9 1 14 1C13.2 1 12.4 1.2 11.7 1.4C11.9 1.6 12 1.8 12 2ZM6 6C5.4 6 5 5.6 5 5C5 4.4 5.4 4 6 4C6.6 4 7 4.4 7 5C7 5.6 6.6 6 6 6ZM14 13C11.2 13 9 10.8 9 8C9 5.2 11.2 3 14 3C16.8 3 19 5.2 19 8C19 10.8 16.8 13 14 13Z"/>
      <circle cx="14" cy="8" r="4" />
      <circle cx="8" cy="18" r="4" />
      <path d="M8 14C8 14 10 12 12 10" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function CloverIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M12 2C9.8 2 8 3.8 8 6C8 7.1 8.4 8.1 9.1 8.8C8.4 9.5 8 10.5 8 11.5C8 13.4 9.3 15 11 15.7V20C11 21.1 11.9 22 13 22H13C14.1 22 15 21.1 15 20V15.7C16.7 15 18 13.4 18 11.5C18 10.5 17.6 9.5 16.9 8.8C17.6 8.1 18 7.1 18 6C18 3.8 16.2 2 14 2H12Z"/>
      <circle cx="6" cy="10" r="4" />
      <circle cx="18" cy="10" r="4" />
      <circle cx="12" cy="6" r="4" />
    </svg>
  );
}

const symbolIcons: Record<SymbolType, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  diamond: Diamond,
  crown: Crown,
  seven: ({ className, style }) => (
    <span className={cn("font-display font-black leading-none", className)} style={style}>7</span>
  ),
  star: Star,
  clover: CloverIcon,
  lightning: Zap,
  fire: Flame,
  coin: Coins,
  cherry: CherryIcon,
};

const sizeClasses = {
  sm: 'w-12 h-12 md:w-14 md:h-14',
  md: 'w-16 h-16 md:w-20 md:h-20',
  lg: 'w-20 h-20 md:w-24 md:h-24',
};

const iconSizes = {
  sm: 'w-6 h-6 md:w-7 md:h-7',
  md: 'w-10 h-10 md:w-12 md:h-12',
  lg: 'w-12 h-12 md:w-14 md:h-14',
};

export function SlotSymbolIcon({ symbol, isWinning = false, size = 'md', isSpinning = false }: SlotSymbolProps) {
  const symbolData = SYMBOLS.find(s => s.id === symbol) as SlotSymbolType;
  const Icon = symbolIcons[symbol];
  
  const rarityStyles = {
    common: 'bg-secondary/50',
    rare: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
    jackpot: 'bg-gradient-to-br from-gold/20 to-amber-600/20',
  };

  const rarityGlow = {
    common: '',
    rare: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    jackpot: 'shadow-[0_0_25px_rgba(255,215,0,0.5)]',
  };

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center rounded-xl',
        'border-2 transition-all duration-300',
        sizeClasses[size],
        rarityStyles[symbolData.rarity],
        isWinning && 'animate-symbol-highlight',
        isWinning && rarityGlow[symbolData.rarity],
        isSpinning && 'blur-[2px]',
        symbolData.rarity === 'jackpot' && !isSpinning && 'border-gold/50',
        symbolData.rarity === 'rare' && !isSpinning && 'border-accent/50',
        symbolData.rarity === 'common' && 'border-border'
      )}
      animate={isWinning ? {
        scale: [1, 1.1, 1],
        rotate: [0, -5, 5, 0],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: isWinning ? Infinity : 0,
        repeatType: 'loop',
      }}
    >
      {symbolData.rarity === 'jackpot' && !isSpinning && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-shimmer-gradient bg-[length:200%_100%]"
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      {symbolData.rarity !== 'common' && !isSpinning && (
        <motion.div
          className="absolute -inset-1 rounded-xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${symbolData.color}40 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      <div className="relative z-10">
        {symbol === 'seven' ? (
          <span 
            className="font-display font-black leading-none"
            style={{ 
              color: symbolData.color,
              fontSize: size === 'sm' ? '1.5rem' : size === 'md' ? '2.5rem' : '3rem',
              textShadow: `0 0 10px ${symbolData.color}80`,
            }}
          >
            7
          </span>
        ) : (
          <Icon 
            className={cn(iconSizes[size])}
            style={{ 
              color: symbolData.color,
              filter: `drop-shadow(0 0 8px ${symbolData.color}60)`,
            }}
          />
        )}
      </div>
      
      {isWinning && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: symbolData.color }}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 1, 
                scale: 0 
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 60],
                y: [0, (Math.random() - 0.5) * 60],
                opacity: [1, 0],
                scale: [0, 1],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

export function SlotSymbolPlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div 
      className={cn(
        'rounded-xl bg-reel/50 border-2 border-border/30 animate-pulse',
        sizeClasses[size]
      )} 
    />
  );
}
