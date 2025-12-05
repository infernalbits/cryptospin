import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface WalletConnectionProps {
  className?: string;
}

export function WalletConnection({ className }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const mockAddress = '0x1234...5678';
  const fullAddress = '0x1234567890abcdef1234567890abcdef12345678';

  const handleConnect = async () => {
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnected(true);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Button
        data-testid="button-connect-wallet"
        onClick={handleConnect}
        disabled={isConnecting}
        className={cn(
          'bg-gradient-to-r from-gold to-amber-500',
          'text-primary-foreground font-display font-bold',
          'hover:from-gold hover:to-amber-400',
          'transition-all duration-300',
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isConnecting ? (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Wallet className="w-4 h-4" />
              </motion.div>
              <span>Connecting...</span>
            </motion.div>
          ) : (
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-testid="button-wallet-menu"
          variant="outline"
          className={cn(
            'font-mono text-sm border-gold/30',
            'hover:border-gold/50 hover:bg-gold/10',
            className
          )}
        >
          <div className="w-2 h-2 rounded-full bg-win mr-2 animate-pulse" />
          {mockAddress}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="text-xs text-muted-foreground mb-1">Connected</div>
          <div className="font-mono text-sm truncate">{fullAddress}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleCopy}
          className="cursor-pointer"
          data-testid="button-copy-address"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-win" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          data-testid="link-view-explorer"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDisconnect}
          className="cursor-pointer text-destructive focus:text-destructive"
          data-testid="button-disconnect-wallet"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NetworkIndicator() {
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  if (isWrongNetwork) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-destructive/20 rounded-full border border-destructive/50"
      >
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="text-xs font-medium text-destructive">Wrong Network</span>
        <Button 
          size="sm" 
          variant="destructive" 
          className="h-6 text-xs"
          onClick={() => setIsWrongNetwork(false)}
        >
          Switch
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-full border border-border">
      <div className="w-2 h-2 rounded-full bg-win" />
      <span className="text-xs font-medium text-muted-foreground">Ethereum</span>
    </div>
  );
}
