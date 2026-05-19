import { Routes, Route, Link, useLocation } from "react-router-dom";
import SysAdminUsers from "./SysAdminUsers";
import {
  useMobileMenu,
  MobileMenuButton,
  MobileMenuOverlay,
} from "../utils/responsiveHelpers";
import { FaRegUserCircle } from "react-icons/fa";

const SysAdminDashboard = () => {
  const location = useLocation();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();

  const navItemStyle = {
    padding: "clamp(10px, 2vw, 15px) clamp(10px, 2vw, 10px)",
    borderBottom: "1px solid #2d3436",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    fontSize: "clamp(13px, 2vw, 16px)",
  };

  const statCard = {
    flex: 1,
    background: "white",
    padding: "clamp(16px, 3vw, 25px)",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    borderTop: "6px solid #ff4757",
    minWidth: "150px",
    transition: "all 0.3s ease",
  };

  const activeStyle = (path) => ({
    ...navItemStyle,
    background: location.pathname.includes(path) ? "#5a3d3d" : "transparent",
  });

  const HomeContent = (
    <div>
      <h1
        style={{
          color: "#2c3e50",
          fontSize: "clamp(24px, 5vw, 28px)",
          marginBottom: "30px",
        }}
      >
        QUẢN TRỊ HỆ THỐNG
      </h1>
      <div
        style={{
          display: "flex",
          gap: "clamp(12px, 3vw, 25px)",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#ff4757",
            }}
          >
            1,250
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            User trực tuyến
          </p>
        </div>
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#ff4757",
            }}
          >
            99.9%
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Server Status
          </p>
        </div>
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#ff4757",
            }}
          >
            0
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Cảnh báo
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
      <div style={{ display: "flex", flex: 1 }}>
        <div
          className={`sidebar ${isMobileMenuOpen ? "active" : ""}`}
          style={{
            width: "100%",
            maxWidth: "260px",
            background: "#1a0f0f",
            color: "white",
            padding: "clamp(12px, 3vw, 20px)",
            transition: "all 0.3s ease",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#ff4757",
              marginBottom: "30px",
              fontSize: "clamp(16px, 3vw, 18px)",
            }}
          >
            QT HỆ THỐNG
          </h2>
          <hr style={{ borderColor: "#2d3436" }} />
          <nav>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={activeStyle("users")}>
                <Link
                  to="/sysadmin/users"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  <FaRegUserCircle /> Quản lý người dùng
                </Link>
              </li>
            </ul>
          </nav>
          <button
            onClick={() => (window.location.href = "/login")}
            style={{
              marginTop: "40px",
              width: "100%",
              padding: "clamp(10px, 2vw, 12px)",
              background: "#2c3e50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "clamp(13px, 2vw, 14px)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#1a252f")}
            onMouseOut={(e) => (e.target.style.background = "#2c3e50")}
          >
            Đăng xuất
          </button>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "clamp(16px, 3vw, 40px)",
            background: "#f8f9fa",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MobileMenuButton
            onClick={toggleMobileMenu}
            isOpen={isMobileMenuOpen}
          />
          <Routes>
            <Route path="/" element={HomeContent} />
            <Route path="dashboard" element={HomeContent} />
            <Route path="users" element={<SysAdminUsers />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SysAdminDashboard;
