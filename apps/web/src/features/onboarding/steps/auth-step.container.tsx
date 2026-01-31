import { AuthStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useConfigStore } from "@/stores/config-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function AuthStepContainer() {
  const presenter = usePresenter();
  const inputs = useOnboardingStore((state) => state.inputs);
  const isProcessing = useOnboardingStore((state) => state.isProcessing);
  const authMessage = useOnboardingStore((state) => state.messages.authMessage);
  const authConfigured = useConfigStore((state) => state.authConfigured);

  return (
    <AuthStep
      username={inputs.authUser}
      password={inputs.authPass}
      onUsernameChange={presenter.onboarding.setAuthUser}
      onPasswordChange={presenter.onboarding.setAuthPass}
      onSubmit={presenter.onboarding.handleAuthSubmit}
      isProcessing={isProcessing}
      message={authMessage}
      configured={authConfigured}
    />
  );
}
