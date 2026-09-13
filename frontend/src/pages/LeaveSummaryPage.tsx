import { useEffect, useState, useCallback } from "react";
import {
  CalendarClock,
  HeartPulse,
  Coffee,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api, friendlyError } from "@/services/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { LeaveSummary as LeaveSummaryType } from "@/types";

function fmt(value: number | null): string {
  return value == null ? "—" : String(value);
}

export function LeaveSummaryPage() {
  const { session } = useAuth();
  const [data, setData] = useState<LeaveSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const summary = await api.getLeaveSummary(session);
      setData(summary);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!data) return null;

  const parts = [data.sickLeave, data.casualLeave, data.usedLeave].filter(
    (v): v is number => v != null,
  );
  const totalAllocated = parts.length > 0 ? parts.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
          <CalendarClock size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Leave Summary</h2>
          <p className="text-sm text-gray-500">
            Your current leave balances and usage.
          </p>
        </div>
      </div>

      {/* Top row: total + remaining */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card
  className="border border-blue-200"
  style={{ backgroundColor: "#eff6ff" }}
>
          <div className="flex items-center justify-between">
            <div>
              <p
  className="text-sm font-medium"
  style={{ color: "#1d4ed8" }}
>
                Total Leave Balance
              </p>
              <p
  className="text-4xl font-bold mt-2"
  style={{ color: "#111827" }}
>
                {fmt(data.totalBalance)}
                {data.totalBalance != null && (
                  <span
  className="text-lg font-normal ml-1"
  style={{ color: "#6b7280" }}
>
                    days
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/15">
              <CalendarDays size={28} className="text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Remaining Leave
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {fmt(data.remainingLeave)}
                {data.remainingLeave != null && (
                  <span className="text-lg font-normal text-gray-400 ml-1">
                    days
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-50">
              <TrendingUp size={28} className="text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Leave type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader
            title="Sick Leave"
            subtitle="Available balance"
            icon={<HeartPulse size={18} />}
          />
          <p className="text-3xl font-bold text-gray-900 mb-3">
            {fmt(data.sickLeave)}
            {data.sickLeave != null && (
              <span className="text-base font-normal text-gray-400 ml-1">
                days
              </span>
            )}
          </p>
          <ProgressBar
            value={data.sickLeave ?? 0}
            max={totalAllocated || 1}
            color="bg-red-500"
          />
        </Card>

        <Card>
          <CardHeader
            title="Casual Leave"
            subtitle="Available balance"
            icon={<Coffee size={18} />}
          />
          <p className="text-3xl font-bold text-gray-900 mb-3">
            {fmt(data.casualLeave)}
            {data.casualLeave != null && (
              <span className="text-base font-normal text-gray-400 ml-1">
                days
              </span>
            )}
          </p>
          <ProgressBar
            value={data.casualLeave ?? 0}
            max={totalAllocated || 1}
            color="bg-amber-500"
          />
        </Card>

        <Card>
          <CardHeader
            title="Used Leave"
            subtitle="This year"
            icon={<CheckCircle2 size={18} />}
          />
          <p className="text-3xl font-bold text-gray-900 mb-3">
            {fmt(data.usedLeave)}
            {data.usedLeave != null && (
              <span className="text-base font-normal text-gray-400 ml-1">
                days
              </span>
            )}
          </p>
          <ProgressBar
            value={data.usedLeave ?? 0}
            max={totalAllocated || 1}
            color="bg-blue-600"
          />
        </Card>
      </div>

      {/* Usage breakdown */}
      <Card>
        <CardHeader
          title="Leave Usage Overview"
          subtitle="Breakdown of allocated vs. used leave"
        />
        <div className="space-y-4">
          <UsageRow
            label="Sick Leave"
            available={data.sickLeave}
            used={0}
            color="bg-red-500"
          />
          <UsageRow
            label="Casual Leave"
            available={data.casualLeave}
            used={0}
            color="bg-amber-500"
          />
          <UsageRow
            label="Used Leave"
            available={data.remainingLeave}
            used={data.usedLeave}
            color="bg-blue-600"
          />
        </div>
      </Card>
    </div>
  );
}

function UsageRow({
  label,
  available,
  used,
  color,
}: {
  label: string;
  available: number | null;
  used: number | null;
  color: string;
}) {
  const avail = available ?? 0;
  const use = used ?? 0;
  const total = avail + use;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {fmt(available)} available · {fmt(used)} used
        </span>
      </div>
      <ProgressBar value={avail} max={total || 1} color={color} />
    </div>
  );
}
