import { useEffect, useState, type ReactNode } from "react";

import { AuthStep } from "@/components/wizard-steps";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { usePresenter } from "@/presenter/presenter-context";

import { useAuthStore } from "@/stores/auth-store";

export function AuthGate({ children }: { children: ReactNode }) {
  const presenter = usePresenter();
  const authHeader = useAuthStore((state) => state.authHeader);
  const authenticated = useAuthStore((state) => state.authenticated);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (authHeader || authenticated || sessionChecked) return;
    let active = true;
    (async () => {
      const result = await presenter.auth.checkSession();
      if (!active) return;
      if (!result.ok) {
        setMessage("登录验证失败，请稍后重试");
      }
    })();
    return () => {
      active = false;
    };
  }, [authHeader, authenticated, sessionChecked, presenter.auth]);

  if (authHeader || authenticated) {
    return <>{children}</>;
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-bg text-ink flex">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-hero-pattern opacity-90" />
          <div className="absolute left-[-20%] top-[-10%] h-96 w-96 rounded-full bg-accent/15 blur-[150px]" />
          <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-accent-2/20 blur-[140px]" />
        </div>

        <main className="relative flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-lg">
            <Card className="animate-fade-up overflow-hidden">
              <div className="space-y-4 p-10 text-center text-sm text-muted">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" />
                正在验证登录状态...
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim() || isProcessing) return;
    setIsProcessing(true);
    setMessage(null);
    const result = await presenter.auth.login(username, password);
    if (result.ok) {
      setMessage("登录成功，正在加载配置...");
      setPassword("");
      await presenter.status.refresh();
    } else {
      setMessage(`登录失败: ${result.error}`);
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-hero-pattern opacity-90" />
        <div className="absolute left-[-20%] top-[-10%] h-96 w-96 rounded-full bg-accent/15 blur-[150px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-accent-2/20 blur-[140px]" />
      </div>

      <main className="relative flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <Card className="animate-fade-up overflow-hidden">
            <AuthStep
              username={username}
              password={password}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              message={message}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}
