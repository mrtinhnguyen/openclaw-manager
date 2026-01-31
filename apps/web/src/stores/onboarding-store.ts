import { create } from "zustand";

import type { OnboardingBlockingReason } from "@/features/onboarding/domain/machine";
import type { OnboardingStep } from "@/features/onboarding/onboarding-steps";

export type OnboardingInputs = {
  tokenInput: string;
  aiProvider: string;
  aiKeyInput: string;
  pairingInput: string;
};

export type OnboardingMessages = {
  message: string | null;
  aiMessage: string | null;
  cliMessage: string | null;
  probeMessage: string | null;
  resourceMessage: string | null;
};

type OnboardingState = {
  currentStep: OnboardingStep;
  systemStep: OnboardingStep;
  pendingStep: OnboardingStep | null;
  pendingSince: string | null;
  blockingReason: OnboardingBlockingReason | null;
  inputs: OnboardingInputs;
  messages: OnboardingMessages;
  isProcessing: boolean;
  autoStarted: boolean;
  setFlowState: (flow: {
    currentStep: OnboardingStep;
    systemStep: OnboardingStep;
    pendingStep: OnboardingStep | null;
    pendingSince: string | null;
    blockingReason: OnboardingBlockingReason | null;
  }) => void;
  setTokenInput: (value: string) => void;
  setAiProvider: (value: string) => void;
  setAiKeyInput: (value: string) => void;
  setPairingInput: (value: string) => void;
  setMessage: (value: string | null) => void;
  setAiMessage: (value: string | null) => void;
  setCliMessage: (value: string | null) => void;
  setProbeMessage: (value: string | null) => void;
  setResourceMessage: (value: string | null) => void;
  setIsProcessing: (value: boolean) => void;
  setAutoStarted: (value: boolean) => void;
};

const initialInputs: OnboardingInputs = {
  tokenInput: "",
  aiProvider: "anthropic",
  aiKeyInput: "",
  pairingInput: ""
};

const initialMessages: OnboardingMessages = {
  message: null,
  aiMessage: null,
  cliMessage: null,
  probeMessage: null,
  resourceMessage: null
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: "cli",
  systemStep: "cli",
  pendingStep: null,
  pendingSince: null,
  blockingReason: null,
  inputs: initialInputs,
  messages: initialMessages,
  isProcessing: false,
  autoStarted: false,
  setFlowState: (flow) =>
    set(() => ({
      currentStep: flow.currentStep,
      systemStep: flow.systemStep,
      pendingStep: flow.pendingStep,
      pendingSince: flow.pendingSince,
      blockingReason: flow.blockingReason
    })),
  setTokenInput: (value) =>
    set((state) => ({ inputs: { ...state.inputs, tokenInput: value } })),
  setAiProvider: (value) =>
    set((state) => ({ inputs: { ...state.inputs, aiProvider: value } })),
  setAiKeyInput: (value) =>
    set((state) => ({ inputs: { ...state.inputs, aiKeyInput: value } })),
  setPairingInput: (value) =>
    set((state) => ({ inputs: { ...state.inputs, pairingInput: value } })),
  setMessage: (value) =>
    set((state) => ({ messages: { ...state.messages, message: value } })),
  setAiMessage: (value) =>
    set((state) => ({ messages: { ...state.messages, aiMessage: value } })),
  setCliMessage: (value) =>
    set((state) => ({ messages: { ...state.messages, cliMessage: value } })),
  setProbeMessage: (value) =>
    set((state) => ({ messages: { ...state.messages, probeMessage: value } })),
  setResourceMessage: (value) =>
    set((state) => ({ messages: { ...state.messages, resourceMessage: value } })),
  setIsProcessing: (value) => set({ isProcessing: value }),
  setAutoStarted: (value) => set({ autoStarted: value })
}));
