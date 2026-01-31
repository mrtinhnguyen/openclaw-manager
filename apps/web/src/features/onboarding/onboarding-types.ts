export type OnboardingActions = {
  handleCliInstall: () => Promise<void>;
  handleTokenSubmit: () => Promise<void>;
  handleAiSubmit: () => Promise<void>;
  handlePairingSubmit: () => Promise<void>;
  handleRetry: () => Promise<void>;
  handleProbe: () => Promise<void>;
  handleResourceDownload: () => Promise<{ ok: boolean; error?: string }>;
};
