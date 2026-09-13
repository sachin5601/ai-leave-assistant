import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { config } from "@/config/env";

export function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const success = await login({ employeeId, password });
    if (success) {
      navigate("/dashboard/chat", { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left panel — branding */}
      <div className="lg:w-2/5 bg-blue-700 text-white flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600 rounded-full -mr-20 -mt-20 opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full -ml-16 -mb-16 opacity-40" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur">
            <ShieldCheck size={24} />
          </div>
          <span className="text-lg font-bold">HR Portal</span>
        </div>

        <div className="relative z-10 my-12 lg:my-0">
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Employee HR Portal
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Secure access to your employee HR services. Manage your leave,
            view policies, and chat with your AI HR Assistant.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-blue-100">
          <Lock size={16} />
          <span>Your HR information is private to your employee account.</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="lg:w-3/5 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Sign in to your account
            </h2>
            <p className="text-gray-500">
              Enter your Employee ID and password to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Employee ID"
              type="text"
              placeholder="e.g. EMP001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              icon={<User size={18} />}
              autoComplete="username"
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              autoComplete="current-password"
              required
              disabled={loading}
            />

            <Button type="submit" size="lg" fullWidth loading={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => {
                  // Placeholder — in production this would trigger an n8n password-reset workflow
                  alert(
                    "Please contact HR to reset your password. This feature will be connected to an n8n workflow.",
                  );
                }}
              >
                Forgot Password?
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <HelpCircle size={16} />
              <span>Need help? Contact HR</span>
            </div>
          </div>

          {config.demoMode && (
            <div className="mt-6 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Demo mode is active.</strong> Use Employee ID{" "}
                <code className="font-mono">EMP001</code> and password{" "}
                <code className="font-mono">password123</code> to sign in.
                Connect your n8n webhooks in the <code>.env</code> file and set{" "}
                <code>VITE_DEMO_MODE=false</code> to go live.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
