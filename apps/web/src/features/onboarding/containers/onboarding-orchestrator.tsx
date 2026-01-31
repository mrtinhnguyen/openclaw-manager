import { usePresenter } from "@/presenter/presenter-context";
import { useStatusStore } from "@/stores/status-store";

import {
  useOnboardingFlow,
  useAutoStartGateway,
  useEnterKeySubmit,
  useStatusPolling
} from "../use-onboarding-effects";
import { useOnboardingViewModel } from "../use-onboarding-view-model";

export function OnboardingOrchestrator() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const { context, viewModel } = useOnboardingViewModel();

  useStatusPolling(presenter.status.refresh, viewModel.jobsRunning);
  useAutoStartGateway({
    autoStarted: viewModel.gateway.autoStarted,
    hasStatus: Boolean(status),
    cliInstalled: context.cliInstalled,
    quickstartRunning: viewModel.gateway.jobStatus === "running",
    gatewayOk: context.gatewayOk,
    startQuickstartJob: presenter.jobs.startQuickstartJob,
    setMessage: presenter.onboarding.setMessage,
    setAutoStarted: presenter.onboarding.setAutoStarted
  });
  useOnboardingFlow({
    hasStatus: Boolean(status),
    context,
    onStatusUpdate: presenter.onboarding.handleStatusUpdate
  });
  useEnterKeySubmit({
    currentStep: viewModel.currentStep,
    cliInstalled: context.cliInstalled,
    tokenInput: viewModel.token.value,
    aiKeyInput: viewModel.ai.value,
    pairingInput: viewModel.pairing.value,
    isProcessing: viewModel.cli.isProcessing,
    actions: presenter.onboarding
  });

  return null;
}
