import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";

// --- STYLES ---
const pageWrapper = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  overflow: "hidden",
  fontFamily: "'Segoe UI', Roboto, sans-serif",
  // Background tối với hiệu ứng chiều sâu
  backgroundColor: "#0a0b10",
  backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(192, 57, 43, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(41, 128, 185, 0.15) 0%, transparent 40%)
        `,
};

// Tạo hiệu ứng lưới mờ phía sau
const gridOverlay = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
  backgroundSize: "40px 40px",
  zIndex: 1,
};

const loginCard = {
  position: "relative",
  zIndex: 10,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)", // Hiệu ứng kính mờ
  padding: "50px 40px",
  borderRadius: "24px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  width: "100%",
  maxWidth: "400px",
  textAlign: "center",
  border: "1px solid rgba(255, 255, 255, 0.2)",
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "16px",
  marginTop: "8px",
  boxSizing: "border-box",
  outline: "none",
  transition: "0.3s",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  marginTop: "25px",
  boxShadow: "0 4px 15px rgba(192, 57, 43, 0.3)",
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      // Redirect theo role
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.success("Login failed!");
    }
  };

  return (
    <div style={pageWrapper}>
      {/* Lớp lưới trang trí */}
      <div style={gridOverlay}></div>

      <div style={loginCard}>
        <div style={{ fontSize: "50px", marginBottom: "15px" }}>🏛️</div>
        <h2
          style={{
            margin: "0 0 5px 0",
            color: "#1a1a1a",
            letterSpacing: "1px",
          }}
        >
          HỆ THỐNG QUẢN LÝ
        </h2>

        <p style={{ margin: "0 0 35px 0", color: "#666" }}>
          Học viện Công nghệ Bưu chính Viễn thông
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label
              style={{ fontWeight: "600", color: "#444", fontSize: "14px" }}
            >
              Tên đăng nhập
            </label>
            <input
              type="text"
              placeholder="Mã số sinh viên / Giảng viên"
              style={inputStyle}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              required
            />
          </div>

          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            <label
              style={{ fontWeight: "600", color: "#444", fontSize: "14px" }}
            >
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              required
            />
          </div>

          <button type="submit" style={buttonStyle}>
            ĐĂNG NHẬP NGAY
          </button>
        </form>

        <div style={{ marginTop: "25px", fontSize: "13px", color: "#888" }}>
          <a href="#" style={{ color: "#c0392b", textDecoration: "none" }}>
            Quên mật khẩu?
          </a>
          <p style={{ marginTop: "10px" }}>Hỗ trợ kỹ thuật: 024.xxx.xxxx</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
