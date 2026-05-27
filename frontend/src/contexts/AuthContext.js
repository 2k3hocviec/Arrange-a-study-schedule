import { useEffect, useState, createContext } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khi app khởi động: nếu có access_token → lấy profile
    // Nếu không có hoặc hết hạn, interceptor trong api.js sẽ tự dùng
    // refresh_token (cookie) để lấy token mới
    const token = localStorage.getItem("access_token");
    if (token) {
      authAPI
          .getProfile()
          .then((res) => setUser(res.data.user))
          .catch(() => {
            // Nếu cả refresh token cũng hết hạn, interceptor đã redirect /login
            localStorage.removeItem("access_token");
            setUser(null);
          })
          .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    // Chỉ lưu access_token vào localStorage
    // refresh_token được backend set tự động vào httpOnly cookie
    localStorage.setItem("access_token", res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      // Gọi backend để xóa cookie refresh_token phía server
      await authAPI.logout();
    } catch {
      // Dù lỗi vẫn xóa local
    }
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
}
