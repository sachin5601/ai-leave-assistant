
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuth();

  // Wait until session restoration is complete
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect users without a session
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
