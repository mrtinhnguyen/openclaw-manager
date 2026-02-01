export type OnboardingStep =
  | "cli"
  | "gateway"
  | "token"
  | "ai"
  | "pairing"
  | "probe"
  | "complete";

export const ONBOARDING_STEPS = [
  { id: "cli", label: "安装 CLI", description: "准备运行环境" },
  { id: "gateway", label: "验证网关", description: "确认本地服务可用" },
  { id: "token", label: "配置 Token", description: "连接 Discord Bot" },
  { id: "ai", label: "配置 AI", description: "启用模型能力" },
  { id: "pairing", label: "配对验证", description: "授权用户访问" },
  { id: "probe", label: "通道探测", description: "验证通道连接" },
  { id: "complete", label: "开始使用", description: "一切就绪" }
] as const satisfies readonly {
  id: OnboardingStep;
  label: string;
  description: string;
}[];

const stepOrder: OnboardingStep[] = ONBOARDING_STEPS.map((step) => step.id);
const stepMeta = new Map(ONBOARDING_STEPS.map((step) => [step.id, step]));

export function stepIndex(step: OnboardingStep) {
  return stepOrder.indexOf(step);
}

export function getOnboardingStepMeta(step: OnboardingStep) {
  return stepMeta.get(step) ?? { id: step, label: step, description: "" };
}

export function resolveNextStep(params: {
  cliInstalled: boolean;
  gatewayOk: boolean;
  gatewayVerified: boolean;
  tokenConfirmed: boolean;
  aiConfirmed: boolean;
  pairingConfirmed: boolean;
  probeConfirmed: boolean;
}): OnboardingStep {
  const {
    cliInstalled,
    gatewayOk,
    gatewayVerified,
    tokenConfirmed,
    aiConfirmed,
    pairingConfirmed,
    probeConfirmed
  } = params;
  const gatewayReady = gatewayOk || gatewayVerified;
  if (!cliInstalled) return "cli";
  if (probeConfirmed) return "complete";
  if (gatewayReady && tokenConfirmed && !aiConfirmed) return "ai";
  if (gatewayReady && tokenConfirmed && aiConfirmed && pairingConfirmed) return "probe";
  if (gatewayReady && tokenConfirmed && aiConfirmed) return "pairing";
  if (gatewayReady) return "token";
  return "gateway";
}
