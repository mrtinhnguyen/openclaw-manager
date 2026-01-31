import { CompleteStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingStatus } from "../onboarding-derived";

export function CompleteStepContainer() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);
  const resourceJob = useJobsStore((state) => state.resource);
  const resourceMessage = useOnboardingStore((state) => state.messages.resourceMessage);
  const derived = deriveOnboardingStatus(status, loading);

  return (
    <CompleteStep
      probeOk={derived.probeOk}
      onDownloadResource={presenter.onboarding.handleResourceDownload}
      resourceLogs={resourceJob.logs}
      resourceJobStatus={resourceJob.status}
      resourceMessage={resourceMessage}
      resourceError={resourceJob.error}
    />
  );
}
