import type { StatusResponse } from "@/stores/status-store";

import { apiFetch } from "./api-client";

export type StatusFetchResult =
  | { ok: true; status: number; data: StatusResponse }
  | { ok: false; status: number; error: string };

export async function fetchStatus(params: { gatewayHost?: string; gatewayPort?: string }) {
  const query = new URLSearchParams({
    gatewayHost: params.gatewayHost ?? "127.0.0.1",
    gatewayPort: params.gatewayPort ?? "18789"
  });
  const res = await apiFetch(`/api/status?${query.toString()}`, {
    method: "GET"
  });
  if (!res.ok) {
    return { ok: false, status: res.status, error: `Status failed: ${res.status}` } as const;
  }
  const data = (await res.json()) as StatusResponse;
  return { ok: true, status: res.status, data } as const;
}

export async function startProcess(id: string) {
  const res = await apiFetch("/api/processes/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id })
  });
  return { ok: res.ok, status: res.status };
}

export async function stopProcess(id: string) {
  const res = await apiFetch("/api/processes/stop", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id })
  });
  return { ok: res.ok, status: res.status };
}

export async function setDiscordToken(token: string) {
  const res = await apiFetch("/api/discord/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token })
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) {
    return { ok: false, error: data?.error ?? `save failed: ${res.status}` };
  }
  return { ok: true };
}
