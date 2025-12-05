import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinButtonProps {
  onClick: () => void;
  isSpinning: boolean;
  disabled: boolean;
  insufficientFunds: boolean;
}

export function SpinButton({ onClick, isSpinning, disabled, insufficientFunds }: SpinButtonProps) {
  return (
    <motion.button
      data-testid="button-spin"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-32 h-32 md:w-40 md:h-40 rounded-full',
        'font-display font-black text-2xl md:text-3xl tracking-wider',
        'transition-all duration-300 select-none',
        'focus:outline-none focus:ring-4 focus:ring-gold/50',
        !disabled && !isSpinning && 'cursor-pointer',
        disabled && 'cursor-not-allowed opacity-60',
        insufficientFunds && !isSpinning && 'animate-shake'
      )}
      animate={!disabled && !isSpinning ? {
        scale: [1, 1.03, 1],
        boxShadow: [
          '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1)',
          '0 0 40px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.2)',
          '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1)',
        ],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={!disabled ? { scale: 1.08 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      style={{
        background: disabled 
          ? 'linear-gradient(145deg, hsl(220, 20%, 25%), hsl(220, 20%, 18%))'
          : 'linear-gradient(145deg, hsl(45, 100%, 55%), hsl(35, 100%, 45%))',
        boxShadow: disabled
          ? 'none'
          : '0 0 30px rgba(255, 215, 0, 0.4), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
      }}
    >
      <div 
        className="absolute inset-1 rounded-full flex items-center justify-center"
        style={{
          background: disabled
            ? 'linear-gradient(145deg, hsl(220, 20%, 22%), hsl(220, 20%, 15%))'
            : 'linear-gradient(145deg, hsl(40, 100%, 50%), hsl(35, 100%, 42%))',
        }}
      >
        {!disabled && !isSpinning && (
          <motion.div
            className="absolute inset-0 rounded-full bg-shimmer-gradient bg-[length:200%_100%] opacity-30"
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
        
        <span 
          className={cn(
            'relative z-10',
            disabled ? 'text-muted-foreground' : 'text-primary-foreground'
          )}
          style={{
            textShadow: disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {isSpinning ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-10 h-10 md:w-12 md:h-12" />
            </motion.div>
          ) : insufficientFunds ? (
            <span className="text-lg md:text-xl">LOW<br/>FUNDS</span>
          ) : (
            'SPIN'
          )}
        </span>
      </div>
      
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
        }}
      />
      
      {!disabled && !isSpinning && (
        <motion.div
          className="absolute -inset-2 rounded-full border-2 border-gold/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.button>
  );
}
