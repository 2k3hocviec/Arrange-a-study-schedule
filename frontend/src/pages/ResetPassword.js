import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

// --- STYLES ---
const pageWrapper = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  padding: "clamp(12px, 3vw, 24px)",
  overflow: "hidden",
  fontFamily: "'Segoe UI', Roboto, sans-serif",
  backgroundColor: "#0a0b10",
  backgroundImage: `
    radial-gradient(circle at 20% 30%, rgba(192, 57, 43, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(41, 128, 185, 0.15) 0%, transparent 40%)
  `,
};

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

const card = {
  position: "relative",
  zIndex: 10,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  padding: "clamp(20px, 5vw, 50px) clamp(16px, 4vw, 40px)",
  borderRadius: "24px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  width: "100%",
  maxWidth: "400px",
  textAlign: "center",
  border: "1px solid rgba(255, 255, 255, 0.2)",
};

const inputStyle = {
  width: "100%",
  padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 15px)",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "clamp(14px, 2vw, 16px)",
  marginTop: "8px",
  boxSizing: "border-box",
  outline: "none",
  transition: "0.3s",
};

const buttonStyle = {
  width: "100%",
  padding: "clamp(12px, 2vw, 14px)",
  background: "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "clamp(14px, 2vw, 16px)",
  marginTop: "clamp(15px, 3vw, 25px)",
  boxShadow: "0 4px 15px rgba(192, 57, 43, 0.3)",
};

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or expired password reset link");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, newPassword);
      toast.success("Password has been updated successfully");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Request failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={pageWrapper}>
        <div style={gridOverlay}></div>
        <div style={card}>
          <div style={{ fontSize: "50px", marginBottom: "15px" }}>⚠️</div>
          <h2
            style={{
              margin: "0 0 5px 0",
              color: "#1a1a1a",
              letterSpacing: "1px",
            }}
          >
            ERROR
          </h2>
          <p
            style={{ margin: "10px 0 35px 0", color: "#666", fontSize: "14px" }}
          >
            Invalid or expired password reset link
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            style={buttonStyle}
          >
            BACK TO RESET PASSWORD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapper}>
      {/* Lớp lưới trang trí */}
      <div style={gridOverlay}></div>

      <div style={card}>
        <div style={{ fontSize: "50px", marginBottom: "15px" }}>🔑</div>
        <h2
          style={{
            margin: "0 0 5px 0",
            color: "#1a1a1a",
            letterSpacing: "1px",
          }}
        >
          SET NEW PASSWORD
        </h2>

        <p style={{ margin: "0 0 35px 0", color: "#666", fontSize: "14px" }}>
          Enter your new password
        </p>

        <form onSubmit={handleResetPassword}>
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label
              style={{ fontWeight: "600", color: "#444", fontSize: "14px" }}
            >
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              required
            />
          </div>

          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label
              style={{ fontWeight: "600", color: "#444", fontSize: "14px" }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              required
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading}
            onMouseOver={(e) => {
              if (!isLoading) e.target.style.opacity = "0.9";
            }}
            onMouseOut={(e) => {
              e.target.style.opacity = "1";
            }}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "CẬP NHẬT MẬT KHẨU"}
          </button>
        </form>

        <div style={{ marginTop: "25px", fontSize: "13px", color: "#888" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "#c0392b",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "500",
            }}
          >
            ← Quay lại đăng nhập
          </button>
          <p style={{ marginTop: "15px" }}>Hỗ trợ kỹ thuật: 024.xxx.xxxx</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
