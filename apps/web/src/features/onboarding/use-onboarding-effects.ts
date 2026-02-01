import { useEffect, useRef } from "react";

import type { OnboardingStep } from "./onboarding-steps";

import type { OnboardingContext } from "./domain/context";

export function useStatusPolling(refresh: () => Promise<void>, jobsRunning: boolean) {
  useEffect(() => {
    refresh();
    if (jobsRunning) return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh, jobsRunning]);
}

type AutoStartParams = {
  currentStep: OnboardingStep;
  hasStatus: boolean;
  cliInstalled: boolean;
  quickstartRunning: boolean;
  gatewayOk: boolean;
  gatewayProcessing: boolean;
  startGateway: () => Promise<void>;
};

const autoStartSteps: OnboardingStep[] = ["token", "ai", "pairing", "probe"];

export function useAutoStartGatewayOnDemand(params: AutoStartParams) {
  const {
    currentStep,
    hasStatus,
    cliInstalled,
    quickstartRunning,
    gatewayOk,
    gatewayProcessing,
    startGateway
  } = params;
  const lastRequestedStepRef = useRef<OnboardingStep | null>(null);

  useEffect(() => {
    if (gatewayOk) {
      lastRequestedStepRef.current = null;
    }
  }, [gatewayOk]);

  useEffect(() => {
    if (!autoStartSteps.includes(currentStep)) return;
    if (!hasStatus || !cliInstalled || quickstartRunning || gatewayOk || gatewayProcessing) {
      return;
    }
    if (lastRequestedStepRef.current === currentStep) {
      return;
    }
    lastRequestedStepRef.current = currentStep;
    void startGateway();
  }, [
    currentStep,
    hasStatus,
    cliInstalled,
    quickstartRunning,
    gatewayOk,
    gatewayProcessing,
    startGateway
  ]);
}

type OnboardingFlowParams = {
  hasStatus: boolean;
  context: OnboardingContext;
  onStatusUpdate: (context: OnboardingContext) => void;
};

export function useOnboardingFlow(params: OnboardingFlowParams) {
  const { hasStatus, context, onStatusUpdate } = params;

  useEffect(() => {
    if (!hasStatus) return;
    onStatusUpdate(context);
  }, [
    hasStatus,
    context.cliInstalled,
    context.gatewayOk,
    context.gatewayVerified,
    context.tokenConfigured,
    context.aiConfigured,
    context.probeOk,
    context.tokenConfirmed,
    context.aiConfirmed,
    context.pairingConfirmed,
    context.probeConfirmed,
    onStatusUpdate
  ]);
}

type EnterSubmitParams = {
  currentStep: OnboardingStep;
  cliInstalled: boolean;
  tokenInput: string;
  aiKeyInput: string;
  pairingInput: string;
  isProcessing: boolean;
  actions: {
    installCli: () => void;
    submitToken: () => void;
    submitAi: () => void;
    submitPairing: () => void;
    runProbe: () => void;
  };
};

export function useEnterKeySubmit(params: EnterSubmitParams) {
  const {
    currentStep,
    cliInstalled,
    tokenInput,
    aiKeyInput,
    pairingInput,
    isProcessing,
    actions
  } = params;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isProcessing) {
        if (currentStep === "cli" && !cliInstalled) {
          actions.installCli();
        } else if (currentStep === "token" && tokenInput.trim()) {
          actions.submitToken();
        } else if (currentStep === "ai" && aiKeyInput.trim()) {
          actions.submitAi();
        } else if (currentStep === "pairing" && pairingInput.trim()) {
          actions.submitPairing();
        } else if (currentStep === "probe") {
          actions.runProbe();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentStep,
    cliInstalled,
    tokenInput,
    aiKeyInput,
    pairingInput,
    isProcessing,
    actions
  ]);
}
