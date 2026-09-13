import { useEffect, useState, useCallback, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  Calendar,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api, friendlyError } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LeaveRecord, LeaveStatus } from "@/types";

const statusColors: Record<LeaveStatus, "blue" | "green" | "red" | "gray"> = {
  Pending: "blue",
  Approved: "green",
  Rejected: "red",
  Cancelled: "gray",
};

export function LeaveHistoryPage() {
  const { session } = useAuth();
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "All">("All");
  const [dateFilter, setDateFilter] = useState("");

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLeaveHistory(session);
      setRecords(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      // Status filter
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      // Date filter
      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        if (filterDate < start || filterDate > end) return false;
      }
      // Search
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          r.requestId,
          r.leaveType,
          r.reason,
          r.manager,
          r.startDate,
          r.endDate,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [records, statusFilter, dateFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: records.length,
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Cancelled: 0,
    };
    records.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [records]);

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
          <History size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Leave History</h2>
          <p className="text-sm text-gray-500">
            Your leave requests and their current status.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, type, reason..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <div className="relative">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as LeaveStatus | "All")
                }
                className="w-full appearance-none rounded-lg border border-gray-300 pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="All">All ({statusCounts.All})</option>
                <option value="Pending">
                  Pending ({statusCounts.Pending || 0})
                </option>
                <option value="Approved">
                  Approved ({statusCounts.Approved || 0})
                </option>
                <option value="Rejected">
                  Rejected ({statusCounts.Rejected || 0})
                </option>
                <option value="Cancelled">
                  Cancelled ({statusCounts.Cancelled || 0})
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {(search || statusFilter !== "All" || dateFilter) && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {records.length} requests
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setDateFilter("");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={32} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox size={28} />}
            title="No leave requests found"
            message={
              records.length === 0
                ? "You haven't submitted any leave requests yet. Use the AI HR Assistant to apply for leave."
                : "No requests match your current filters. Try adjusting or clearing them."
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card padding={false} className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Manager
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <tr
                      key={r.requestId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {r.requestId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {r.leaveType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(r.startDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(r.endDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {r.reason}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge color={statusColors[r.status]}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {r.manager}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((r) => (
              <Card key={r.requestId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {r.requestId}
                  </span>
                  <Badge color={statusColors[r.status]}>{r.status}</Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900 font-medium">{r.leaveType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dates</span>
                    <span className="text-gray-900">
                      {formatDate(r.startDate)} — {formatDate(r.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Manager</span>
                    <span className="text-gray-900">{r.manager}</span>
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm text-gray-600">{r.reason}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
