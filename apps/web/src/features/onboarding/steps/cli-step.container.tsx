import { CliStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingStatus } from "../onboarding-derived";

export function CliStepContainer() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);
  const cliJob = useJobsStore((state) => state.cli);
  const cliMessage = useOnboardingStore((state) => state.messages.cliMessage);
  const isProcessing = useOnboardingStore((state) => state.isProcessing);
  const derived = deriveOnboardingStatus(status, loading);

  return (
    <CliStep
      installed={derived.cliInstalled}
      version={derived.cliVersion}
      isChecking={derived.cliChecking}
      isProcessing={isProcessing}
      message={cliMessage}
      logs={cliJob.logs}
      jobStatus={cliJob.status}
      jobError={cliJob.error}
      onInstall={presenter.onboarding.handleCliInstall}
    />
  );
}
