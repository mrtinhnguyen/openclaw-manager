import { apiFetch } from "./api-client";

export type JobCreateResponse = {
  ok: boolean;
  jobId?: string;
  error?: string;
};

export async function createJob(endpoint: string, payload: Record<string, unknown>) {
  const res = await apiFetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = (await res.json().catch(() => null)) as JobCreateResponse | null;
  if (!res.ok || !data?.ok || !data.jobId) {
    return { ok: false, status: res.status, error: data?.error ?? "Job create failed" } as const;
  }
  return { ok: true, status: res.status, jobId: data.jobId } as const;
}
