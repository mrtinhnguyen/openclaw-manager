import { resolveNextStep, type OnboardingStep } from "../onboarding-steps";
import type { OnboardingContext } from "./context";

export type OnboardingBlockingReason =
  | { type: "pending-confirmation"; step: OnboardingStep; since: string | null };

export type OnboardingFlowState = {
  currentStep: OnboardingStep;
  pendingStep: OnboardingStep | null;
  pendingSince: string | null;
  blockingReason: OnboardingBlockingReason | null;
};

export function syncOnboardingFlow(
  state: OnboardingFlowState,
  context: OnboardingContext
): OnboardingFlowState {
  const nextStep = resolveNextStep({
    cliInstalled: context.cliInstalled,
    gatewayOk: context.gatewayOk,
    gatewayVerified: context.gatewayVerified,
    tokenConfirmed: context.tokenConfirmed,
    cryptoConfigured: context.cryptoConfigured,
    aiConfirmed: context.aiConfirmed,
    pairingConfirmed: context.pairingConfirmed,
    probeConfirmed: context.probeConfirmed
  });

  let pendingStep = state.pendingStep;
  let pendingSince = state.pendingSince;
  if (pendingStep && isStepSatisfied(context, pendingStep)) {
    pendingStep = null;
    pendingSince = null;
  }

  const blockingReason = resolveBlockingReason({
    pendingStep,
    pendingSince
  });

  return {
    currentStep: nextStep,
    pendingStep,
    pendingSince,
    blockingReason
  };
}

export function requestOnboardingConfirmation(
  state: OnboardingFlowState,
  step: OnboardingStep,
  now: string = new Date().toISOString()
): OnboardingFlowState {
  if (state.pendingStep === step) {
    return {
      ...state,
      blockingReason: resolveBlockingReason({
        pendingStep: state.pendingStep,
        pendingSince: state.pendingSince
      })
    };
  }
  return {
    ...state,
    pendingStep: step,
    pendingSince: now,
    blockingReason: {
      type: "pending-confirmation",
      step,
      since: now
    }
  };
}

function resolveBlockingReason(params: {
  pendingStep: OnboardingStep | null;
  pendingSince: string | null;
}): OnboardingBlockingReason | null {
  const { pendingStep, pendingSince } = params;
  if (pendingStep) {
    return { type: "pending-confirmation", step: pendingStep, since: pendingSince };
  }
  return null;
}

export function isStepSatisfied(context: OnboardingContext, step: OnboardingStep): boolean {
  switch (step) {
    case "cli":
      return context.cliInstalled;
    case "gateway":
      return context.gatewayVerified || context.gatewayOk;
    case "token":
      return context.tokenConfirmed;
    case "crypto":
      return context.cryptoConfigured;
    case "ai":
      return context.aiConfirmed;
    case "pairing":
      return context.pairingConfirmed;
    case "probe":
    case "complete":
      return context.probeConfirmed;
    default:
      return false;
  }
}
