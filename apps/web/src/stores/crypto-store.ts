import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChainType = "ethereum" | "base" | "solana" | "bsc";

export interface CryptoState {
  chain: ChainType;
  rpcUrl: string;
  walletAddress: string;
  isTestnet: boolean;
  skills: string[];
  cryptoConfigured: boolean;
  
  setChain: (chain: ChainType) => void;
  setRpcUrl: (url: string) => void;
  setWalletAddress: (address: string) => void;
  setTestnet: (isTestnet: boolean) => void;
  toggleSkill: (skill: string) => void;
  setConfigured: (configured: boolean) => void;
}

export const useCryptoStore = create<CryptoState>()(
  persist(
    (set) => ({
      chain: "base",
      rpcUrl: "",
      walletAddress: "",
      isTestnet: true,
      skills: [],
      cryptoConfigured: false,

      setChain: (chain) => set({ chain }),
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setWalletAddress: (walletAddress) => set({ walletAddress }),
      setTestnet: (isTestnet) => set({ isTestnet }),
      toggleSkill: (skill) =>
        set((state) => {
          const skills = state.skills.includes(skill)
            ? state.skills.filter((s) => s !== skill)
            : [...state.skills, skill];
          return { skills };
        }),
      setConfigured: (configured) => set({ cryptoConfigured: configured }),
    }),
    {
      name: "blockclaw-crypto-storage",
    }
  )
);
