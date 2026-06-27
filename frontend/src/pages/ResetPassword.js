import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

// --- STYLES ---
import "../styles/ResetPassword.css";
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const handleResetPassword = async e => {
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
    return <div className="reset-password__page-wrapper">
        <div className="reset-password__grid-overlay"></div>
        <div className="reset-password__card">
          <div className="reset-password__inline-129">⚠️</div>
          <h2 className="reset-password__inline-130">





            
            ERROR
          </h2>
          <p className="reset-password__inline-139">

            
            Invalid or expired password reset link
          </p>
          <button onClick={() => navigate("/forgot-password")} className="reset-password__button">

            
            BACK TO RESET PASSWORD
          </button>
        </div>
      </div>;
  }
  return <div className="reset-password__page-wrapper">
      {/* Lớp lưới trang trí */}
      <div className="reset-password__grid-overlay"></div>

      <div className="reset-password__card">
        <div className="reset-password__inline-161">🔑</div>
        <h2 className="reset-password__inline-162">





          
          SET NEW PASSWORD
        </h2>

        <p className="reset-password__inline-172">
          Enter your new password
        </p>

        <form onSubmit={handleResetPassword}>
          <div className="reset-password__inline-177">
            <label className="reset-password__inline-178">

              
              New Password
            </label>
            <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = "#ddd"} required className="reset-password__input" />
            
          </div>

          <div className="reset-password__inline-195">
            <label className="reset-password__inline-196">

              
              Confirm Password
            </label>
            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = "#ddd"} required className="reset-password__input" />
            
          </div>

          <button type="submit" disabled={isLoading} onMouseOver={e => {
          if (!isLoading) e.target.style.opacity = "0.9";
        }} onMouseOut={e => {
          e.target.style.opacity = "1";
        }} className="reset-password__button">
            
            {isLoading ? "ĐANG XỬ LÝ..." : "CẬP NHẬT MẬT KHẨU"}
          </button>
        </form>

        <div className="reset-password__inline-228">
          <button onClick={() => navigate("/login")} className="reset-password__inline-229">








            
            ← Quay lại đăng nhập
          </button>
          <p className="reset-password__inline-242">Hỗ trợ kỹ thuật: 024.xxx.xxxx</p>
        </div>
      </div>
    </div>;
};
export default ResetPassword;
