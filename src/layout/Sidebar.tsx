import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Shield,
  LogOut,
  Boxes,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logoutUser } from "@/redux/features/auth/authSlice";
import { removeToken } from "@/utils/auth";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/products", icon: Package, label: "Products" },
  { to: "/dashboard/sales", icon: ShoppingCart, label: "Sales" },
  { to: "/dashboard/roles", icon: Shield, label: "Roles", adminOnly: true },
];

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    removeToken();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">ERP System</p>
            <p className="text-slate-500 text-xs">Mini Inventory</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role === "employee") return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400 border border-violet-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-medium">{user?.name}</p>
          <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
