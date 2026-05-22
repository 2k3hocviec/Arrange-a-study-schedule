import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const StudentChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await authAPI.changePassword(
        formData.currentPassword,
        formData.newPassword,
      );

      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        background: "#ffffff",
        padding: "30px",
        borderRadius: "14px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          color: "#2c3e50",
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        ĐỔI MẬT KHẨU
      </h2>

      <p
        style={{
          color: "#7f8c8d",
          marginBottom: "25px",
          textAlign: "center",
        }}
      >
        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#34495e",
              fontWeight: "600",
            }}
          >
            Mật khẩu hiện tại
          </label>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dcdde1",
                borderRadius: "8px",
                outline: "none",
                fontSize: "15px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  current: !showPassword.current,
                })
              }
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#7f8c8d",
              }}
            >
              {showPassword.current ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#34495e",
              fontWeight: "600",
            }}
          >
            Mật khẩu mới
          </label>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dcdde1",
                borderRadius: "8px",
                outline: "none",
                fontSize: "15px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  new: !showPassword.new,
                })
              }
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#7f8c8d",
              }}
            >
              {showPassword.new ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#34495e",
              fontWeight: "600",
            }}
          >
            Xác nhận mật khẩu mới
          </label>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dcdde1",
                borderRadius: "8px",
                outline: "none",
                fontSize: "15px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  confirm: !showPassword.confirm,
                })
              }
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#7f8c8d",
              }}
            >
              {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px",
            background: "#3498db",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#2980b9";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#3498db";
          }}
        >
          ĐỔI MẬT KHẨU
        </button>
      </form>
    </div>
  );
};

export default StudentChangePassword;
