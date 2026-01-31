import { useOnboardingStore } from "@/stores/onboarding-store";

import { AuthStepContainer } from "../steps/auth-step.container";
import { CliStepContainer } from "../steps/cli-step.container";
import { GatewayStepContainer } from "../steps/gateway-step.container";
import { TokenStepContainer } from "../steps/token-step.container";
import { AiStepContainer } from "../steps/ai-step.container";
import { PairingStepContainer } from "../steps/pairing-step.container";
import { ProbeStepContainer } from "../steps/probe-step.container";
import { CompleteStepContainer } from "../steps/complete-step.container";

export function OnboardingStepRenderer() {
  const currentStep = useOnboardingStore((state) => state.currentStep);

  if (currentStep === "auth") return <AuthStepContainer />;
  if (currentStep === "cli") return <CliStepContainer />;
  if (currentStep === "gateway") return <GatewayStepContainer />;
  if (currentStep === "token") return <TokenStepContainer />;
  if (currentStep === "ai") return <AiStepContainer />;
  if (currentStep === "pairing") return <PairingStepContainer />;
  if (currentStep === "probe") return <ProbeStepContainer />;
  return <CompleteStepContainer />;
}
