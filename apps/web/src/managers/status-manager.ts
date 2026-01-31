import { useStatusStore } from "@/stores/status-store";

export class StatusManager {
  refresh = async () => useStatusStore.getState().refresh();
  startProcess = async (id: string) => useStatusStore.getState().startProcess(id);
  stopProcess = async (id: string) => useStatusStore.getState().stopProcess(id);
  setDiscordToken = async (token: string) => useStatusStore.getState().setDiscordToken(token);
}
