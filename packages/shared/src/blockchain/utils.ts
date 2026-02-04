export type ChainType = 'ethereum' | 'solana' | 'base' | 'arbitrum' | 'optimism' | 'polygon';

export const CHAIN_CONFIGS: Record<ChainType, {
  name: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  defaultRpc: string;
  blockExplorer: string;
  testnet?: boolean;
}> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    defaultRpc: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
  },
  solana: {
    name: 'Solana Mainnet',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    defaultRpc: 'https://api.mainnet-beta.solana.com',
    blockExplorer: 'https://solscan.io',
  },
  base: {
    name: 'Base Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    defaultRpc: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
  arbitrum: {
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    defaultRpc: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
  },
  optimism: {
    name: 'OP Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    defaultRpc: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  polygon: {
    name: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    defaultRpc: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
};

// Regex for basic validation
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidAddress(address: string, chain: ChainType): boolean {
  if (!address) return false;
  
  if (chain === 'solana') {
    return SOLANA_ADDRESS_REGEX.test(address);
  }
  
  // Default to EVM for others
  return EVM_ADDRESS_REGEX.test(address);
}

export function getExplorerUrl(chain: ChainType, type: 'tx' | 'address', value: string): string {
  const config = CHAIN_CONFIGS[chain];
  if (!config) return '';
  
  const baseUrl = config.blockExplorer;
  
  if (chain === 'solana') {
    return `${baseUrl}/${type}/${value}`;
  }
  
  return `${baseUrl}/${type}/${value}`;
}

export function formatAddress(address: string, length = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}
