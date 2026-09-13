import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ChatPage } from "@/pages/ChatPage";
import { LeaveSummaryPage } from "@/pages/LeaveSummaryPage";
import { LeaveHistoryPage } from "@/pages/LeaveHistoryPage";
import { PoliciesPage } from "@/pages/PoliciesPage";
import { ProfilePage } from "@/pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/chat" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="leave-summary" element={<LeaveSummaryPage />} />
            <Route path="leave-history" element={<LeaveHistoryPage />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
