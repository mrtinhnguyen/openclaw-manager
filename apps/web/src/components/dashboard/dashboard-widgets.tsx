import { useState, useEffect } from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Fuel, Wallet, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock Data Generators
const useMockPrice = (symbol: string, initial: number) => {
  const [price, setPrice] = useState(initial);
  const [change, setChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const volatility = initial * 0.002; // 0.2% volatility
      const delta = (Math.random() - 0.5) * volatility;
      setPrice((p) => p + delta);
      setChange(delta);
    }, 3000);
    return () => clearInterval(interval);
  }, [initial]);

  return { price, change };
};

export function PriceWidget({ symbol, name, initialPrice }: { symbol: string; name: string; initialPrice: number }) {
  const { price, change } = useMockPrice(symbol, initialPrice);
  const isPositive = change >= 0;

  return (
    <Card className="p-4 border-line bg-surface/30 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-muted font-medium">{name}</p>
          <h3 className="text-2xl font-bold font-mono mt-1">
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className={cn("flex items-center text-xs font-medium px-2 py-1 rounded-full", 
          isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {Math.abs((change / price) * 100).toFixed(2)}%
        </div>
      </div>
    </Card>
  );
}

export function GasWidget() {
  const [gas, setGas] = useState(15);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGas(Math.floor(10 + Math.random() * 20));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 border-line bg-surface/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-warning/10 text-warning">
          <Fuel className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted font-medium">ETH Gas</p>
          <h3 className="text-xl font-bold font-mono">{gas} <span className="text-sm text-muted">Gwei</span></h3>
        </div>
      </div>
    </Card>
  );
}

export function WalletWidget() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = () => {
    setLoading(true);
    // Simulate fetch
    setTimeout(() => {
      setBalance(1.4582);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <Card className="p-4 border-line bg-surface/30 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Wallet Balance</p>
            {loading ? (
              <div className="h-6 w-24 bg-muted/20 animate-pulse rounded mt-1" />
            ) : (
              <h3 className="text-xl font-bold font-mono">{balance} <span className="text-sm text-muted">ETH</span></h3>
            )}
          </div>
        </div>
        <button onClick={fetchBalance} className="text-muted hover:text-ink transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>
      <div className="mt-3 pt-3 border-t border-line/50 flex gap-2">
        <div className="text-xs px-2 py-1 rounded bg-surface border border-line text-muted">
          0x71C...9A23
        </div>
        <div className="text-xs px-2 py-1 rounded bg-success/10 text-success border border-success/20">
          Connected
        </div>
      </div>
    </Card>
  );
}

export function DashboardPanel() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PriceWidget symbol="ETH" name="Ethereum" initialPrice={2850} />
        <PriceWidget symbol="SOL" name="Solana" initialPrice={145} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GasWidget />
        <WalletWidget />
      </div>
    </div>
  );
}
