import { fetchStatus, setDiscordToken, startProcess, stopProcess } from "@/services/status-service";
import { useAuthStore } from "@/stores/auth-store";
import { useConfigStore } from "@/stores/config-store";
import { useStatusStore } from "@/stores/status-store";

export class StatusManager {
  refresh = async () => {
    const statusStore = useStatusStore.getState();
    const authStore = useAuthStore.getState();
    const config = useConfigStore.getState();
    statusStore.setLoading(true);
    statusStore.setError(null);
    const result = await fetchStatus({
      gatewayHost: config.gatewayHost,
      gatewayPort: config.gatewayPort
    });
    if (!result.ok) {
      if (result.status === 401) {
        authStore.clearAuth();
        statusStore.setError("需要登录");
      } else {
        statusStore.setError(result.error);
      }
      statusStore.setLoading(false);
      return;
    }
    statusStore.setStatusData(result.data);
    statusStore.setLoading(false);
  };

  startProcess = async (id: string) => {
    await startProcess(id);
    await this.refresh();
  };

  stopProcess = async (id: string) => {
    await stopProcess(id);
    await this.refresh();
  };

  setDiscordToken = async (token: string) => {
    const result = await setDiscordToken(token);
    await this.refresh();
    return result;
  };
}

export const statusManager = new StatusManager();
