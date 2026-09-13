import { useNavigate } from "react-router-dom";
import { Bell, Menu, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export function Header({ onMenuClick, onLogout }: HeaderProps) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = (session?.name || "E")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 lg:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-gray-600 hover:text-gray-900"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-tight">
            Employee HR Portal
          </h1>
          <p className="text-xs text-gray-500 leading-tight hidden sm:block">
            Employee HR Assistant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {session?.name || "Employee"}
              </p>
              <p className="text-xs text-gray-500 leading-tight">
                {session?.employeeId}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg py-1">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {session?.name || "Employee"}
                </p>
                <p className="text-xs text-gray-500">{session?.employeeId}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/dashboard/profile");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User size={16} />
                My Profile
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
