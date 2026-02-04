import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { OnboardingBlockingReason } from "@/features/onboarding/domain/machine";
import type { OnboardingStep } from "@/features/onboarding/onboarding-steps";

type OnboardingState = {
  currentStep: OnboardingStep;
  pendingStep: OnboardingStep | null;
  pendingSince: string | null;
  blockingReason: OnboardingBlockingReason | null;
  events: {
    gatewayVerified: boolean;
    tokenConfirmed: boolean;
    aiConfirmed: boolean;
    pairingConfirmed: boolean;
    probeConfirmed: boolean;
  };
  setEvents: (events: Partial<OnboardingState["events"]>) => void;
  resetEvents: () => void;
  setFlowState: (flow: {
    currentStep: OnboardingStep;
    pendingStep: OnboardingStep | null;
    pendingSince: string | null;
    blockingReason: OnboardingBlockingReason | null;
  }) => void;
};

const defaultEvents = () => ({
  gatewayVerified: false,
  tokenConfirmed: false,
  aiConfirmed: false,
  pairingConfirmed: false,
  probeConfirmed: false
});

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: "cli",
      pendingStep: null,
      pendingSince: null,
      blockingReason: null,
      events: defaultEvents(),
      setEvents: (events) =>
        set((state) => ({
          events: {
            ...state.events,
            ...events
          }
        })),
      resetEvents: () =>
        set(() => ({
          events: defaultEvents()
        })),
      setFlowState: (flow) =>
        set(() => ({
          currentStep: flow.currentStep,
          pendingStep: flow.pendingStep,
          pendingSince: flow.pendingSince,
          blockingReason: flow.blockingReason
        }))
    }),
    {
      name: "blockclaw-manager-onboarding",
      version: 1,
      partialize: (state) => ({
        events: state.events
      })
    }
  )
);
