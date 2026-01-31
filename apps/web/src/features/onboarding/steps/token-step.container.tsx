import { TokenStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function TokenStepContainer() {
  const presenter = usePresenter();
  const tokenInput = useOnboardingStore((state) => state.inputs.tokenInput);
  const message = useOnboardingStore((state) => state.messages.message);
  const isProcessing = useOnboardingStore((state) => state.isProcessing);

  return (
    <TokenStep
      value={tokenInput}
      onChange={presenter.onboarding.setTokenInput}
      onSubmit={presenter.onboarding.handleTokenSubmit}
      isProcessing={isProcessing}
      message={message}
    />
  );
}
