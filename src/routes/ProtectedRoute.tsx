import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
