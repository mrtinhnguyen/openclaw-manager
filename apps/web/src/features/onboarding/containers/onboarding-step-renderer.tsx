import type { OnboardingStep } from "../onboarding-steps";
import { CliStepContainer } from "../steps/cli-step.container";
import { GatewayStepContainer } from "../steps/gateway-step.container";
import { TokenStepContainer } from "../steps/token-step.container";
import { CryptoStepContainer } from "../steps/crypto-step.container";
import { AiStepContainer } from "../steps/ai-step.container";
import { PairingStepContainer } from "../steps/pairing-step.container";
import { ProbeStepContainer } from "../steps/probe-step.container";
import { CompleteStepContainer } from "../steps/complete-step.container";

export function OnboardingStepRenderer({ currentStep }: { currentStep: OnboardingStep }) {
  if (currentStep === "cli") return <CliStepContainer />;
  if (currentStep === "gateway") return <GatewayStepContainer />;
  if (currentStep === "token") return <TokenStepContainer />;
  if (currentStep === "crypto") return <CryptoStepContainer />;
  if (currentStep === "ai") return <AiStepContainer />;
  if (currentStep === "pairing") return <PairingStepContainer />;
  if (currentStep === "probe") return <ProbeStepContainer />;
  return <CompleteStepContainer />;
}
