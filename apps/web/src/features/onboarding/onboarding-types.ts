import type { JobState, QuickstartResult } from "@/stores/jobs-store";

export type OnboardingInputs = {
  tokenInput: string;
  aiProvider: string;
  aiKeyInput: string;
  pairingInput: string;
  authUser: string;
  authPass: string;
};


export type OnboardingMessages = {
  authMessage: string | null;
  message: string | null;
  aiMessage: string | null;
  cliMessage: string | null;
  probeMessage: string | null;
  resourceMessage: string | null;
};


export type OnboardingDerived = {
  cliInstalled: boolean;
  cliVersion: string | null;
  gatewayOk: boolean;
  tokenConfigured: boolean;
  aiConfigured: boolean;
  aiMissingProviders: string[];
  aiStatusError: string | null;
  allowFromConfigured: boolean;
  probeOk: boolean;
  pendingPairings: number;
  cliChecking: boolean;
};

export type OnboardingJobs = {
  cli: JobState<{ version?: string | null }>;
  quickstart: JobState<QuickstartResult>;
  pairing: JobState<{ code?: string }>;
  resource: JobState<{ path?: string }>;
  aiAuth: JobState<{ provider?: string }>;
};

export type OnboardingActions = {
  handleAuthSubmit: () => Promise<void>;
  handleCliInstall: () => Promise<void>;
  handleTokenSubmit: () => Promise<void>;
  handleAiSubmit: () => Promise<void>;
  handlePairingSubmit: () => Promise<void>;
  handleRetry: () => Promise<void>;
  handleProbe: () => Promise<void>;
  handleResourceDownload: () => Promise<{ ok: boolean; error?: string }>;
};
