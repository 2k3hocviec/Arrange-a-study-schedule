import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import StudentTimetable from "./StudentTimetable";
import StudentRegister from "./StudentRegister";
import { studentsAPI, enrollmentsAPI } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import { useMobileMenu, MobileMenuButton, MobileMenuOverlay } from "../utils/responsiveHelpers";
import { FaCalendarAlt, FaHome, FaUserCircle, FaSignOutAlt, FaBell, FaClipboardList, FaBookOpen, FaLock } from "react-icons/fa";
import ChangePassword from "./ChangePassword";
import "../styles/StudentDashboard.css";
const NAV = [{
  path: "/student/dashboard",
  key: "dashboard",
  icon: <FaHome />,
  label: "Dashboard"
}, {
  path: "/student/timetable",
  key: "timetable",
  icon: <FaCalendarAlt />,
  label: "Thời khóa biểu"
}, {
  path: "/student/register",
  key: "register",
  icon: <FaClipboardList />,
  label: "Đăng ký môn học"
}, {
  path: "/student/notifications",
  key: "notifications",
  icon: <FaLock />,
  label: "Đổi mật khẩu"
}];
const StudentDashboard = () => {
  const {
    user,
    logout
  } = useContext(AuthContext);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeredIds, setRegisteredIds] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  } = useMobileMenu();
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    studentsAPI.getMe().then(res => {
      setStudentInfo(res.data);
      setError(null);
    }).catch(() => setError("Không thể tải thông tin sinh viên")).finally(() => setLoading(false));
  }, [user]);
  useEffect(() => {
    if (!studentInfo?.student_id) return;
    enrollmentsAPI.getByStudentId(studentInfo.student_id).then(res => {
      if (res.data && Array.isArray(res.data)) setRegisteredIds(res.data.map(e => e.course_id));
    }).catch(console.error);
  }, [studentInfo]);
  const isActive = key => location.pathname.includes(key) || key === "dashboard" && (location.pathname === "/student" || location.pathname === "/student/");

  // ── Home page ─────────────────────────────────────────────────
  const HomePage = <div className="student-dashboard__home-page">
      {/* Welcome banner */}
      <div className="student-dashboard__banner">
        <div>
          <h1 className="student-dashboard__banner-title">
            Xin chào, {loading ? "..." : studentInfo?.name || "Sinh viên"} 👋
          </h1>
          <p className="student-dashboard__banner-sub">
            Mã sinh viên:{" "}
            <strong className="student-dashboard__inline-108">
              {studentInfo?.student_id || "N/A"}
            </strong>
          </p>
        </div>
        <FaBookOpen size={48} className="student-dashboard__inline-113" />
      </div>

      {/* Stat cards */}
      <div className="student-dashboard__stats-row">
        {[{
        icon: <FaClipboardList />,
        val: registeredIds.length,
        label: "Môn đã đăng ký",
        color: "#6366f1"
      }, {
        icon: <FaCalendarAlt />,
        val: 18,
        label: "Tín chỉ tối đa",
        color: "#22c55e"
      }, {
        icon: <FaBell />,
        val: 0,
        label: "Thông báo mới",
        color: "#f97316"
      }].map((c, i) => <div key={i} style={{
        borderTop: `4px solid ${c.color}`
      }} className="student-dashboard__stat-card">
        
            <span style={{
          color: c.color
        }} className="student-dashboard__inline-142">{c.icon}</span>
            <div>
              <div style={{
            color: c.color
          }} className="student-dashboard__inline-144">
            
                {c.val}
              </div>
              <div className="student-dashboard__inline-154">
                {c.label}
              </div>
            </div>
          </div>)}
      </div>

      {/* Quick nav tiles */}
      <h3 className="student-dashboard__inline-163">







      
        TRUY CẬP NHANH
      </h3>
      <div className="student-dashboard__tiles-row">
        {NAV.filter(n => n.key !== "dashboard").map(n => <Link key={n.key} to={n.path} onClick={closeMobileMenu} className="student-dashboard__tile">
        
            <span className="student-dashboard__inline-182">{n.icon}</span>
            <span className="student-dashboard__inline-183">






          
              {n.label}
            </span>
          </Link>)}
      </div>

      {/* Notice */}
      <div className="student-dashboard__notice">
        <strong>📌 Quy định sinh viên:</strong>
        <p className="student-dashboard__inline-200">






        
          Sinh viên chỉ được xem thời khóa biểu cá nhân, đăng ký môn trong thời
          gian mở đăng ký, không đăng ký trùng giờ và không vượt quá số tín chỉ
          tối đa cho phép.
        </p>
      </div>
    </div>;
  return <div className="student-dashboard__root">
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${isMobileMenuOpen ? "active" : ""} student-dashboard__sidebar`}>

        
        {/* Brand */}
        <div className="student-dashboard__brand">
          <div className="student-dashboard__brand-icon">
            <FaUserCircle size={22} />
          </div>
          <div>
            <div className="student-dashboard__brand-title">Cổng Sinh Viên</div>
            <div className="student-dashboard__brand-sub">
              {loading ? "Đang tải..." : studentInfo?.student_id || "N/A"}
            </div>
          </div>
        </div>

        {/* Avatar area */}
        {studentInfo && <div className="student-dashboard__user-area">
            <div className="student-dashboard__avatar-circle">
              {studentInfo.name?.charAt(0) || "S"}
            </div>
            <div className="student-dashboard__user-name">{studentInfo.name}</div>
            <div className="student-dashboard__user-role">Sinh viên</div>
          </div>}

        <hr className="student-dashboard__divider" />

        {/* Nav */}
        <nav className="student-dashboard__inline-252">
          {NAV.map(n => <Link key={n.key} to={n.path} onClick={closeMobileMenu} className="student-dashboard__inline-254">
            
              <div style={S.navItem(isActive(n.key))}>
                <span style={{
              opacity: isActive(n.key) ? 1 : 0.7
            }} className="student-dashboard__inline-261">
                
                  {n.icon}
                </span>
                {n.label}
              </div>
            </Link>)}
        </nav>

        {/* Logout */}
        <button onClick={() => {
        logout();
        navigate("/login");
      }} className="student-dashboard__logout-btn">
          
          <FaSignOutAlt /> Đăng xuất
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="student-dashboard__main">
        <MobileMenuButton onClick={toggleMobileMenu} isOpen={isMobileMenuOpen} />
        

        {/* Topbar */}
        <header className="student-dashboard__topbar">
          <div className="student-dashboard__inline-293">
            <span className="student-dashboard__inline-294">
              {NAV.find(n => isActive(n.key))?.icon || <FaHome />}
            </span>
            <h2 className="student-dashboard__page-title">
              {NAV.find(n => isActive(n.key))?.label || "Dashboard"}
            </h2>
          </div>
        </header>

        <div className="student-dashboard__content">
          <Routes>
            <Route path="/" element={HomePage} />
            <Route path="dashboard" element={HomePage} />
            <Route path="timetable" element={<StudentTimetable studentInfo={studentInfo} />} />
            
            <Route path="register" element={<StudentRegister registeredIds={registeredIds} setRegisteredIds={setRegisteredIds} studentInfo={studentInfo} />} />
            
            <Route path="notifications" element={<ChangePassword registeredIds={registeredIds} />} />
            
          </Routes>
        </div>
      </main>
    </div>;
};

// ── Styles ────────────────────────────────────────────────────
const S = {
  navItem: a => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: a ? 600 : 500,
    color: a ? "#4f46e5" : "#64748b",
    background: a ? "#eef2ff" : "transparent",
    marginBottom: 4,
    cursor: "pointer",
    transition: "all 0.15s",
    textDecoration: "none"
  })
};
export default StudentDashboard;
