import type { Hono } from "hono";

import type { ApiDeps } from "../deps.js";
import {
  createAuthLoginHandler,
  createAuthSessionHandler,
  createAuthStatusHandler
} from "../controllers/auth.controller.js";

export function registerAuthRoutes(app: Hono, deps: ApiDeps) {
  app.get("/api/auth/status", createAuthStatusHandler(deps));
  app.get("/api/auth/session", createAuthSessionHandler(deps));
  app.post("/api/auth/login", createAuthLoginHandler(deps));
}
