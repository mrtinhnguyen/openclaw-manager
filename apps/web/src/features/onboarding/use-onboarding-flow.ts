import { useMemo } from "react";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingContext } from "./domain/context";

export function useOnboardingFlow() {
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);

  const currentStep = useOnboardingStore((store) => store.currentStep);
  const pendingStep = useOnboardingStore((store) => store.pendingStep);
  const pendingSince = useOnboardingStore((store) => store.pendingSince);
  const blockingReason = useOnboardingStore((store) => store.blockingReason);
  const events = useOnboardingStore((store) => store.events);

  const context = useMemo(
    () =>
      deriveOnboardingContext({
        status,
        loading,
        events
      }),
    [status, loading, events]
  );

  return {
    context,
    flow: {
      currentStep,
      pendingStep,
      pendingSince,
      blockingReason
    }
  };
}
