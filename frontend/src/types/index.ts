// ============================================================
// Shared application types
// ============================================================

export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
}

export interface LeaveSummary {
  totalBalance: number | null;
  sickLeave: number | null;
  casualLeave: number | null;
  usedLeave: number | null;
  remainingLeave: number | null;
}

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveRecord {
  requestId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  manager: string;
}

export interface PolicySection {
  id: string;
  title: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: "sending" | "sent" | "error";
  emailSent?: boolean;
}

export interface AuthSession {
  sessionId: string;
  employeeId: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
}

export interface LoginCredentials {
  employeeId: string;
  password: string;
}

export interface LoginResponse {
  sessionId: string;
  employeeId: string;
  name: string;
  expiresAt?: number;
}

export interface ApiError {
  message: string;
  code?: string;
}
