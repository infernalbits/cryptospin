import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlotSymbolIcon } from './SlotSymbol';
import type { SpinResult } from '@shared/schema';
import { cn } from '@/lib/utils';

interface WinCelebrationProps {
  result: SpinResult | null;
  isVisible: boolean;
  onClaim: () => void;
}

function CoinParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute top-0 left-1/2"
      initial={{ y: -100, x: x, opacity: 1, rotate: 0 }}
      animate={{ 
        y: window.innerHeight + 100, 
        opacity: [1, 1, 0],
        rotate: 720,
      }}
      transition={{ 
        duration: 2 + Math.random(), 
        delay,
        ease: 'easeIn',
      }}
    >
      <Coins className="w-6 h-6 text-gold" />
    </motion.div>
  );
}

function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{ 
        duration: 1,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    >
      <Sparkles className="w-4 h-4 text-gold" />
    </motion.div>
  );
}

export function WinCelebration({ result, isVisible, onClaim }: WinCelebrationProps) {
  const [displayAmount, setDisplayAmount] = useState(0);
  
  useEffect(() => {
    if (isVisible && result && result.winAmount > 0) {
      const targetAmount = result.winAmount;
      const duration = 1000;
      const steps = 30;
      const stepDuration = duration / steps;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setDisplayAmount(targetAmount * easeOut);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayAmount(targetAmount);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setDisplayAmount(0);
    }
  }, [isVisible, result]);

  if (!result || result.winAmount === 0) return null;

  const isJackpot = result.isJackpot;
  const celebrationDuration = isJackpot ? 8 : 4;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          
          {isJackpot && (
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          
          {[...Array(20)].map((_, i) => (
            <CoinParticle 
              key={i} 
              delay={i * 0.1} 
              x={(Math.random() - 0.5) * window.innerWidth * 0.8}
            />
          ))}
          
          {[...Array(15)].map((_, i) => (
            <Sparkle
              key={i}
              delay={i * 0.2}
              x={Math.random() * 100}
              y={Math.random() * 100}
            />
          ))}
          
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 p-8"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            {isJackpot && (
              <motion.div
                className="flex items-center gap-2"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Trophy className="w-12 h-12 text-gold" />
                <span className="font-display font-black text-4xl md:text-5xl bg-jackpot-gradient bg-clip-text text-transparent">
                  JACKPOT!
                </span>
                <Trophy className="w-12 h-12 text-gold" />
              </motion.div>
            )}
            
            {!isJackpot && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-display font-bold text-2xl md:text-3xl text-win"
              >
                YOU WIN!
              </motion.div>
            )}
            
            <motion.div
              className={cn(
                'font-display font-black text-6xl md:text-8xl',
                isJackpot ? 'text-gold' : 'text-win'
              )}
              animate={isJackpot ? {
                textShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                  '0 0 40px rgba(255, 215, 0, 0.8)',
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                ],
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              +{displayAmount.toFixed(4)}
              <span className="text-2xl md:text-4xl ml-2 text-muted-foreground">ETH</span>
            </motion.div>
            
            {result.multiplier > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="px-4 py-2 bg-accent/30 rounded-full border border-accent/50"
              >
                <span className="font-display font-bold text-lg text-accent">
                  {result.multiplier.toFixed(1)}x Multiplier
                </span>
              </motion.div>
            )}
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                data-testid="button-claim-win"
                onClick={onClaim}
                size="lg"
                className={cn(
                  'font-display font-bold text-lg px-8',
                  isJackpot 
                    ? 'bg-gold-gradient hover:opacity-90' 
                    : 'bg-win hover:bg-win/90',
                  'text-primary-foreground'
                )}
              >
                CLAIM
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
