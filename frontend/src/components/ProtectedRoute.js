import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ROLE_HOME = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  ministry: "/ministry/dashboard",
  sysadmin: "/sysadmin/dashboard",
};

const AuthLoading = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#475569",
      fontWeight: 600,
    }}
  >
    Đang kiểm tra đăng nhập...
  </div>
);

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <AuthLoading />;

  if (user) {
    return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
  }

  return children;
};
