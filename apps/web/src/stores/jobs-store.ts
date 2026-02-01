import { create } from "zustand";

export type JobStatus = "idle" | "running" | "success" | "failed";

export type JobState<T = unknown> = {
  jobId: string | null;
  status: JobStatus;
  logs: string[];
  error: string | null;
  result: T | null;
};

export type QuickstartResult = {
  gatewayReady?: boolean;
  probeOk?: boolean;
};

export type JobsState = {
  cli: JobState<{ version?: string | null }>;
  quickstart: JobState<QuickstartResult>;
  pairing: JobState<{ code?: string }>;
  resource: JobState<{ path?: string }>;
  aiAuth: JobState<{ provider?: string }>;
  updateJob: (jobKey: JobKey, updater: (job: JobState) => JobState) => void;
  resetJob: (jobKey: JobKey) => void;
};

export type JobKey = "cli" | "quickstart" | "pairing" | "resource" | "aiAuth";

const emptyJob = <T,>(): JobState<T> => ({
  jobId: null,
  status: "idle",
  logs: [],
  error: null,
  result: null
});

export const useJobsStore = create<JobsState>((set) => ({
  cli: emptyJob(),
  quickstart: emptyJob(),
  pairing: emptyJob(),
  resource: emptyJob(),
  aiAuth: emptyJob(),
  updateJob: (jobKey, updater) =>
    set((state) => ({
      ...state,
      [jobKey]: updater(state[jobKey] as JobState)
    })),
  resetJob: (jobKey) =>
    set((state) => ({
      ...state,
      [jobKey]: emptyJob()
    }))
}));
