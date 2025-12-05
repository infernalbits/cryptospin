import { motion } from 'framer-motion';
import { TrendingUp, Droplets, Percent, Users, Loader2 } from 'lucide-react';
import type { PoolStats as PoolStatsType } from '@shared/schema';
import { usePoolStats } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

function StatCard({ icon: Icon, label, value, subValue, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'flex flex-col gap-1 p-3',
        'bg-card/50 rounded-lg border border-border/50',
        'backdrop-blur-sm'
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display font-bold text-lg text-foreground">
          {value}
        </span>
        {subValue && (
          <span className={cn(
            'text-xs font-medium',
            trend === 'up' && 'text-win',
            trend === 'down' && 'text-destructive',
            trend === 'neutral' && 'text-muted-foreground'
          )}>
            {subValue}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function PoolStats() {
  const { data: stats, isLoading } = usePoolStats();
  
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4 bg-card/30 rounded-xl border border-border/50">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-card/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4 bg-card/30 rounded-xl border border-border/50">
      <StatCard
        icon={Droplets}
        label="Pool Size"
        value={`${stats.totalLiquidity.toLocaleString()} ETH`}
        delay={0}
      />
      <StatCard
        icon={Users}
        label="Your Share"
        value={`${(stats.userShare * 100).toFixed(2)}%`}
        subValue={`${(stats.totalLiquidity * stats.userShare).toFixed(2)} ETH`}
        delay={0.1}
      />
      <StatCard
        icon={TrendingUp}
        label="24h Volume"
        value={`${stats.volume24h.toLocaleString()} ETH`}
        subValue="+15.2%"
        trend="up"
        delay={0.2}
      />
      <StatCard
        icon={Percent}
        label="APY"
        value={`${stats.apy.toFixed(1)}%`}
        subValue="+2.1%"
        trend="up"
        delay={0.3}
      />
    </div>
  );
}
