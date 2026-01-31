import { Card } from "@/components/ui/card";
import { WizardSidebar, MobileProgress } from "@/components/wizard-sidebar";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { OnboardingOrchestrator } from "./containers/onboarding-orchestrator";
import { OnboardingStepRenderer } from "./containers/onboarding-step-renderer";

export function OnboardingPage() {
  const status = useStatusStore((state) => state.status);
  const error = useStatusStore((state) => state.error);
  const currentStep = useOnboardingStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <OnboardingOrchestrator />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-hero-pattern opacity-90" />
        <div className="absolute left-[-20%] top-[-10%] h-96 w-96 rounded-full bg-accent/15 blur-[150px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-accent-2/20 blur-[140px]" />
      </div>

      <WizardSidebar currentStep={currentStep} isConnected={Boolean(status)} error={error} />

      <main className="relative flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <MobileProgress currentStep={currentStep} />

          <Card className="animate-fade-up overflow-hidden">
            <OnboardingStepRenderer />
          </Card>
        </div>
      </main>
    </div>
  );
}
