import { GatewayStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingStatus } from "../onboarding-derived";

export function GatewayStepContainer() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);
  const quickstartJob = useJobsStore((state) => state.quickstart);
  const message = useOnboardingStore((state) => state.messages.message);
  const isProcessing = useOnboardingStore((state) => state.isProcessing);
  const autoStarted = useOnboardingStore((state) => state.autoStarted);
  const derived = deriveOnboardingStatus(status, loading);

  return (
    <GatewayStep
      isReady={derived.gatewayOk}
      autoStarted={autoStarted}
      message={message}
      isProcessing={isProcessing}
      logs={quickstartJob.logs}
      jobStatus={quickstartJob.status}
      jobError={quickstartJob.error}
      onRetry={presenter.onboarding.handleRetry}
    />
  );
}
