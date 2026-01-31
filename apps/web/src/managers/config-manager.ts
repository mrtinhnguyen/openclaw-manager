import { useConfigStore } from "@/stores/config-store";

export class ConfigManager {
  setApiBase = (value: string) => useConfigStore.getState().setApiBase(value);
  setGatewayHost = (value: string) => useConfigStore.getState().setGatewayHost(value);
  setGatewayPort = (value: string) => useConfigStore.getState().setGatewayPort(value);
  setAuthHeader = (value: string | null) => useConfigStore.getState().setAuthHeader(value);
  setAuthState = (required: boolean) => useConfigStore.getState().setAuthState(required);
  clearAuth = () => useConfigStore.getState().clearAuth();
  checkAuth = async () => useConfigStore.getState().checkAuth();
  login = async (username: string, password: string) =>
    useConfigStore.getState().login(username, password);
}
