import { OnboardingPage } from "@/features/onboarding/onboarding-page";
import { AuthGate } from "@/features/auth/auth-gate";

export default function App() {
  return (
    <AuthGate>
      <OnboardingPage />
    </AuthGate>
  );
}
