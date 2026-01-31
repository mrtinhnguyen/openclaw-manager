import { useMemo } from "react";

import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingContext } from "./domain/context";
import { buildOnboardingViewModel } from "./domain/view-model";

export function useOnboardingViewModel() {
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);

  const currentStep = useOnboardingStore((store) => store.currentStep);
  const systemStep = useOnboardingStore((store) => store.systemStep);
  const pendingStep = useOnboardingStore((store) => store.pendingStep);
  const pendingSince = useOnboardingStore((store) => store.pendingSince);
  const blockingReason = useOnboardingStore((store) => store.blockingReason);
  const inputs = useOnboardingStore((store) => store.inputs);
  const messages = useOnboardingStore((store) => store.messages);
  const isProcessing = useOnboardingStore((store) => store.isProcessing);
  const autoStarted = useOnboardingStore((store) => store.autoStarted);

  const cli = useJobsStore((store) => store.cli);
  const quickstart = useJobsStore((store) => store.quickstart);
  const pairing = useJobsStore((store) => store.pairing);
  const resource = useJobsStore((store) => store.resource);
  const aiAuth = useJobsStore((store) => store.aiAuth);

  const context = useMemo(
    () =>
      deriveOnboardingContext({
        status,
        loading
      }),
    [status, loading]
  );

  const viewModel = useMemo(
    () =>
      buildOnboardingViewModel({
        state: {
          currentStep,
          systemStep,
          pendingStep,
          pendingSince,
          blockingReason,
          inputs,
          messages,
          isProcessing,
          autoStarted
        },
        context,
        jobs: {
          cli,
          quickstart,
          pairing,
          resource,
          aiAuth
        }
      }),
    [
      currentStep,
      systemStep,
      pendingStep,
      pendingSince,
      blockingReason,
      inputs,
      messages,
      isProcessing,
      autoStarted,
      context,
      cli,
      quickstart,
      pairing,
      resource,
      aiAuth
    ]
  );

  return { context, viewModel };
}
