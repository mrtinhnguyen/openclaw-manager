import type { StatusResponse } from "@/stores/status-store";

export type OnboardingContext = {
  cliInstalled: boolean;
  cliVersion: string | null;
  cliChecking: boolean;
  gatewayOk: boolean;
  gatewayVerified: boolean;
  tokenConfigured: boolean;
  tokenConfirmed: boolean;
  aiConfigured: boolean;
  aiConfirmed: boolean;
  aiMissingProviders: string[];
  aiStatusError: string | null;
  allowFromConfigured: boolean;
  probeOk: boolean;
  probeConfirmed: boolean;
  pairingConfirmed: boolean;
  pendingPairings: number;
};

export function deriveOnboardingContext(params: {
  status: StatusResponse | null;
  loading: boolean;
  events: {
    gatewayVerified: boolean;
    tokenConfirmed: boolean;
    aiConfirmed: boolean;
    pairingConfirmed: boolean;
    probeConfirmed: boolean;
  };
}): OnboardingContext {
  const { status, loading, events } = params;
  return {
    cliInstalled: Boolean(status?.cli.installed),
    cliVersion: status?.cli.version ?? null,
    gatewayOk: Boolean(status?.gateway.ok),
    gatewayVerified: Boolean(events.gatewayVerified),
    tokenConfigured: Boolean(status?.onboarding?.discord.tokenConfigured),
    tokenConfirmed: events.tokenConfirmed,
    aiConfigured: Boolean(status?.onboarding?.ai?.configured),
    aiConfirmed: events.aiConfirmed,
    aiMissingProviders: status?.onboarding?.ai?.missingProviders ?? [],
    aiStatusError: status?.onboarding?.ai?.error ?? null,
    allowFromConfigured: Boolean(status?.onboarding?.discord.allowFromConfigured),
    probeOk: status?.onboarding?.probe?.ok === true,
    probeConfirmed: events.probeConfirmed,
    pairingConfirmed: events.pairingConfirmed,
    pendingPairings: status?.onboarding?.discord.pendingPairings ?? 0,
    cliChecking: !status && loading
  };
}
