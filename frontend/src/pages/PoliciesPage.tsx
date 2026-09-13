import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BookOpen,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api, friendlyError } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PolicySection } from "@/types";

export function PoliciesPage() {
  const { session } = useAuth();
  const [policies, setPolicies] = useState<PolicySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPolicies(session);
      setPolicies(data);
      // Expand all by default
      setExpanded(new Set(data.map((p) => p.id)));
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
    if (!search) return policies;
    const q = search.toLowerCase();
    return policies.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q),
    );
  }, [policies, search]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(filtered.map((p) => p.id)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
          <BookOpen size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">HR Policies</h2>
          <p className="text-sm text-gray-500">
            Company leave policies and guidelines.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies by keyword..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {!loading && !error && filtered.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filtered.length} {filtered.length === 1 ? "policy" : "policies"} found
            </p>
            <div className="flex gap-3">
              <button
                onClick={expandAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Expand all
              </button>
              <button
                onClick={collapseAll}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Collapse all
              </button>
            </div>
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
            title="No policies found"
            message={
              search
                ? "No policies match your search. Try a different keyword."
                : "No policies are available at this time."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((policy) => {
            const isOpen = expanded.has(policy.id);
            return (
              <Card key={policy.id} padding={false} className="overflow-hidden">
                <button
                  onClick={() => toggle(policy.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
                      <FileText size={18} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {policy.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1">
                    <p className="text-sm text-gray-600 leading-relaxed pl-12">
                      {policy.content}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
