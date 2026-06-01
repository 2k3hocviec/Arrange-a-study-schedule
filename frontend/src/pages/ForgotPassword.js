import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  top: 0, left: 0, right: 0, bottom: 0,
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
  maxWidth: "420px",
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

const btnPrimary = {
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
  transition: "opacity 0.2s",
};

const otpContainer = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  margin: "20px 0",
};

const otpInput = {
  width: "48px",
  height: "56px",
  borderRadius: "10px",
  border: "2px solid #ddd",
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center",
  outline: "none",
  transition: "0.3s",
  boxSizing: "border-box",
};

const stepIndicator = {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  marginBottom: "28px",
};

// Component chỉ báo bước hiện tại
const StepDots = ({ current }) => (
    <div style={stepIndicator}>
      {[1, 2, 3].map((s) => (
          <div
              key={s}
              style={{
                width: s === current ? "28px" : "10px",
                height: "10px",
                borderRadius: "5px",
                background: s <= current ? "#c0392b" : "#ddd",
                transition: "all 0.3s",
              }}
          />
      ))}
    </div>
);

// ----------------------------------------------------------------
// BƯỚC 1: Nhập email → gửi OTP
// ----------------------------------------------------------------
const Step1Email = ({ onNext }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Vui lòng nhập email"); return; }
    setLoading(true);
    try {
      await authAPI.sendOtp(email.trim());
      toast.success("Mã OTP đã được gửi tới email của bạn!");
      onNext(email.trim());
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi OTP";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <label style={{ fontWeight: "600", color: "#444", fontSize: "14px" }}>
            Email đăng ký
          </label>
          <input
              type="email"
              placeholder="Nhập email của bạn"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              required
          />
        </div>
        <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? "ĐANG GỬI..." : "GỬI MÃ OTP"}
        </button>
      </form>
  );
};

// ----------------------------------------------------------------
// BƯỚC 2: Nhập OTP 6 chữ số
// ----------------------------------------------------------------
const Step2Otp = ({ email, onNext, onBack }) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = React.useRef([]);

  // Đếm ngược resend
  React.useEffect(() => {
    setResendCooldown(60);
  }, []);
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { toast.error("Vui lòng nhập đủ 6 chữ số"); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(email, otp);
      toast.success("Xác minh OTP thành công!");
      onNext(res.data.reset_token);
    } catch (err) {
      const msg = err.response?.data?.message || "Mã OTP không đúng";
      toast.error(msg);
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.sendOtp(email);
      toast.success("Đã gửi lại mã OTP!");
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch {
      toast.error("Không thể gửi lại OTP");
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "8px" }}>
          Mã OTP đã gửi tới: <strong style={{ color: "#c0392b" }}>{email}</strong>
        </p>
        <p style={{ color: "#888", fontSize: "12px", marginBottom: "0" }}>
          Có hiệu lực trong <strong>5 phút</strong>
        </p>

        <div style={otpContainer} onPaste={handlePaste}>
          {digits.map((d, i) => (
              <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  style={{
                    ...otpInput,
                    borderColor: d ? "#c0392b" : "#ddd",
                    background: d ? "#fff5f5" : "white",
                  }}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
                  onBlur={(e) => (e.target.style.borderColor = d ? "#c0392b" : "#ddd")}
              />
          ))}
        </div>

        <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? "ĐANG XÁC MINH..." : "XÁC MINH OTP"}
        </button>

        <div style={{ marginTop: "16px", fontSize: "13px", color: "#888" }}>
          {resendCooldown > 0 ? (
              <span>Gửi lại sau <strong style={{ color: "#c0392b" }}>{resendCooldown}s</strong></span>
          ) : (
              <button
                  type="button"
                  onClick={handleResend}
                  style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
              >
                Gửi lại mã OTP
              </button>
          )}
        </div>

        <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "12px", marginTop: "10px" }}>
          ← Đổi email
        </button>
      </form>
  );
};

// ----------------------------------------------------------------
// BƯỚC 3: Đặt mật khẩu mới
// ----------------------------------------------------------------
const Step3NewPassword = ({ resetToken }) => {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error("Mật khẩu phải ít nhất 6 ký tự"); return; }
    if (newPw !== confirmPw) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    setLoading(true);
    try {
      await authAPI.resetPasswordWithToken(resetToken, newPw);
      toast.success("Đặt lại mật khẩu thành công!");
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
        <div style={{ padding: "20px 0" }}>
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>✅</div>
          <h3 style={{ color: "#27ae60", marginBottom: "10px" }}>Thành công!</h3>
          <p style={{ color: "#666", fontSize: "14px" }}>Mật khẩu đã được cập nhật. Đang chuyển về trang đăng nhập...</p>
        </div>
    );
  }

  return (
      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <label style={{ fontWeight: "600", color: "#444", fontSize: "14px" }}>Mật khẩu mới</label>
          <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              style={inputStyle}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              required
          />
        </div>
        <div style={{ textAlign: "left", marginBottom: "10px" }}>
          <label style={{ fontWeight: "600", color: "#444", fontSize: "14px" }}>Xác nhận mật khẩu</label>
          <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              style={inputStyle}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#c0392b")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              required
          />
          {confirmPw && newPw !== confirmPw && (
              <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "6px" }}>⚠ Mật khẩu không khớp</p>
          )}
          {confirmPw && newPw === confirmPw && (
              <p style={{ color: "#27ae60", fontSize: "12px", marginTop: "6px" }}>✓ Mật khẩu khớp</p>
          )}
        </div>
        <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? "ĐANG CẬP NHẬT..." : "ĐẶT LẠI MẬT KHẨU"}
        </button>
      </form>
  );
};

// ----------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------
const STEP_CONFIG = [
  { icon: "🔐", title: "QUÊN MẬT KHẨU", sub: "Nhập email để nhận mã OTP xác minh" },
  { icon: "📱", title: "NHẬP MÃ OTP",    sub: "Kiểm tra hộp thư và nhập mã 6 chữ số" },
  { icon: "🔑", title: "MẬT KHẨU MỚI",  sub: "Đặt mật khẩu mới cho tài khoản" },
];

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  const cfg = STEP_CONFIG[step - 1];

  return (
      <div style={pageWrapper}>
        <div style={gridOverlay} />
        <div style={card}>
          <div style={{ fontSize: "50px", marginBottom: "10px" }}>{cfg.icon}</div>
          <h2 style={{ margin: "0 0 5px 0", color: "#1a1a1a", letterSpacing: "1px", fontSize: "clamp(16px, 3vw, 20px)" }}>
            {cfg.title}
          </h2>
          <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: "13px" }}>{cfg.sub}</p>

          <StepDots current={step} />

          {step === 1 && (
              <Step1Email onNext={(em) => { setEmail(em); setStep(2); }} />
          )}
          {step === 2 && (
              <Step2Otp
                  email={email}
                  onNext={(token) => { setResetToken(token); setStep(3); }}
                  onBack={() => setStep(1)}
              />
          )}
          {step === 3 && (
              <Step3NewPassword resetToken={resetToken} />
          )}

          <div style={{ marginTop: "20px", fontSize: "13px", color: "#888" }}>
            <button
                onClick={() => navigate("/login")}
                style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
            >
              ← Quay lại đăng nhập
            </button>
            <p style={{ marginTop: "10px" }}>Hỗ trợ kỹ thuật: 024.xxx.xxxx</p>
          </div>
        </div>
      </div>
  );
};

export default ForgotPassword;
