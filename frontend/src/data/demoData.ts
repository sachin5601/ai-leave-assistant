// ============================================================
// Demo data — used ONLY when VITE_DEMO_MODE is "true"
// ------------------------------------------------------------
// These values populate the UI while n8n endpoints are not yet
// connected. They are NOT used in authentication or business
// logic. The real application retrieves employee data dynamically
// from the n8n backend.
// ============================================================

import type {
  Employee,
  LeaveRecord,
  LeaveSummary,
  PolicySection,
} from "@/types";

export const demoEmployee: Employee = {
  employeeId: "EMP001",
  name: "Rohit Sharma",
  email: "rohit.sharma@company.com",
  department: "Engineering",
  managerId: "MGR001",
  managerName: "Anita Desai",
  managerEmail: "anita.desai@company.com",
};

export const demoLeaveSummary: LeaveSummary = {
  totalBalance: 12,
  sickLeave: 5,
  casualLeave: 7,
  usedLeave: 8,
  remainingLeave: 12,
};

export const demoLeaveHistory: LeaveRecord[] = [
  {
    requestId: "LR-2026-0042",
    leaveType: "Sick Leave",
    startDate: "2026-08-12",
    endDate: "2026-08-13",
    reason: "Flu symptoms, advised rest by doctor.",
    status: "Approved",
    manager: "Anita Desai",
  },
  {
    requestId: "LR-2026-0038",
    leaveType: "Casual Leave",
    startDate: "2026-07-22",
    endDate: "2026-07-22",
    reason: "Personal errand.",
    status: "Approved",
    manager: "Anita Desai",
  },
  {
    requestId: "LR-2026-0031",
    leaveType: "Planned Leave",
    startDate: "2026-06-10",
    endDate: "2026-06-14",
    reason: "Family vacation.",
    status: "Rejected",
    manager: "Anita Desai",
  },
  {
    requestId: "LR-2026-0025",
    leaveType: "Sick Leave",
    startDate: "2026-05-03",
    endDate: "2026-05-03",
    reason: "Migraine.",
    status: "Approved",
    manager: "Anita Desai",
  },
  {
    requestId: "LR-2026-0019",
    leaveType: "Half-Day Leave",
    startDate: "2026-04-15",
    endDate: "2026-04-15",
    reason: "Doctor appointment.",
    status: "Cancelled",
    manager: "Anita Desai",
  },
  {
    requestId: "LR-2026-0051",
    leaveType: "Casual Leave",
    startDate: "2026-09-15",
    endDate: "2026-09-15",
    reason: "Pending personal leave request.",
    status: "Pending",
    manager: "Anita Desai",
  },
];

export const demoPolicies: PolicySection[] = [
  {
    id: "planned-leave",
    title: "Planned Leave",
    content:
      "Planned leave must be requested at least 7 working days in advance. Approval from your reporting manager is required before the leave begins. Planned leave cannot exceed 15 consecutive working days without HR director approval.",
  },
  {
    id: "sick-leave",
    title: "Sick Leave",
    content:
      "Employees are entitled to sick leave when unable to work due to illness or injury. A medical certificate is required for sick leave exceeding 2 consecutive working days. Sick leave cannot be carried forward beyond the calendar year.",
  },
  {
    id: "casual-leave",
    title: "Casual Leave",
    content:
      "Casual leave is intended for short-duration personal needs. A maximum of 1 casual leave per month is permitted. Casual leave cannot be combined with other leave types. Unused casual leave lapses at year end.",
  },
  {
    id: "half-day-leave",
    title: "Half-Day Leave",
    content:
      "Half-day leave may be taken for the first or second half of a working day. The leave type (sick, casual, or planned) must be specified. Half-day leave counts as 0.5 days against the corresponding leave balance.",
  },
  {
    id: "approval",
    title: "Approval",
    content:
      "All leave requests require approval from the employee's reporting manager. The manager will receive an email notification and may approve or reject the request. Leave is not confirmed until the manager approves it.",
  },
  {
    id: "cancellation",
    title: "Cancellation",
    content:
      "An approved or pending leave request may be cancelled by the employee through the HR Assistant. Cancellation of approved leave does not automatically restore the leave balance — restoration is subject to manager and HR review.",
  },
  {
    id: "insufficient-balance",
    title: "Insufficient Balance",
    content:
      "If the requested leave exceeds the employee's remaining leave balance, the request will be flagged as 'Leave Without Pay' (LWP) and requires additional HR approval. The employee will be informed of the LWP status before the request is submitted.",
  },
  {
    id: "overlapping-leave",
    title: "Overlapping Leave",
    content:
      "An employee may not have two leave requests with overlapping dates. The HR system will detect overlapping requests and reject the new request. The employee should cancel or modify the existing request first.",
  },
  {
    id: "notice-periods",
    title: "Notice Periods",
    content:
      "Notice periods: Planned leave — 7 working days. Sick leave — same day, before 9:30 AM. Casual leave — 2 working days. Half-day leave — 1 working day. Failure to meet the notice period may result in the request being marked as unauthorized absence.",
  },
];

// Demo credentials — for local development only.
// The real authentication is performed by the n8n auth webhook.
export const demoCredentials = {
  employeeId: "EMP001",
  password: "password123",
};
