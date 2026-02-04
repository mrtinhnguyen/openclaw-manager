import type { Handler } from "hono";

import type { ApiDeps } from "../deps.js";
import {
  createCliInstallJob,
  createAiAuthJob,
  createDiscordPairingJob,
  createDiscordPairingWaitJob,
  createQuickstartJob,
  createResourceDownloadJob,
  createCryptoSkillInstallJob
} from "../services/jobs.service.js";
import type { JobEvent } from "../lib/jobs.js";
import type { QuickstartRequest } from "../services/quickstart.service.js";

export function createCliInstallJobHandler(deps: ApiDeps): Handler {
  return () => {
    const jobId = createCliInstallJob(deps);
    return new Response(JSON.stringify({ ok: true, jobId }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
}

export function createQuickstartJobHandler(deps: ApiDeps): Handler {
  return async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as QuickstartRequest;
    const jobId = createQuickstartJob(deps, body);
    return c.json({ ok: true, jobId });
  };
}

export function createDiscordPairingJobHandler(deps: ApiDeps): Handler {
  return async (c) => {
    const body = await c.req.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    if (!code) return c.json({ ok: false, error: "missing code" }, 400);
    const jobId = createDiscordPairingJob(deps, code);
    return c.json({ ok: true, jobId });
  };
}

export function createDiscordPairingWaitJobHandler(deps: ApiDeps): Handler {
  return async (c) => {
    const body = await c.req.json().catch(() => null);
    const timeoutMs = body?.timeoutMs;
    const pollMs = body?.pollMs;
    const notify = Boolean(body?.notify);
    const jobId = createDiscordPairingWaitJob(deps, { timeoutMs, pollMs, notify });
    return c.json({ ok: true, jobId });
  };
}

export function createResourceDownloadJobHandler(deps: ApiDeps): Handler {
  return async (c) => {
    const body = await c.req.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url.trim() : undefined;
    const filename = typeof body?.filename === "string" ? body.filename.trim() : undefined;
    const jobId = createResourceDownloadJob(deps, { url, filename });
    return c.json({ ok: true, jobId });
  };
}

export function createCryptoSkillInstallJobHandler(deps: ApiDeps): Handler {
  return async (c) => {
    const body = await c.req.json().catch(() => null);
    const skills = Array.isArray(body?.skills) ? body.skills : [];
    const jobId = createCryptoSkillInstallJob(deps, skills);
    return c.json({ ok: true, jobId });
  };
}

export function createAiAuthJobHandler(deps: ApiDeps): Handler {
  return async (c) => {
    const body = await c.req.json().catch(() => null);
    const provider = typeof body?.provider === "string" ? body.provider.trim() : "";
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
    if (!provider) return c.json({ ok: false, error: "missing provider" }, 400);
    if (!apiKey) return c.json({ ok: false, error: "missing apiKey" }, 400);
    const jobId = createAiAuthJob(deps, { provider, apiKey });
    return c.json({ ok: true, jobId });
  };
}

export function createJobStatusHandler(deps: ApiDeps): Handler {
  return (c) => {
    const jobId = c.req.param("id");
    const job = deps.jobStore.getJob(jobId);
    if (!job) {
      return c.json({ ok: false, error: "not found" }, 404);
    }
    return c.json({ ok: true, job });
  };
}

export function createJobStreamHandler(deps: ApiDeps): Handler {
  return (c) => {
    const jobId = c.req.param("id");
    const job = deps.jobStore.getJob(jobId);
    if (!job) {
      return c.json({ ok: false, error: "not found" }, 404);
    }

    const encoder = new TextEncoder();
    let closed = false;
    let cleanup = () => {};
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const closeStream = () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {
            // ignore double close
          }
          cleanup();
        };

        const send = (event: string, data: Record<string, unknown>) => {
          if (closed) return;
          const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
          try {
            controller.enqueue(encoder.encode(payload));
          } catch {
            closeStream();
          }
        };

        send("status", {
          status: job.status,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          endedAt: job.endedAt
        });

        for (const line of job.logs) {
          send("log", { message: line });
        }

        if (job.status === "success") {
          send("done", { result: job.result ?? null });
          closeStream();
          return;
        }
        if (job.status === "failed") {
          send("error", { error: job.error ?? "failed" });
          closeStream();
          return;
        }

        const unsubscribe = deps.jobStore.subscribe(jobId, (event: JobEvent) => {
          if (event.type === "log") {
            send("log", { message: event.message });
          } else if (event.type === "status") {
            send("status", { status: event.status });
          } else if (event.type === "done") {
            send("done", { result: event.result ?? null });
            closeStream();
          } else if (event.type === "error") {
            send("error", { error: event.error });
            closeStream();
          }
        });

        const keepAlive = setInterval(() => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(": keep-alive\n\n"));
          } catch {
            closeStream();
          }
        }, 15000);

        const signal = c.req.raw.signal;
        if (signal) {
          if (signal.aborted) {
            closeStream();
            return;
          }
          signal.addEventListener("abort", closeStream, { once: true });
          cleanup = () => {
            clearInterval(keepAlive);
            unsubscribe();
            signal.removeEventListener("abort", closeStream);
          };
        } else {
          cleanup = () => {
            clearInterval(keepAlive);
            unsubscribe();
          };
        }
      },
      cancel() {
        if (closed) return;
        closed = true;
        cleanup();
      }
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive"
      }
    });
  };
}
