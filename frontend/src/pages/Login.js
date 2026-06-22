import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";

// --- STYLES ---
import "../styles/Login.css";
const Login = () => {
  const [username, setUsername] = useState("user@gmail.com");
  const [password, setPassword] = useState("1");
  const {
    login
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogin = async e => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      // Redirect theo role
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error("Email hoặc mật khẩu không đúng");
    }
  };
  return <div className="login__page-wrapper">
      {/* Lớp lưới trang trí */}
      <div className="login__grid-overlay"></div>

      <div className="login__login-card">
        <div className="login__inline-100">🏛️</div>
        <h2 className="login__inline-101">





          
          HỆ THỐNG QUẢN LÝ
        </h2>

        <p className="login__inline-111">
          Học viện Công nghệ Bưu chính Viễn thông
        </p>

        <form onSubmit={handleLogin}>
          <div className="login__inline-116">
            <label className="login__inline-117">

              
              Tên đăng nhập
            </label>
            <input type="text" placeholder="Nhập email của bạn" value={username} onChange={e => setUsername(e.target.value)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = "#ddd"} required className="login__input" />
            
          </div>

          <div className="login__inline-134">
            <label className="login__inline-135">

              
              Mật khẩu
            </label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onFocus={e => e.target.style.borderColor = "#c0392b"} onBlur={e => e.target.style.borderColor = "#ddd"} required className="login__input" />
            
          </div>

          <button type="submit" className="login__button">
            ĐĂNG NHẬP NGAY
          </button>
        </form>

        <div className="login__inline-157">
          <button onClick={() => navigate("/forgot-password")} className="login__inline-158">








            
            Quên mật khẩu?
          </button>
          <p className="login__inline-171">Hỗ trợ kỹ thuật: 024.xxx.xxxx</p>
        </div>
      </div>
    </div>;
};
export default Login;
