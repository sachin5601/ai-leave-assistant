import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  CalendarClock,
  History,
  BookOpen,
  User,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const navItems = [
  { to: "/dashboard/chat", label: "Chat Assistant", icon: MessageSquare },
  { to: "/dashboard/leave-summary", label: "My Leave Summary", icon: CalendarClock },
  { to: "/dashboard/leave-history", label: "Leave History", icon: History },
  { to: "/dashboard/policies", label: "HR Policies", icon: BookOpen },
  { to: "/dashboard/profile", label: "My Profile", icon: User },
];

export function Sidebar({ open, onClose, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed lg:static inset-y-0 left-0 z-40",
          "w-64 bg-white border-r border-gray-200 flex flex-col",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo / brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">HR Portal</p>
              <p className="text-xs text-gray-500 leading-tight">Employee Self-Service</p>
            </div>
          </div>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  ].join(" ")
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Security indicator */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-green-50">
            <ShieldCheck size={16} className="text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Secure Employee Session
            </span>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
