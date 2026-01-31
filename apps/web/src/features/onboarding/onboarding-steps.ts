export type OnboardingStep =
  | "auth"
  | "cli"
  | "gateway"
  | "token"
  | "ai"
  | "pairing"
  | "probe"
  | "complete";

export const ONBOARDING_STEPS = [
  { id: "auth", label: "管理员登录", description: "保护控制台访问" },
  { id: "cli", label: "安装 CLI", description: "准备运行环境" },
  { id: "gateway", label: "启动网关", description: "自动启动本地服务" },
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
  authRequired: boolean;
  authHeader: string | null;
  cliInstalled: boolean;
  gatewayOk: boolean;
  tokenConfigured: boolean;
  aiConfigured: boolean;
  allowFromConfigured: boolean;
  probeOk: boolean;
}): OnboardingStep {
  const {
    authRequired,
    authHeader,
    cliInstalled,
    gatewayOk,
    tokenConfigured,
    aiConfigured,
    allowFromConfigured,
    probeOk
  } = params;
  if (authRequired && !authHeader) return "auth";
  if (!cliInstalled) return "cli";
  if (probeOk) return "complete";
  if (gatewayOk && tokenConfigured && !aiConfigured) return "ai";
  if (gatewayOk && tokenConfigured && aiConfigured && allowFromConfigured) return "probe";
  if (gatewayOk && tokenConfigured && aiConfigured) return "pairing";
  if (gatewayOk) return "token";
  return "gateway";
}
