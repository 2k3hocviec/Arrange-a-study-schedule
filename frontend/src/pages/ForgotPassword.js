import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

// --- STYLES ---
import "../styles/ForgotPassword.css";
// Component chỉ báo bước hiện tại
const StepDots = ({
  current
}) => <div className="forgot-password__step-indicator">
      {[1, 2, 3].map(s => <div key={s} style={{
    width: s === current ? "28px" : "10px",
    background: s <= current ? "#c0392b" : "#ddd"
  }} className="forgot-password__inline-106" />)}
    </div>;

// ----------------------------------------------------------------
// BƯỚC 1: Nhập email → gửi OTP
// ----------------------------------------------------------------
const Step1Email = ({
  onNext
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
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
  return <form onSubmit={handleSubmit}>
        <div className="forgot-password__inline-145">
          <label className="forgot-password__inline-146">
            Email đăng ký
          </label>
          <input type="email" placeholder="Nhập email của bạn" value={email} onChange={e => setEmail(e.target.value)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = "#ddd"} required className="forgot-password__input" />
        
        </div>
        <button type="submit" style={{
      opacity: loading ? 0.7 : 1
    }} disabled={loading} className="forgot-password__btn-primary">
          {loading ? "ĐANG GỬI..." : "GỬI MÃ OTP"}
        </button>
      </form>;
};

// ----------------------------------------------------------------
// BƯỚC 2: Nhập OTP 6 chữ số
// ----------------------------------------------------------------
const Step2Otp = ({
  email,
  onNext,
  onBack
}) => {
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
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
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
  const handlePaste = e => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số");
      return;
    }
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
  return <form onSubmit={handleSubmit}>
        <p className="forgot-password__inline-241">
          Mã OTP đã gửi tới: <strong className="forgot-password__inline-242">{email}</strong>
        </p>
        <p className="forgot-password__inline-244">
          Có hiệu lực trong <strong>5 phút</strong>
        </p>

        <div onPaste={handlePaste} className="forgot-password__otp-container">
          {digits.map((d, i) => <input key={i} ref={el => inputs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d} style={{
        borderColor: d ? "#c0392b" : "#ddd",
        background: d ? "#fff5f5" : "white"
      }} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = d ? "#c0392b" : "#ddd"} className="forgot-password__otp-input" />)}
        </div>

        <button type="submit" style={{
      opacity: loading ? 0.7 : 1
    }} disabled={loading} className="forgot-password__btn-primary">
          {loading ? "ĐANG XÁC MINH..." : "XÁC MINH OTP"}
        </button>

        <div className="forgot-password__inline-274">
          {resendCooldown > 0 ? <span>Gửi lại sau <strong className="forgot-password__inline-276">{resendCooldown}s</strong></span> : <button type="button" onClick={handleResend} className="forgot-password__inline-278">

          
                Gửi lại mã OTP
              </button>}
        </div>

        <button type="button" onClick={onBack} className="forgot-password__inline-288">
          ← Đổi email
        </button>
      </form>;
};

// ----------------------------------------------------------------
// BƯỚC 3: Đặt mật khẩu mới
// ----------------------------------------------------------------
const Step3NewPassword = ({
  resetToken
}) => {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
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
    return <div className="forgot-password__inline-325">
          <div className="forgot-password__inline-326">✅</div>
          <h3 className="forgot-password__inline-327">Thành công!</h3>
          <p className="forgot-password__inline-328">Mật khẩu đã được cập nhật. Đang chuyển về trang đăng nhập...</p>
        </div>;
  }
  return <form onSubmit={handleSubmit}>
        <div className="forgot-password__inline-335">
          <label className="forgot-password__inline-336">Mật khẩu mới</label>
          <input type="password" placeholder="Tối thiểu 6 ký tự" value={newPw} onChange={e => setNewPw(e.target.value)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = "#ddd"} required className="forgot-password__input" />
        
        </div>
        <div className="forgot-password__inline-348">
          <label className="forgot-password__inline-349">Xác nhận mật khẩu</label>
          <input type="password" placeholder="Nhập lại mật khẩu mới" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = "#ddd"} required className="forgot-password__input" />
        
          {confirmPw && newPw !== confirmPw && <p className="forgot-password__inline-361">⚠ Mật khẩu không khớp</p>}
          {confirmPw && newPw === confirmPw && <p className="forgot-password__inline-364">✓ Mật khẩu khớp</p>}
        </div>
        <button type="submit" style={{
      opacity: loading ? 0.7 : 1
    }} disabled={loading} className="forgot-password__btn-primary">
          {loading ? "ĐANG CẬP NHẬT..." : "ĐẶT LẠI MẬT KHẨU"}
        </button>
      </form>;
};

// ----------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------
const STEP_CONFIG = [{
  icon: "🔐",
  title: "QUÊN MẬT KHẨU",
  sub: "Nhập email để nhận mã OTP xác minh"
}, {
  icon: "📱",
  title: "NHẬP MÃ OTP",
  sub: "Kiểm tra hộp thư và nhập mã 6 chữ số"
}, {
  icon: "🔑",
  title: "MẬT KHẨU MỚI",
  sub: "Đặt mật khẩu mới cho tài khoản"
}];
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();
  const cfg = STEP_CONFIG[step - 1];
  return <div className="forgot-password__page-wrapper">
        <div className="forgot-password__grid-overlay" />
        <div className="forgot-password__card">
          <div className="forgot-password__inline-395">{cfg.icon}</div>
          <h2 className="forgot-password__inline-396">
            {cfg.title}
          </h2>
          <p className="forgot-password__inline-399">{cfg.sub}</p>

          <StepDots current={step} />

          {step === 1 && <Step1Email onNext={em => {
        setEmail(em);
        setStep(2);
      }} />}
          {step === 2 && <Step2Otp email={email} onNext={token => {
        setResetToken(token);
        setStep(3);
      }} onBack={() => setStep(1)} />}
          {step === 3 && <Step3NewPassword resetToken={resetToken} />}

          <div className="forgot-password__inline-417">
            <button onClick={() => navigate("/login")} className="forgot-password__inline-418">

            
              ← Quay lại đăng nhập
            </button>
            <p className="forgot-password__inline-424">Hỗ trợ kỹ thuật: 024.xxx.xxxx</p>
          </div>
        </div>
      </div>;
};
export default ForgotPassword;
