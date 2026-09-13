import { useEffect, useState, useCallback } from "react";
import {
  User,
  Mail,
  Building2,
  Users,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api, friendlyError } from "@/services/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Employee } from "@/types";

export function ProfilePage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProfile(session);
      setProfile(data);
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
      <div className="flex items-center justify-center py-20">
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

  if (!profile) return null;

  const initials = (profile.name || "E")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
          <User size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500">
            Your employee information and reporting manager details.
          </p>
        </div>
      </div>

      {/* Profile header card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{profile.department}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck size={12} />
                {profile.employeeId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <Lock size={12} />
                Employee ID is read-only
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal info */}
        <Card>
          <CardHeader title="Personal Information" icon={<User size={18} />} />
          <div className="space-y-4">
            <InfoRow
              icon={<User size={16} />}
              label="Employee ID"
              value={profile.employeeId}
              readOnly
            />
            <InfoRow
              icon={<User size={16} />}
              label="Full Name"
              value={profile.name}
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={profile.email}
            />
            <InfoRow
              icon={<Building2 size={16} />}
              label="Department"
              value={profile.department}
            />
          </div>
        </Card>

        {/* Manager info */}
        <Card>
          <CardHeader
            title="Reporting Manager"
            subtitle="Your direct supervisor"
            icon={<Users size={18} />}
          />
          <div className="space-y-4">
            <InfoRow
              icon={<User size={16} />}
              label="Manager ID"
              value={profile.managerId}
              readOnly
            />
            <InfoRow
              icon={<User size={16} />}
              label="Manager Name"
              value={profile.managerName}
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Manager Email"
              value={profile.managerEmail}
            />
          </div>
        </Card>
      </div>

      {/* Privacy notice */}
      <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Your HR information is private to your employee account. Only you and
            authorized HR personnel can view this information. Your Employee ID
            cannot be changed.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  readOnly = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
          {readOnly && (
            <Lock size={12} className="text-gray-400 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
