import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import TeacherSchedule from "./TeacherSchedule";
import TeacherBusySchedules from "./TeacherBusySchedules";
import ChangePassword from "./ChangePassword";
import { AuthContext } from "../contexts/AuthContext";
import { teachersAPI } from "../services/api";
import { useMobileMenu, MobileMenuButton, MobileMenuOverlay } from "../utils/responsiveHelpers";
import { FaHome, FaCalendarAlt, FaBell, FaChalkboardTeacher, FaSignOutAlt, FaBookOpen, FaClock, FaLock, FaCalendarCheck } from "react-icons/fa";

// ─────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────
import "../styles/TeacherDashboard.css";
const NAV = [{
  path: "/teacher/dashboard",
  key: "dashboard",
  icon: <FaHome />,
  label: "Dashboard"
}, {
  path: "/teacher/schedule",
  key: "schedule",
  icon: <FaCalendarAlt />,
  label: "Lịch giảng dạy"
}, {
  path: "/teacher/busy-schedules",
  key: "busy-schedules",
  icon: <FaCalendarCheck />,
  label: "Lịch bận"
}, {
  path: "/teacher/notifications",
  key: "notifications",
  icon: <FaLock />,
  label: "Đổi mật khẩu"
}];

// ─────────────────────────────────────────────────────────────
// DATE HELPER
// ─────────────────────────────────────────────────────────────

const getTodayVN = () => {
  const d = new Date();
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return `${days[d.getDay()]}, ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

const TeacherDashboard = () => {
  const {
    user,
    logout
  } = useContext(AuthContext);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numCourses, setNumCourses] = useState(0);
  const [numSlots, setNumSlots] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  } = useMobileMenu();

  // ─────────────────────────────────────────
  // GET TEACHER INFO
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    teachersAPI.getMyInfo().then(res => {
      setTeacherInfo(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  // ─────────────────────────────────────────
  // GET SCHEDULE INFO
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!teacherInfo?.teacher_id) return;
    teachersAPI.getSchedule(teacherInfo.teacher_id).then(res => {
      if (res.data?.course) {
        setNumCourses(res.data.course.length);
        let slots = 0;
        res.data.course.forEach(c => c.schedule?.forEach(s => {
          slots += s.end_slot - s.start_slot + 1;
        }));
        setNumSlots(slots);
      }
    }).catch(console.error);
  }, [teacherInfo]);

  // ─────────────────────────────────────────
  // ACTIVE MENU
  // ─────────────────────────────────────────

  const isActive = key => {
    if (key === "dashboard") {
      return location.pathname === "/teacher" || location.pathname === "/teacher/" || location.pathname === "/teacher/dashboard";
    }
    return location.pathname.split("/").includes(key);
  };

  // ─────────────────────────────────────────
  // HOME PAGE
  // ─────────────────────────────────────────

  const HomePage = <div className="teacher-dashboard__home-page">
      {/* Banner */}
      <div className="teacher-dashboard__banner">
        <div>
          <h1 className="teacher-dashboard__banner-title">
            Xin chào, {loading ? "..." : teacherInfo?.name || "Giảng viên"} 👋
          </h1>

          <p className="teacher-dashboard__banner-sub">
            Mã giảng viên:{" "}
            <strong className="teacher-dashboard__inline-183">
              {teacherInfo?.teacher_id || "N/A"}
            </strong>
          </p>

          <p className="teacher-dashboard__date-text">📅 {getTodayVN()}</p>
        </div>

        <FaChalkboardTeacher size={54} className="teacher-dashboard__inline-191" />

      
      </div>

      {/* Stats */}
      <div className="teacher-dashboard__stats-row">
        {[{
        icon: <FaBookOpen />,
        val: numCourses,
        label: "Lớp học đảm nhận",
        color: "#6366f1"
      }, {
        icon: <FaClock />,
        val: numSlots,
        label: "Tiết dạy trong tuần",
        color: "#22c55e"
      }, {
        icon: <FaBell />,
        val: 2,
        label: "Thông báo mới",
        color: "#f97316"
      }].map((c, i) => <div key={i} style={{
        borderTop: `4px solid ${c.color}`
      }} className="teacher-dashboard__stat-card">
        
            <span style={{
          color: c.color
        }} className="teacher-dashboard__inline-226">{c.icon}</span>

            <div>
              <div style={{
            color: c.color
          }} className="teacher-dashboard__inline-229">
            
                {c.val}
              </div>

              <div className="teacher-dashboard__inline-240">





            
                {c.label}
              </div>
            </div>
          </div>)}
      </div>

      {/* Quick Access */}
      <h3 className="teacher-dashboard__quick-title">TRUY CẬP NHANH</h3>

      <div className="teacher-dashboard__tiles-row">
        {NAV.filter(n => n.key !== "dashboard").map(n => <Link key={n.key} to={n.path} onClick={closeMobileMenu} className="teacher-dashboard__tile">
        
            <span className="teacher-dashboard__inline-265">{n.icon}</span>

            <span className="teacher-dashboard__tile-label">{n.label}</span>
          </Link>)}
      </div>

      {/* Notice */}
      <div className="teacher-dashboard__notice">
        <strong>📌 Quy định giảng viên:</strong>

        <p className="teacher-dashboard__notice-text">
          Giảng viên chỉ được xem lịch giảng dạy cá nhân, theo dõi thông báo từ
          nhà trường và quản lý các lớp học được phân công giảng dạy.
        </p>
      </div>
    </div>;

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return <div className="teacher-dashboard__root">
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />

      {/* ───────────────── SIDEBAR ───────────────── */}
      <aside className={`sidebar ${isMobileMenuOpen ? "active" : ""} teacher-dashboard__sidebar`}>

        
        {/* Brand */}
        <div className="teacher-dashboard__brand">
          <div className="teacher-dashboard__brand-icon">
            <FaChalkboardTeacher size={22} />
          </div>

          <div>
            <div className="teacher-dashboard__brand-title">Cổng Giảng Viên</div>

            <div className="teacher-dashboard__brand-sub">
              {loading ? "Đang tải..." : teacherInfo?.teacher_id || "N/A"}
            </div>
          </div>
        </div>

        {/* User Area */}
        {teacherInfo && <div className="teacher-dashboard__user-area">
            <div className="teacher-dashboard__avatar-circle">
              {teacherInfo.name?.charAt(0) || "T"}
            </div>

            <div className="teacher-dashboard__user-name">{teacherInfo.name}</div>

            <div className="teacher-dashboard__user-role">Giảng viên</div>
          </div>}

        <hr className="teacher-dashboard__divider" />

        {/* NAV */}
        <nav className="teacher-dashboard__inline-328">
          {NAV.map(n => <Link key={n.key} to={n.path} onClick={closeMobileMenu} className="teacher-dashboard__inline-330">
            
              <div style={S.navItem(isActive(n.key))}>
                <span style={{
              opacity: isActive(n.key) ? 1 : 0.7
            }} className="teacher-dashboard__inline-337">
                
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
      }} className="teacher-dashboard__logout-btn">
          
          <FaSignOutAlt />
          Đăng xuất
        </button>
      </aside>

      {/* ───────────────── MAIN ───────────────── */}
      <main className="teacher-dashboard__main">
        <MobileMenuButton onClick={toggleMobileMenu} isOpen={isMobileMenuOpen} />
        

        {/* Topbar */}
        <header className="teacher-dashboard__topbar">
          <div className="teacher-dashboard__inline-374">
            <span className="teacher-dashboard__inline-375">
              {NAV.find(n => isActive(n.key))?.icon || <FaHome />}
            </span>

            <h2 className="teacher-dashboard__page-title">
              {NAV.find(n => isActive(n.key))?.label || "Dashboard"}
            </h2>
          </div>
        </header>

        {/* Content */}
        <div className="teacher-dashboard__content">
          <Routes>
            <Route path="/" element={HomePage} />

            <Route path="dashboard" element={HomePage} />

            <Route path="schedule" element={<TeacherSchedule teacherInfo={teacherInfo} />} />
            

            <Route path="busy-schedules" element={<TeacherBusySchedules />} />

            <Route path="notifications" element={<ChangePassword />} />
          </Routes>
        </div>
      </main>
    </div>;
};

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const S = {
  navItem: a => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: a ? 700 : 400,
    color: a ? "#a5b4fc" : "#a1a1aa",
    background: a ? "rgba(99,102,241,0.15)" : "transparent",
    marginBottom: 2,
    cursor: "pointer",
    transition: "all 0.15s",
    textDecoration: "none"
  })
};
export default TeacherDashboard;
