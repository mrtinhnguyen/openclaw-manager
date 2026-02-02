import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Github } from "lucide-react";

const plans = [
  {
    name: "开源版",
    description: "完全免费，自主部署",
    price: "免费",
    period: "",
    features: [
      "本地部署运行",
      "数据完全自主",
      "Discord / WhatsApp / Telegram",
      "支持多种 AI 模型",
      "开源代码可审计",
      "社区支持"
    ],
    cta: "GitHub 下载",
    popular: false
  },
  {
    name: "托管版",
    description: "即将推出，敬请期待",
    price: "即将推出",
    period: "",
    features: [
      "云端一键部署",
      "自动更新维护",
      "多平台同时接入",
      "高级分析面板",
      "优先技术支持",
      "SLA 保障"
    ],
    cta: "预约体验",
    popular: true
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            开源<span className="text-gradient">免费</span>，自主可控
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            OpenClaw 完全开源免费，你可以自主部署，也可以选择未来的托管服务
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular 
                  ? "bg-surface border-accent/50 shadow-lg shadow-accent/10" 
                  : "bg-surface/30 border-line/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-accent text-white text-sm font-medium rounded-full">
                    即将推出
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-ink text-xl">{plan.name}</CardTitle>
                <p className="text-muted text-sm mt-1">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-ink">{plan.price}</span>
                  <span className="text-muted">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-ink/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.popular ? "default" : "secondary"}
                  className="w-full"
                >
                  {!plan.popular && <Github className="w-4 h-4 mr-2" />}
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
