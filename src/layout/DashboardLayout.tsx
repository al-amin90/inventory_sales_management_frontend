import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

const DashboardLayout = () => (
  <div className="flex min-h-screen bg-slate-950">
    <Sidebar />
    <main className="flex-1 p-6 overflow-auto">
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
