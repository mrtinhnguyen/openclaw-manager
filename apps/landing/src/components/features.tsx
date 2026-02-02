import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, 
  Shield, 
  Zap, 
  Lock,
  MessageSquare,
  Terminal,
  Cpu,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "本地优先",
    description: "在你自己的设备上运行，数据完全由你控制，无需担心隐私泄露。"
  },
  {
    icon: MessageSquare,
    title: "多渠道支持",
    description: "支持 Discord、WhatsApp、Telegram、Slack 等主流通讯平台。"
  },
  {
    icon: Bot,
    title: "AI 助手",
    description: "24/7 全天候 AI 助理，支持多种大语言模型，智能对话交互。"
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "端到端加密通信，开源代码可审计，确保数据和对话安全。"
  },
  {
    icon: Terminal,
    title: "一键部署",
    description: "简单的安装脚本，几分钟内完成部署，无需复杂的服务器配置。"
  },
  {
    icon: Cpu,
    title: "模型兼容",
    description: "支持 OpenAI、Claude、国产大模型等多种 AI 提供商。"
  },
  {
    icon: Zap,
    title: "实时响应",
    description: "优化的推理引擎，毫秒级响应速度，流畅的交互体验。"
  },
  {
    icon: Globe,
    title: "开源免费",
    description: "完全开源，GitHub 上超过 10 万 Star，社区驱动持续迭代。"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            为什么选择 <span className="text-gradient">OpenClaw</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            一款真正做事的 AI 助手，让你的智能助手触手可及
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group bg-surface/30 border-line/50 hover:bg-surface/50 hover:border-accent/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-ink text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
