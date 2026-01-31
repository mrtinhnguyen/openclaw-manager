import { useJobsStore } from "@/stores/jobs-store";

export class JobsManager {
  startCliInstallJob = async () => useJobsStore.getState().startCliInstallJob();
  startQuickstartJob = async (opts: { runProbe?: boolean; startGateway?: boolean }) =>
    useJobsStore.getState().startQuickstartJob(opts);
  startPairingJob = async (code: string) => useJobsStore.getState().startPairingJob(code);
  startResourceDownloadJob = async (opts?: { url?: string; filename?: string }) =>
    useJobsStore.getState().startResourceDownloadJob(opts);
  startAiAuthJob = async (provider: string, apiKey: string) =>
    useJobsStore.getState().startAiAuthJob(provider, apiKey);
}
