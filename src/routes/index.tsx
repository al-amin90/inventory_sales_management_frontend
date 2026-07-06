import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "@/pages/Login";
import Products from "@/pages/products/Products";
import CreateSale from "@/pages/sales/CreateSale";
import Roles from "@/pages/roles/Roles";
import Dashboard from "@/pages/Dashboard";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <Products /> },
      { path: "sales", element: <CreateSale /> },
      { path: "roles", element: <Roles /> },
    ],
  },
  { path: "*", element: <Login /> },
]);
