import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlotSymbolIcon } from './SlotSymbol';
import type { SymbolType, SpinResult } from '@shared/schema';
import { SYMBOLS } from '@shared/schema';
import { cn } from '@/lib/utils';

interface SlotMachineProps {
  isSpinning: boolean;
  result: SpinResult | null;
  onSpinComplete?: () => void;
}

const ALL_SYMBOLS: SymbolType[] = SYMBOLS.map(s => s.id);

const getRandomSymbol = (): SymbolType => {
  return ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
};

const generateSpinningSymbols = (count: number): SymbolType[] => {
  return Array.from({ length: count }, () => getRandomSymbol());
};

interface ReelProps {
  index: number;
  isSpinning: boolean;
  finalSymbols: SymbolType[];
  winningRows: number[];
  reelIndex: number;
}

function Reel({ index, isSpinning, finalSymbols, winningRows, reelIndex }: ReelProps) {
  const [displaySymbols, setDisplaySymbols] = useState<SymbolType[]>(
    generateSpinningSymbols(3)
  );
  const [isReelSpinning, setIsReelSpinning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinCountRef = useRef(0);

  useEffect(() => {
    if (isSpinning) {
      setIsReelSpinning(true);
      spinCountRef.current = 0;
      
      const spinDelay = reelIndex * 200;
      
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setDisplaySymbols(generateSpinningSymbols(3));
          spinCountRef.current++;
        }, 80);
      }, spinDelay);
      
      const stopDelay = 800 + (reelIndex * 400);
      
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setDisplaySymbols(finalSymbols);
        setIsReelSpinning(false);
      }, stopDelay + spinDelay);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSpinning, finalSymbols, reelIndex]);

  return (
    <div 
      className={cn(
        'relative flex flex-col items-center gap-2 p-2 md:p-3',
        'bg-reel rounded-2xl border-2 border-reel-border',
        'overflow-hidden'
      )}
    >
      <div className="absolute inset-0 bg-reel-gradient pointer-events-none z-10" />
      
      <AnimatePresence mode="popLayout">
        {displaySymbols.map((symbol, rowIndex) => (
          <motion.div
            key={`${reelIndex}-${rowIndex}-${isReelSpinning ? spinCountRef.current : 'final'}`}
            initial={isReelSpinning ? { y: -20, opacity: 0.5 } : { scale: 0.8, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              scale: 1,
            }}
            exit={isReelSpinning ? { y: 20, opacity: 0.5 } : {}}
            transition={{
              duration: isReelSpinning ? 0.08 : 0.3,
              ease: isReelSpinning ? 'linear' : [0.34, 1.56, 0.64, 1],
              delay: isReelSpinning ? 0 : rowIndex * 0.05,
            }}
          >
            <SlotSymbolIcon
              symbol={symbol}
              isWinning={!isSpinning && winningRows.some(line => {
                if (line < 3) return line === rowIndex;
                if (line === 3) return reelIndex === rowIndex;
                if (line === 4) return reelIndex === (2 - rowIndex);
                return false;
              })}
              size="md"
              isSpinning={isReelSpinning}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {isReelSpinning && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
          animate={{
            y: ['0%', '100%'],
          }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  );
}

export function SlotMachine({ isSpinning, result, onSpinComplete }: SlotMachineProps) {
  const [reels, setReels] = useState<[SymbolType, SymbolType, SymbolType][]>([
    ['cherry', 'coin', 'clover'],
    ['star', 'cherry', 'lightning'],
    ['coin', 'fire', 'star'],
  ]);

  useEffect(() => {
    if (result && !isSpinning) {
      setReels(result.reels);
    }
  }, [result, isSpinning]);

  const winningRows = result?.winningLines || [];

  return (
    <div className="relative">
      <motion.div
        className={cn(
          'relative bg-card rounded-3xl p-4 md:p-6',
          'border-4 border-reel-border',
          'shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_0_30px_rgba(0,0,0,0.3)]'
        )}
        animate={result?.isJackpot && !isSpinning ? {
          boxShadow: [
            '0 0 60px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
            '0 0 80px rgba(255,215,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
            '0 0 60px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
          ],
        } : {}}
        transition={{ duration: 0.5, repeat: result?.isJackpot ? 3 : 0 }}
      >
        <div 
          className="absolute -inset-[2px] rounded-3xl opacity-50"
          style={{
            background: 'linear-gradient(135deg, hsl(45, 80%, 40%) 0%, hsl(35, 60%, 30%) 50%, hsl(45, 80%, 40%) 100%)',
            zIndex: -1,
          }}
        />
        
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     px-6 py-2 rounded-full
                     bg-gradient-to-r from-gold via-amber-400 to-gold
                     border-2 border-amber-600
                     shadow-[0_0_20px_rgba(255,215,0,0.5)]"
        >
          <span className="font-display font-bold text-sm md:text-base text-primary-foreground tracking-wider">
            CRYPTOSPIN
          </span>
        </div>
        
        <div className="flex items-center justify-center gap-2 md:gap-4 mt-4">
          {[0, 1, 2].map((reelIndex) => (
            <Reel
              key={reelIndex}
              index={reelIndex}
              reelIndex={reelIndex}
              isSpinning={isSpinning}
              finalSymbols={reels[reelIndex] || ['cherry', 'cherry', 'cherry']}
              winningRows={winningRows}
            />
          ))}
        </div>
        
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-32 md:h-40">
          <div className="w-full h-full bg-gradient-to-b from-amber-700 via-amber-500 to-amber-700 rounded-l-lg shadow-lg" />
        </div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-32 md:h-40">
          <div className="w-full h-full bg-gradient-to-b from-amber-700 via-amber-500 to-amber-700 rounded-r-lg shadow-lg" />
        </div>
        
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                winningRows.includes(i)
                  ? 'bg-win shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                  : 'bg-muted'
              )}
            />
          ))}
          <div className="w-1" />
          {[3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                winningRows.includes(i)
                  ? 'bg-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
      </motion.div>
      
      {result && result.winAmount > 0 && !isSpinning && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.3, times: [0, 0.5, 1] }}
          style={{
            background: result.isJackpot 
              ? 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
