import { PairingStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingStatus } from "../onboarding-derived";

export function PairingStepContainer() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);
  const pairingJob = useJobsStore((state) => state.pairing);
  const pairingInput = useOnboardingStore((state) => state.inputs.pairingInput);
  const message = useOnboardingStore((state) => state.messages.message);
  const isProcessing = useOnboardingStore((state) => state.isProcessing);
  const derived = deriveOnboardingStatus(status, loading);

  return (
    <PairingStep
      value={pairingInput}
      onChange={presenter.onboarding.setPairingInput}
      onSubmit={presenter.onboarding.handlePairingSubmit}
      isProcessing={isProcessing}
      message={message}
      pendingPairings={derived.pendingPairings}
      logs={pairingJob.logs}
      jobStatus={pairingJob.status}
      jobError={pairingJob.error}
    />
  );
}
