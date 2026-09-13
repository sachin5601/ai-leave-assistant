// ============================================================
// Centralized environment configuration
// ------------------------------------------------------------
// All n8n webhook URLs and runtime flags are read here once.
// Components and services import from this module — never from
// import.meta.env directly — so there is a single source of truth.
// ============================================================

const env = import.meta.env;

const MISSING = "(not-configured)";

export const config = {
  demoMode: (env.VITE_DEMO_MODE ?? "true").toLowerCase() === "true",
  timeoutMs: Number(env.VITE_API_TIMEOUT_MS ?? 30000),

  endpoints: {
    auth: env.VITE_N8N_AUTH_URL || MISSING,
    chat: env.VITE_N8N_CHAT_URL || MISSING,
    profile: env.VITE_N8N_PROFILE_URL || MISSING,
    leaveSummary: env.VITE_N8N_LEAVE_SUMMARY_URL || MISSING,
    leaveHistory: env.VITE_N8N_LEAVE_HISTORY_URL || MISSING,
    policies: env.VITE_N8N_POLICY_URL || MISSING,
    sessionValidate: env.VITE_N8N_SESSION_VALIDATE_URL || MISSING,
  },
} as const;

export type EndpointName = keyof typeof config.endpoints;

export function isEndpointConfigured(name: EndpointName): boolean {
  const url = config.endpoints[name];
  return Boolean(url) && url !== MISSING && url.startsWith("http");
}
