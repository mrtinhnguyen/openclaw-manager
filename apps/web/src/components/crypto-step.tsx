import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Wallet, 
  Coins, 
  Shield, 
  AlertTriangle, 
  Check, 
  Download, 
  Activity, 
  ArrowRight,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ChainType } from "@/stores/crypto-store";

interface CryptoStepProps {
  chain: ChainType;
  rpcUrl: string;
  walletAddress: string;
  isTestnet: boolean;
  skills: string[];
  installStatus?: "idle" | "running" | "success" | "failed";
  onChainChange: (chain: ChainType) => void;
  onRpcUrlChange: (url: string) => void;
  onWalletAddressChange: (address: string) => void;
  onTestnetChange: (isTestnet: boolean) => void;
  onToggleSkill: (skill: string) => void;
  onNext: () => void;
}

export function CryptoStep({
  chain,
  rpcUrl,
  walletAddress,
  isTestnet,
  skills,
  installStatus = "idle",
  onChainChange,
  onRpcUrlChange,
  onWalletAddressChange,
  onTestnetChange,
  onToggleSkill,
  onNext
}: CryptoStepProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"setup" | "wallet" | "skills">("setup");
  const [privateKey, setPrivateKey] = useState("");
  const [price, setPrice] = useState("Loading...");

  // Mock price fetch
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const id = chain === "solana" ? "solana" : "ethereum";
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
        const data = await res.json();
        setPrice(`$${data[id].usd}`);
      } catch (e) {
        setPrice("N/A");
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [chain]);

  const chains: { id: ChainType; name: string; icon: string }[] = [
    { id: "base", name: "Base", icon: "🔵" },
    { id: "ethereum", name: "Ethereum", icon: "💎" },
    { id: "solana", name: "Solana", icon: "🟣" },
    { id: "bsc", name: "BSC", icon: "🟡" }
  ];

  const availableSkills = [
    { id: "bankr", name: "Bankr (DeFi)", desc: "Trading, Swaps, Polymarket", recommended: true },
    { id: "wallet-ops", name: "Wallet Ops", desc: "Balance checks, transfers", recommended: true },
    { id: "snipe-bot", name: "Snipe Bot", desc: "New token launch sniper", recommended: false },
    { id: "auto-trade", name: "Auto-Trade", desc: "Rule-based trading & webhooks", recommended: false },
    { id: "node-monitor", name: "Node Monitor", desc: "Validator status checks", recommended: false },
  ];

  return (
    <div className="space-y-6 p-8 animate-fade-up">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <Coins className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold">{t("crypto.title")}</h2>
        <p className="mt-2 text-sm text-muted">{t("crypto.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-surface/50 p-1">
        {(['setup', 'wallet', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-accent-100 focus:outline-none focus:ring-2",
              activeTab === tab
                ? "bg-accent/10 text-accent shadow"
                : "text-muted hover:bg-white/[0.12] hover:text-white"
            )}
          >
            {tab === "setup" && "Blockchain Setup"}
            {tab === "wallet" && "Wallet Integration"}
            {tab === "skills" && "Skills & Tools"}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {/* Tab 1: Blockchain Setup */}
        {activeTab === "setup" && (
          <div className="space-y-6 animate-fade-up">
            <Card className="p-4 space-y-4 border-line/50 bg-surface/50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  {t("crypto.chainSelect")}
                </h3>
                <Badge variant="neutral" className="border-accent/20 text-accent">
                  {price}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {chains.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onChainChange(c.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all hover:scale-105",
                      chain === c.id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-line bg-surface/30 hover:border-accent/50"
                    )}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted" />
                RPC Endpoint
              </label>
              <Input
                value={rpcUrl}
                onChange={(e) => onRpcUrlChange(e.target.value)}
                placeholder="https://mainnet.infura.io/v3/..."
                className="bg-surface/50 border-line focus:border-accent font-mono text-xs"
              />
              <p className="text-xs text-muted">Use Alchemy, Infura, or Helius for best performance.</p>
            </div>
          </div>
        )}

        {/* Tab 2: Wallet Integration */}
        {activeTab === "wallet" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center justify-between p-4 rounded-xl border border-line bg-surface/30">
              <div className="flex items-center gap-3">
                <Shield className={cn("w-5 h-5", isTestnet ? "text-success" : "text-warning")} />
                <div>
                  <p className="font-medium">Sandbox Mode (Testnet)</p>
                  <p className="text-xs text-muted">Recommended for initial setup</p>
                </div>
              </div>
              <Button
                variant={isTestnet ? "primary" : "outline"}
                size="sm"
                onClick={() => onTestnetChange(!isTestnet)}
                className={cn(isTestnet && "bg-success/20 text-success hover:bg-success/30 border-success/50")}
              >
                {isTestnet ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted" />
                Wallet Address (Watch Only)
              </label>
              <Input
                value={walletAddress}
                onChange={(e) => onWalletAddressChange(e.target.value)}
                placeholder="0x..."
                className="bg-surface/50 border-line focus:border-accent font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-warning">
                <AlertTriangle className="w-4 h-4" />
                Private Key (Optional - Signing)
              </label>
              <Input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key to enable signing..."
                className="bg-surface/50 border-warning/30 focus:border-warning font-mono text-xs"
              />
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> SECURITY WARNING
                </p>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                  <li>Never share your private key.</li>
                  <li>Keys are stored locally and encrypted.</li>
                  <li>For large amounts, use a Hardware Wallet.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Skills */}
        {activeTab === "skills" && (
          <div className="space-y-4 animate-fade-up">
            <div className="grid grid-cols-1 gap-3">
              {availableSkills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => onToggleSkill(skill.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    skills.includes(skill.id)
                      ? "border-accent bg-accent/5"
                      : "border-line bg-surface/30 hover:border-accent/30"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    skills.includes(skill.id) ? "border-accent bg-accent" : "border-muted"
                  )}>
                    {skills.includes(skill.id) && <Check className="w-3 h-3 text-bg" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{skill.name}</span>
                      {skill.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Recommended</span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{skill.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          onClick={onNext} 
          size="lg" 
          className="w-full sm:w-auto"
          disabled={installStatus === "running"}
        >
          {installStatus === "running" ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-spin" />
              Installing Skills...
            </>
          ) : (
            <>
              {t("common.next")} <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
