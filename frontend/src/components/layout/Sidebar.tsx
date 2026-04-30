import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Box,
  Monitor,
  LogOut,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/catalog", icon: Store, label: "App Catalog" },
  { to: "/my-apps", icon: Box, label: "Installed Apps" },
  { to: "/gpu", icon: Monitor, label: "GPU Monitor" },
];

export function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem("ianoie_token");
    window.location.href = "/login";
  };

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-zinc-200 bg-zinc-50">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-200 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900">
          <Cpu className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-zinc-900 tracking-tight">IAnoIE</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-200/80 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-200 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
