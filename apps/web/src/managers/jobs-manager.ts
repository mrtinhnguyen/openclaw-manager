import { buildApiUrl, getAuthHeader } from "@/services/api-client";
import { streamJobEvents, type JobStreamEvent } from "@/services/job-stream";
import { createJob } from "@/services/jobs-service";
import { useJobsStore, type JobKey, type JobState } from "@/stores/jobs-store";

import { statusManager } from "./status-manager";

type RunJobOptions = {
  jobKey: JobKey;
  endpoint: string;
  payload: Record<string, unknown>;
  withResult: boolean;
};

export class JobsManager {
  startCliInstallJob = async () =>
    this.runJob({
      jobKey: "cli",
      endpoint: "/api/jobs/cli-install",
      payload: {},
      withResult: true
    });

  startQuickstartJob = async (opts: { runProbe?: boolean; startGateway?: boolean }) => {
    const result = await this.runJob({
      jobKey: "quickstart",
      endpoint: "/api/jobs/quickstart",
      payload: {
        runProbe: Boolean(opts?.runProbe),
        startGateway: opts?.startGateway !== false
      },
      withResult: true
    });
    return {
      ok: result.ok,
      error: result.error,
      result: useJobsStore.getState().quickstart.result
    };
  };

  startPairingJob = async (code: string) =>
    this.runJob({
      jobKey: "pairing",
      endpoint: "/api/jobs/discord/pairing",
      payload: { code },
      withResult: false
    });

  startResourceDownloadJob = async (opts?: { url?: string; filename?: string }) =>
    this.runJob({
      jobKey: "resource",
      endpoint: "/api/jobs/resources/download",
      payload: { url: opts?.url, filename: opts?.filename },
      withResult: true
    });

  startAiAuthJob = async (provider: string, apiKey: string) =>
    this.runJob({
      jobKey: "aiAuth",
      endpoint: "/api/jobs/ai/auth",
      payload: { provider, apiKey },
      withResult: true
    });

  startCryptoSkillInstallJob = async (skills: string[]) =>
    this.runJob({
      jobKey: "cryptoSkills",
      endpoint: "/api/jobs/crypto/install-skills",
      payload: { skills },
      withResult: true
    });

  private runJob = async (options: RunJobOptions): Promise<{ ok: boolean; error?: string }> => {
    const jobsStore = useJobsStore.getState();
    jobsStore.updateJob(options.jobKey, (job) => ({
      ...job,
      status: "running",
      logs: [],
      error: null,
      result: null,
      jobId: null
    }));

    const created = await createJob(options.endpoint, options.payload);
    if (!created.ok || !created.jobId) {
      const message = created.error ?? "Job create failed";
      jobsStore.updateJob(options.jobKey, (job) => ({
        ...job,
        status: "failed",
        error: message
      }));
      return { ok: false, error: message };
    }

    jobsStore.updateJob(options.jobKey, (job) => ({
      ...job,
      jobId: created.jobId
    }));

    try {
      await streamJobEvents(
        buildApiUrl(`/api/jobs/${created.jobId}/stream`),
        getAuthHeader(),
        (event) => {
          jobsStore.updateJob(options.jobKey, (job) =>
            reduceJobEvent(job, event, options.withResult)
          );
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      jobsStore.updateJob(options.jobKey, (job) => ({
        ...job,
        status: "failed",
        error: message
      }));
      return { ok: false, error: message };
    }

    await statusManager.refresh();

    const resolved = useJobsStore.getState()[options.jobKey];
    if (resolved.status === "failed") {
      return { ok: false, error: resolved.error ?? "Job failed" };
    }
    return { ok: true };
  };
}

function reduceJobEvent<T>(
  current: JobState<T>,
  event: JobStreamEvent,
  withResult: boolean
): JobState<T> {
  if (event.type === "log") {
    return { ...current, logs: [...current.logs, event.message].slice(-200) };
  }
  if (event.type === "status") {
    if (event.status === "success") {
      return { ...current, status: "success" };
    }
    if (event.status === "failed") {
      return { ...current, status: "failed" };
    }
    return { ...current, status: "running" };
  }
  if (event.type === "done") {
    return {
      ...current,
      status: "success",
      result: (withResult ? (event.result as T) : current.result) ?? null
    };
  }
  if (event.type === "error") {
    return { ...current, status: "failed", error: event.error };
  }
  return current;
}

export const jobsManager = new JobsManager();
