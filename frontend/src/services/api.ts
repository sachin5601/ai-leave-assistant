// ============================================================
// Centralized API service
// ------------------------------------------------------------
// Every network call to the n8n backend goes through this module.
// UI components never call fetch() directly — they call these
// functions. This keeps n8n URL management, error normalization,
// and demo-mode fallback in one auditable place.
//
// When VITE_DEMO_MODE is "true", these functions return local
// demo data instead of calling n8n. Set it to "false" once your
// n8n webhooks are live.
// ============================================================

import { config, isEndpointConfigured, type EndpointName } from "@/config/env";
import {
  demoCredentials,
  demoEmployee,
  demoLeaveHistory,
  demoLeaveSummary,
  demoPolicies,
} from "@/data/demoData";
import type {
  AuthSession,
  Employee,
  LeaveRecord,
  LeaveSummary,
  LoginCredentials,
  PolicySection,
} from "@/types";

// ---------- helpers ----------

interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal;
}

function friendlyError(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "The request timed out. Please try again.";
  }

  if (err instanceof TypeError) {
    return "Unable to reach the HR service. Please check your connection and try again.";
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "An unexpected error occurred. Please try again.";
}

async function n8nRequest<T>(
  endpoint: EndpointName,
  payload: unknown,
  session: AuthSession | null,
  options: RequestOptions = {},
): Promise<T> {
  const url = config.endpoints[endpoint];

  if (!isEndpointConfigured(endpoint)) {
    throw new Error(
      "This service is not yet connected to the n8n backend. Please contact HR or check back later.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session) {
      headers["X-Session-Id"] = session.sessionId;
      headers["X-Employee-Id"] = session.employeeId;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sessionId: session?.sessionId ?? null,
        employeeId: session?.employeeId ?? null,
        ...((payload as Record<string, unknown>) ?? {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          "Your session is no longer valid. Please log in again.",
        );
      }

      if (res.status >= 500) {
        throw new Error(
          "The HR service is temporarily unavailable. Please try again shortly.",
        );
      }

      throw new Error(
        "The request could not be completed. Please try again.",
      );
    }

    const data = await res.json();

    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- API surface ----------

export const api = {
  // ---- Authentication ----
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (config.demoMode) {
      await delay(600);

      if (
        credentials.employeeId.trim().toUpperCase() ===
          demoCredentials.employeeId &&
        credentials.password === demoCredentials.password
      ) {
        const now = Date.now();

        return {
          sessionId: `demo-session-${now}`,
          employeeId: demoEmployee.employeeId,
          name: demoEmployee.name,
          issuedAt: now,
          expiresAt: now + 8 * 60 * 60 * 1000,
        };
      }

      throw new Error("Invalid Employee ID or password. Please try again.");
    }

    interface N8nAuthResponse {
      sessionId?: string;
      session_id?: string;
      employeeId?: string;
      employee_id?: string;
      name?: string;
      expiresAt?: number;
      expires_at?: number;
      success?: boolean;
      error?: string;
    }

    const data = await n8nRequest<N8nAuthResponse>(
      "auth",
      {
        employeeId: credentials.employeeId,
        password: credentials.password,
      },
      null,
    );

    if (data.success === false) {
      throw new Error(data.error || "Invalid Employee ID or password.");
    }

    const sessionId = data.sessionId ?? data.session_id;
    const employeeId = data.employeeId ?? data.employee_id;

    if (!sessionId || !employeeId) {
      throw new Error("Authentication failed. Please try again.");
    }

    const now = Date.now();

    return {
      sessionId,
      employeeId,
      name: data.name ?? "",
      issuedAt: now,
      expiresAt:
        data.expiresAt ??
        data.expires_at ??
        now + 8 * 60 * 60 * 1000,
    };
  },

  // ---- Chat ----
  // Always calls the real n8n webhook — does not fall back to demo mode.
  async sendChatMessage(
    session: AuthSession,
    message: string,
  ): Promise<{ reply: string }> {
    const url = config.endpoints.chat;

    if (!isEndpointConfigured("chat")) {
      throw new Error(
        "The HR Assistant is not yet connected. Please contact HR or check back later.",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      config.timeoutMs,
    );

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId: session.sessionId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Your session is no longer valid. Please log in again.",
          );
        }

        if (res.status >= 500) {
          throw new Error(
            "The HR Assistant is temporarily unavailable. Please try again shortly.",
          );
        }

        throw new Error(
          "The request could not be completed. Please try again.",
        );
      }

      const text = await res.text();

      try {
        const data = JSON.parse(text) as {
          reply?: string;
          error?: string;
        };

        if (data.error) {
          throw new Error(data.error);
        }

        return {
          reply: data.reply ?? "",
        };
      } catch {
        return {
          reply: text,
        };
      }
    } finally {
      clearTimeout(timeout);
    }
  },

  // ---- Profile ----
  async getProfile(session: AuthSession): Promise<Employee> {
    if (config.demoMode) {
      await delay(500);
      return demoEmployee;
    }

    interface N8nProfileResponse {
      employeeId?: string;
      employee_id?: string;
      name?: string;
      email?: string;
      department?: string;
      managerId?: string;
      manager_id?: string;
      managerName?: string;
      manager_name?: string;
      managerEmail?: string;
      manager_email?: string;
      error?: string;
    }

    const data = await n8nRequest<N8nProfileResponse>(
      "profile",
      {},
      session,
    );

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      employeeId:
        data.employeeId ??
        data.employee_id ??
        session.employeeId,
      name: data.name ?? "",
      email: data.email ?? "",
      department: data.department ?? "",
      managerId:
        data.managerId ??
        data.manager_id ??
        "",
      managerName:
        data.managerName ??
        data.manager_name ??
        "",
      managerEmail:
        data.managerEmail ??
        data.manager_email ??
        "",
    };
  },

  // ---- Leave Summary ----
  // Calls the dedicated n8n Leave Summary webhook through the centralized request helper.
  async getLeaveSummary(session: AuthSession): Promise<LeaveSummary> {
    interface N8nLeaveSummaryResponse {
      totalLeaveBalance?: number | string;
      sickLeave?: number | string;
      casualLeave?: number | string;
      usedLeave?: number | string;
      remainingLeave?: number | string;
      error?: string;
    }

    const data = await n8nRequest<N8nLeaveSummaryResponse>(
      "leaveSummary",
      {},
      session,
    );

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      totalBalance: Number(data.totalLeaveBalance ?? 0),
      sickLeave: Number(data.sickLeave ?? 0),
      casualLeave: Number(data.casualLeave ?? 0),
      usedLeave: Number(data.usedLeave ?? 0),
      remainingLeave: Number(data.remainingLeave ?? 0),
    };
  },

  // ---- Leave History ----
  async getLeaveHistory(
    session: AuthSession,
  ): Promise<LeaveRecord[]> {
    if (config.demoMode) {
      await delay(500);
      return demoLeaveHistory;
    }

    interface N8nLeaveHistoryResponse {
      records?: LeaveRecord[];
      history?: LeaveRecord[];
      data?: LeaveRecord[];
      error?: string;
    }

    const data = await n8nRequest<N8nLeaveHistoryResponse>(
      "leaveHistory",
      {},
      session,
    );

    if (data.error) {
      throw new Error(data.error);
    }

    return (
      data.records ??
      data.history ??
      data.data ??
      []
    );
  },

  // ---- Policies ----
  async getPolicies(
    session: AuthSession,
    query?: string,
  ): Promise<PolicySection[]> {
    if (config.demoMode) {
      await delay(400);

      if (query) {
        const q = query.toLowerCase();

        return demoPolicies.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q),
        );
      }

      return demoPolicies;
    }

    interface N8nPolicyResponse {
      policies?: PolicySection[];
      sections?: PolicySection[];
      data?: PolicySection[];
      error?: string;
    }

    const data = await n8nRequest<N8nPolicyResponse>(
      "policies",
      query ? { query } : {},
      session,
    );

    if (data.error) {
      throw new Error(data.error);
    }

    return (
      data.policies ??
      data.sections ??
      data.data ??
      []
    );
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseLeaveSummaryFromText(
  text: string,
): LeaveSummary {
  const find = (
    patterns: RegExp[],
  ): number | null => {
    for (const p of patterns) {
      const m = text.match(p);

      if (m && m[1]) {
        const n = parseInt(m[1], 10);

        if (!isNaN(n)) {
          return n;
        }
      }
    }

    return null;
  };

  const sick = find([
    /sick\s*leave[s]?\s*(?:balance|remaining|available|:)?\s*[:\-]?\s*(?:\*\*)?\s*(\d+)\s*(?:\*\*)?\s*(?:days?|day)?/i,
    /(\d+)\s*(?:days?\s*of\s*)?sick\s*leave/i,
  ]);

  const casual = find([
    /casual\s*leave[s]?\s*(?:balance|remaining|available|:)?\s*[:\-]?\s*(?:\*\*)?\s*(\d+)\s*(?:\*\*)?\s*(?:days?|day)?/i,
    /(\d+)\s*(?:days?\s*of\s*)?casual\s*leave/i,
  ]);

  const total = find([
    /total\s*(?:leave\s*)?(?:balance|remaining|available|:)?\s*[:\-]?\s*(?:\*\*)?\s*(\d+)\s*(?:\*\*)?\s*(?:days?|day)?/i,
    /(\d+)\s*(?:days?\s*of\s*)?(?:total\s*)?leave\s*(?:balance|days|remaining)/i,
  ]);

  const used = find([
    /used\s*leave[s]?\s*(?:balance|:)?\s*[:\-]?\s*(?:\*\*)?\s*(\d+)\s*(?:\*\*)?\s*(?:days?|day)?/i,
    /(\d+)\s*(?:days?\s*of\s*)?used\s*leave/i,
  ]);

  const remaining =
    total != null
      ? total
      : sick != null && casual != null
        ? sick + casual
        : null;

  return {
    totalBalance:
      total ??
      (sick != null && casual != null
        ? sick + casual
        : null),
    sickLeave: sick,
    casualLeave: casual,
    usedLeave: used,
    remainingLeave: remaining,
  };
}

export { friendlyError };