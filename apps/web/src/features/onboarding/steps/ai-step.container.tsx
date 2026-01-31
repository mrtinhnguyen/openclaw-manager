import { AiStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingStatus } from "../onboarding-derived";

export function AiStepContainer() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);
  const aiAuthJob = useJobsStore((state) => state.aiAuth);
  const inputs = useOnboardingStore((state) => state.inputs);
  const aiMessage = useOnboardingStore((state) => state.messages.aiMessage);
  const isProcessing = useOnboardingStore((state) => state.isProcessing);
  const derived = deriveOnboardingStatus(status, loading);

  return (
    <AiStep
      provider={inputs.aiProvider}
      value={inputs.aiKeyInput}
      onProviderChange={presenter.onboarding.setAiProvider}
      onChange={presenter.onboarding.setAiKeyInput}
      onSubmit={presenter.onboarding.handleAiSubmit}
      isProcessing={isProcessing}
      message={aiMessage}
      configured={derived.aiConfigured}
      missingProviders={derived.aiMissingProviders}
      logs={aiAuthJob.logs}
      jobStatus={aiAuthJob.status}
      jobError={aiAuthJob.error}
      statusError={derived.aiStatusError}
    />
  );
}
