export type OnboardingStep =
  | "cli"
  | "gateway"
  | "token"
  | "crypto"
  | "ai"
  | "pairing"
  | "probe"
  | "complete";

export const ONBOARDING_STEPS = [
  { id: "cli", label: "Install CLI", description: "Prepare runtime environment" },
  { id: "gateway", label: "Verify Gateway", description: "Confirm local service is available" },
  { id: "token", label: "Configure Token", description: "Connect Discord Bot" },
  { id: "crypto", label: "Crypto Setup", description: "Chain & Wallet" },
  { id: "ai", label: "Configure AI", description: "Enable model capabilities" },
  { id: "pairing", label: "Pairing Verification", description: "Authorize user access" },
  { id: "probe", label: "Channel Probe", description: "Verify channel connection" },
  { id: "complete", label: "Start Using", description: "Everything is ready" }
] as const satisfies readonly {
  id: OnboardingStep;
  label: string;
  description: string;
}[];

const stepOrder: OnboardingStep[] = ONBOARDING_STEPS.map((step) => step.id);
const stepMeta = new Map(ONBOARDING_STEPS.map((step) => [step.id, step]));

export function stepIndex(step: OnboardingStep) {
  return stepOrder.indexOf(step);
}

export function getOnboardingStepMeta(step: OnboardingStep) {
  return stepMeta.get(step) ?? { id: step, label: step, description: "" };
}

// We need to import the store to check if configured
// But imports here might cause circular deps if not careful.
// Let's assume we pass a 'cryptoConfigured' param.

export function resolveNextStep(params: {
  cliInstalled: boolean;
  gatewayOk: boolean;
  gatewayVerified: boolean;
  tokenConfirmed: boolean;
  aiConfirmed: boolean;
  pairingConfirmed: boolean;
  probeConfirmed: boolean;
  cryptoConfigured: boolean; // Added this
}): OnboardingStep {
  const {
    cliInstalled,
    gatewayOk,
    gatewayVerified,
    tokenConfirmed,
    aiConfirmed,
    pairingConfirmed,
    probeConfirmed,
    cryptoConfigured
  } = params;
  const gatewayReady = gatewayOk || gatewayVerified;
  
  if (!cliInstalled) return "cli";
  if (probeConfirmed) return "complete";
  if (gatewayReady && tokenConfirmed && cryptoConfigured && !aiConfirmed) return "ai";
  if (gatewayReady && tokenConfirmed && cryptoConfigured && aiConfirmed && pairingConfirmed) return "probe";
  if (gatewayReady && tokenConfirmed && cryptoConfigured && aiConfirmed) return "pairing";
  if (gatewayReady && tokenConfirmed && !cryptoConfigured) return "crypto";
  if (gatewayReady && !tokenConfirmed) return "token";
  if (gatewayReady) return "token"; // Default fallback
  return "gateway";
}
