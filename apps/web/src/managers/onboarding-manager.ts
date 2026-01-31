import type { OnboardingContext } from "@/features/onboarding/domain/context";
import {
  requestOnboardingConfirmation,
  syncOnboardingFlow,
  type OnboardingFlowState
} from "@/features/onboarding/domain/machine";
import type { OnboardingStep } from "@/features/onboarding/onboarding-steps";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

export class OnboardingManager {
  setTokenInput = (value: string) => useOnboardingStore.getState().setTokenInput(value);
  setAiProvider = (value: string) => useOnboardingStore.getState().setAiProvider(value);
  setAiKeyInput = (value: string) => useOnboardingStore.getState().setAiKeyInput(value);
  setPairingInput = (value: string) => useOnboardingStore.getState().setPairingInput(value);
  setMessage = (value: string | null) => useOnboardingStore.getState().setMessage(value);
  setAiMessage = (value: string | null) => useOnboardingStore.getState().setAiMessage(value);
  setCliMessage = (value: string | null) => useOnboardingStore.getState().setCliMessage(value);
  setProbeMessage = (value: string | null) => useOnboardingStore.getState().setProbeMessage(value);
  setResourceMessage = (value: string | null) =>
    useOnboardingStore.getState().setResourceMessage(value);
  setIsProcessing = (value: boolean) => useOnboardingStore.getState().setIsProcessing(value);
  setAutoStarted = (value: boolean) => useOnboardingStore.getState().setAutoStarted(value);

  handleStatusUpdate = (context: OnboardingContext) => {
    const onboarding = useOnboardingStore.getState();
    const previousPending = onboarding.pendingStep;
    const nextFlow = syncOnboardingFlow(getFlowState(onboarding), context);
    onboarding.setFlowState(nextFlow);
    if (previousPending && !nextFlow.pendingStep) {
      clearPendingMessages(previousPending, onboarding);
    }
  };

  handleCliInstall = async () => {
    const onboarding = useOnboardingStore.getState();
    onboarding.setIsProcessing(true);
    onboarding.setCliMessage("正在启动安装任务...");
    const result = await useJobsStore.getState().startCliInstallJob();
    if (!result.ok) {
      onboarding.setCliMessage(`安装失败: ${result.error}`);
    } else {
      onboarding.setCliMessage("安装完成，等待系统确认...");
      applyPendingStep(onboarding, "cli");
    }
    onboarding.setIsProcessing(false);
  };

  handleTokenSubmit = async () => {
    const onboarding = useOnboardingStore.getState();
    const token = onboarding.inputs.tokenInput;
    if (!token.trim()) return;
    onboarding.setIsProcessing(true);
    onboarding.setMessage(null);
    const result = await useStatusStore.getState().setDiscordToken(token);
    if (result.ok) {
      onboarding.setTokenInput("");
      onboarding.setMessage("Token 已保存，等待系统确认...");
      applyPendingStep(onboarding, "token");
    } else {
      onboarding.setMessage(`保存失败: ${result.error}`);
    }
    onboarding.setIsProcessing(false);
  };

  handleAiSubmit = async () => {
    const onboarding = useOnboardingStore.getState();
    const apiKey = onboarding.inputs.aiKeyInput.trim();
    if (!apiKey) return;
    onboarding.setIsProcessing(true);
    onboarding.setAiMessage(null);
    const result = await useJobsStore.getState().startAiAuthJob(
      onboarding.inputs.aiProvider,
      apiKey
    );
    if (result.ok) {
      onboarding.setAiKeyInput("");
      onboarding.setAiMessage("AI 凭证已保存，等待系统确认...");
      applyPendingStep(onboarding, "ai");
    } else {
      onboarding.setAiMessage(`配置失败: ${result.error}`);
    }
    onboarding.setIsProcessing(false);
  };

  handlePairingSubmit = async () => {
    const onboarding = useOnboardingStore.getState();
    const code = onboarding.inputs.pairingInput;
    if (!code.trim()) return;
    onboarding.setIsProcessing(true);
    onboarding.setMessage(null);
    onboarding.setProbeMessage(null);
    const result = await useJobsStore.getState().startPairingJob(code);
    if (result.ok) {
      onboarding.setPairingInput("");
      onboarding.setMessage("配对成功，等待系统确认...");
      applyPendingStep(onboarding, "pairing");
      const probe = await useJobsStore.getState().startQuickstartJob({
        runProbe: true,
        startGateway: true
      });
      if (probe.ok && probe.result?.probeOk) {
        onboarding.setProbeMessage("通道探测通过。");
      } else if (probe.ok) {
        onboarding.setProbeMessage("通道探测未通过，请重试。");
      } else {
        onboarding.setProbeMessage(`通道探测失败: ${probe.error ?? "unknown"}`);
      }
    } else {
      onboarding.setMessage(`配对失败: ${result.error}`);
    }
    onboarding.setIsProcessing(false);
  };

  handleRetry = async () => {
    const onboarding = useOnboardingStore.getState();
    onboarding.setIsProcessing(true);
    onboarding.setMessage("正在重启网关...");
    const result = await useJobsStore.getState().startQuickstartJob({
      startGateway: true,
      runProbe: false
    });
    if (!result.ok) {
      onboarding.setMessage(`启动失败: ${result.error}`);
    } else if (result.result?.gatewayReady) {
      onboarding.setMessage("网关已就绪，等待系统确认...");
      applyPendingStep(onboarding, "gateway");
    } else {
      onboarding.setMessage("网关正在启动中...");
    }
    onboarding.setIsProcessing(false);
  };

  handleProbe = async () => {
    const onboarding = useOnboardingStore.getState();
    onboarding.setIsProcessing(true);
    onboarding.setProbeMessage("正在探测通道...");
    const probe = await useJobsStore.getState().startQuickstartJob({
      runProbe: true,
      startGateway: true
    });
    if (probe.ok && probe.result?.probeOk) {
      onboarding.setProbeMessage("通道探测通过，等待系统确认...");
      applyPendingStep(onboarding, "probe");
    } else if (probe.ok) {
      onboarding.setProbeMessage("通道探测未通过，请重试。");
    } else {
      onboarding.setProbeMessage(`通道探测失败: ${probe.error ?? "unknown"}`);
    }
    onboarding.setIsProcessing(false);
  };

  handleResourceDownload = async () => {
    const onboarding = useOnboardingStore.getState();
    onboarding.setResourceMessage("正在下载资源...");
    const result = await useJobsStore.getState().startResourceDownloadJob();
    if (result.ok) {
      onboarding.setResourceMessage("资源下载完成。");
    } else {
      onboarding.setResourceMessage(`下载失败: ${result.error}`);
    }
    return result;
  };
}

function getFlowState(onboarding: ReturnType<typeof useOnboardingStore.getState>): OnboardingFlowState {
  return {
    currentStep: onboarding.currentStep,
    systemStep: onboarding.systemStep,
    pendingStep: onboarding.pendingStep,
    pendingSince: onboarding.pendingSince,
    blockingReason: onboarding.blockingReason
  };
}

function applyPendingStep(
  onboarding: ReturnType<typeof useOnboardingStore.getState>,
  step: OnboardingStep
) {
  const nextFlow = requestOnboardingConfirmation(getFlowState(onboarding), step);
  onboarding.setFlowState(nextFlow);
}

function clearPendingMessages(
  step: OnboardingStep,
  onboarding: ReturnType<typeof useOnboardingStore.getState>
) {
  if (step === "cli") {
    onboarding.setCliMessage("CLI 已确认，继续下一步。");
    return;
  }
  if (step === "ai") {
    onboarding.setAiMessage("AI 配置已确认。");
    return;
  }
  if (step === "probe") {
    onboarding.setProbeMessage("通道状态已确认。");
    return;
  }
  if (step === "token") {
    onboarding.setMessage("Token 已确认。");
    return;
  }
  if (step === "pairing") {
    onboarding.setMessage("配对已确认。");
    return;
  }
  if (step === "gateway") {
    onboarding.setMessage("网关状态已确认。");
  }
}
