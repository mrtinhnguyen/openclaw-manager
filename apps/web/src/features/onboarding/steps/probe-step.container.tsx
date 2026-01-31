import { ProbeStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function ProbeStepContainer() {
  const presenter = usePresenter();
  const quickstartJob = useJobsStore((state) => state.quickstart);
  const probeMessage = useOnboardingStore((state) => state.messages.probeMessage);
  const isProcessing = useOnboardingStore((state) => state.isProcessing);

  return (
    <ProbeStep
      isProcessing={isProcessing}
      message={probeMessage}
      logs={quickstartJob.logs}
      jobStatus={quickstartJob.status}
      jobError={quickstartJob.error}
      onRetry={presenter.onboarding.handleProbe}
    />
  );
}
