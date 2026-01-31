import { resolveNextStep, stepIndex, type OnboardingStep } from "../onboarding-steps";
import type { OnboardingContext } from "./context";

export type OnboardingBlockingReason =
  | { type: "pending-confirmation"; step: OnboardingStep; since: string | null }
  | { type: "system-behind"; expectedStep: OnboardingStep; currentStep: OnboardingStep };

export type OnboardingFlowState = {
  currentStep: OnboardingStep;
  systemStep: OnboardingStep;
  pendingStep: OnboardingStep | null;
  pendingSince: string | null;
  blockingReason: OnboardingBlockingReason | null;
};

export function syncOnboardingFlow(
  state: OnboardingFlowState,
  context: OnboardingContext
): OnboardingFlowState {
  const systemStep = resolveNextStep({
    cliInstalled: context.cliInstalled,
    gatewayOk: context.gatewayOk,
    tokenConfigured: context.tokenConfigured,
    aiConfigured: context.aiConfigured,
    allowFromConfigured: context.allowFromConfigured,
    probeOk: context.probeOk
  });

  const nextCurrentStep =
    stepIndex(systemStep) > stepIndex(state.currentStep) ? systemStep : state.currentStep;

  let pendingStep = state.pendingStep;
  let pendingSince = state.pendingSince;
  if (pendingStep && isStepSatisfied(context, pendingStep)) {
    pendingStep = null;
    pendingSince = null;
  }

  const blockingReason = resolveBlockingReason({
    pendingStep,
    pendingSince,
    systemStep,
    currentStep: nextCurrentStep
  });

  return {
    currentStep: nextCurrentStep,
    systemStep,
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
        pendingSince: state.pendingSince,
        systemStep: state.systemStep,
        currentStep: state.currentStep
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
  systemStep: OnboardingStep;
  currentStep: OnboardingStep;
}): OnboardingBlockingReason | null {
  const { pendingStep, pendingSince, systemStep, currentStep } = params;
  if (pendingStep) {
    return { type: "pending-confirmation", step: pendingStep, since: pendingSince };
  }
  if (stepIndex(systemStep) < stepIndex(currentStep)) {
    return { type: "system-behind", expectedStep: systemStep, currentStep };
  }
  return null;
}

export function isStepSatisfied(context: OnboardingContext, step: OnboardingStep): boolean {
  switch (step) {
    case "cli":
      return context.cliInstalled;
    case "gateway":
      return context.gatewayOk;
    case "token":
      return context.tokenConfigured;
    case "ai":
      return context.aiConfigured;
    case "pairing":
      return context.allowFromConfigured || context.probeOk;
    case "probe":
    case "complete":
      return context.probeOk;
    default:
      return false;
  }
}
