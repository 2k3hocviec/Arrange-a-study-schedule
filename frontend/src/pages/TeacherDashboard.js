import React, { useContext, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import TeacherSchedule from "./TeacherSchedule";
import ChangePassword from "./ChangePassword";

import { AuthContext } from "../contexts/AuthContext";
import { teachersAPI } from "../services/api";

import {
  useMobileMenu,
  MobileMenuButton,
  MobileMenuOverlay,
} from "../utils/responsiveHelpers";

import {
  FaHome,
  FaCalendarAlt,
  FaBell,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaBookOpen,
  FaClock,
  FaLock,
} from "react-icons/fa";

// ─────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────

const NAV = [
  {
    path: "/teacher/dashboard",
    key: "dashboard",
    icon: <FaHome />,
    label: "Dashboard",
  },
  {
    path: "/teacher/schedule",
    key: "schedule",
    icon: <FaCalendarAlt />,
    label: "Lịch giảng dạy",
  },
  {
    path: "/teacher/notifications",
    key: "notifications",
    icon: <FaLock />,
    label: "Đổi mật khẩu",
  },
];

// ─────────────────────────────────────────────────────────────
// DATE HELPER
// ─────────────────────────────────────────────────────────────

const getTodayVN = () => {
  const d = new Date();

  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  return `${days[d.getDay()]}, ngày ${d.getDate()} tháng ${
    d.getMonth() + 1
  } năm ${d.getFullYear()}`;
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [numCourses, setNumCourses] = useState(0);
  const [numSlots, setNumSlots] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();

  // ─────────────────────────────────────────
  // GET TEACHER INFO
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    teachersAPI
      .getMyInfo()
      .then((res) => {
        setTeacherInfo(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ─────────────────────────────────────────
  // GET SCHEDULE INFO
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!teacherInfo?.teacher_id) return;

    teachersAPI
      .getSchedule(teacherInfo.teacher_id)
      .then((res) => {
        if (res.data?.course) {
          setNumCourses(res.data.course.length);

          let slots = 0;

          res.data.course.forEach((c) =>
            c.schedule?.forEach((s) => {
              slots += s.end_slot - s.start_slot + 1;
            }),
          );

          setNumSlots(slots);
        }
      })
      .catch(console.error);
  }, [teacherInfo]);

  // ─────────────────────────────────────────
  // ACTIVE MENU
  // ─────────────────────────────────────────

  const isActive = (key) =>
    location.pathname.includes(key) ||
    (key === "dashboard" &&
      (location.pathname === "/teacher" || location.pathname === "/teacher/"));

  // ─────────────────────────────────────────
  // HOME PAGE
  // ─────────────────────────────────────────

  const HomePage = (
    <div style={S.homePage}>
      {/* Banner */}
      <div style={S.banner}>
        <div>
          <h1 style={S.bannerTitle}>
            Xin chào, {loading ? "..." : teacherInfo?.name || "Giảng viên"} 👋
          </h1>

          <p style={S.bannerSub}>
            Mã giảng viên:{" "}
            <strong style={{ color: "#818cf8" }}>
              {teacherInfo?.teacher_id || "N/A"}
            </strong>
          </p>

          <p style={S.dateText}>📅 {getTodayVN()}</p>
        </div>

        <FaChalkboardTeacher
          size={54}
          style={{ opacity: 0.15, color: "#fff" }}
        />
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          {
            icon: <FaBookOpen />,
            val: numCourses,
            label: "Lớp học đảm nhận",
            color: "#6366f1",
          },
          {
            icon: <FaClock />,
            val: numSlots,
            label: "Tiết dạy trong tuần",
            color: "#22c55e",
          },
          {
            icon: <FaBell />,
            val: 2,
            label: "Thông báo mới",
            color: "#f97316",
          },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              ...S.statCard,
              borderTop: `4px solid ${c.color}`,
            }}
          >
            <span style={{ fontSize: 24, color: c.color }}>{c.icon}</span>

            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: c.color,
                  lineHeight: 1,
                }}
              >
                {c.val}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  marginTop: 3,
                }}
              >
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <h3 style={S.quickTitle}>TRUY CẬP NHANH</h3>

      <div style={S.tilesRow}>
        {NAV.filter((n) => n.key !== "dashboard").map((n) => (
          <Link
            key={n.key}
            to={n.path}
            style={S.tile}
            onClick={closeMobileMenu}
          >
            <span style={{ fontSize: 24, color: "#6366f1" }}>{n.icon}</span>

            <span style={S.tileLabel}>{n.label}</span>
          </Link>
        ))}
      </div>

      {/* Notice */}
      <div style={S.notice}>
        <strong>📌 Quy định giảng viên:</strong>

        <p style={S.noticeText}>
          Giảng viên chỉ được xem lịch giảng dạy cá nhân, theo dõi thông báo từ
          nhà trường và quản lý các lớp học được phân công giảng dạy.
        </p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <div style={S.root}>
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />

      {/* ───────────────── SIDEBAR ───────────────── */}
      <aside
        className={`sidebar ${isMobileMenuOpen ? "active" : ""}`}
        style={S.sidebar}
      >
        {/* Brand */}
        <div style={S.brand}>
          <div style={S.brandIcon}>
            <FaChalkboardTeacher size={22} />
          </div>

          <div>
            <div style={S.brandTitle}>Cổng Giảng Viên</div>

            <div style={S.brandSub}>
              {loading ? "Đang tải..." : teacherInfo?.teacher_id || "N/A"}
            </div>
          </div>
        </div>

        {/* User Area */}
        {teacherInfo && (
          <div style={S.userArea}>
            <div style={S.avatarCircle}>
              {teacherInfo.name?.charAt(0) || "T"}
            </div>

            <div style={S.userName}>{teacherInfo.name}</div>

            <div style={S.userRole}>Giảng viên</div>
          </div>
        )}

        <hr style={S.divider} />

        {/* NAV */}
        <nav style={{ flex: 1 }}>
          {NAV.map((n) => (
            <Link
              key={n.key}
              to={n.path}
              style={{ textDecoration: "none" }}
              onClick={closeMobileMenu}
            >
              <div style={S.navItem(isActive(n.key))}>
                <span
                  style={{
                    fontSize: 15,
                    opacity: isActive(n.key) ? 1 : 0.7,
                  }}
                >
                  {n.icon}
                </span>

                {n.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          style={S.logoutBtn}
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <FaSignOutAlt />
          Đăng xuất
        </button>
      </aside>

      {/* ───────────────── MAIN ───────────────── */}
      <main style={S.main}>
        <MobileMenuButton
          onClick={toggleMobileMenu}
          isOpen={isMobileMenuOpen}
        />

        {/* Topbar */}
        <header style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18, color: "#6366f1" }}>
              {NAV.find((n) => isActive(n.key))?.icon || <FaHome />}
            </span>

            <h2 style={S.pageTitle}>
              {NAV.find((n) => isActive(n.key))?.label || "Dashboard"}
            </h2>
          </div>
        </header>

        {/* Content */}
        <div style={S.content}>
          <Routes>
            <Route path="/" element={HomePage} />

            <Route path="dashboard" element={HomePage} />

            <Route
              path="schedule"
              element={<TeacherSchedule teacherInfo={teacherInfo} />}
            />

            <Route path="notifications" element={<ChangePassword />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const S = {
  root: {
    display: "flex",
    height: "100vh",
    minHeight: "100vh",
    fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
    background: "#f0f2f7",
    overflow: "hidden",
  },

  sidebar: {
    width: 250,
    height: "100vh",
    background: "#18181b",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px 12px",
    flexShrink: 0,
    transition: "all 0.3s",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 8px 16px",
    borderBottom: "1px solid #27272a",
  },

  brandIcon: {
    color: "#818cf8",
    fontSize: 22,
  },

  brandTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#e2e8f0",
  },

  brandSub: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 1,
  },

  userArea: {
    textAlign: "center",
    padding: "16px 8px",
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    margin: "0 auto 8px",
  },

  userName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#e2e8f0",
  },

  userRole: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 2,
  },

  divider: {
    border: "none",
    borderTop: "1px solid #27272a",
    margin: "8px 0 12px",
  },

  navItem: (a) => ({
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
    textDecoration: "none",
  }),

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: "12px 0 0",
    width: "100%",
    padding: "11px",
    background: "#3f1212",
    color: "#fca5a5",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
  },

  topbar: {
    background: "#fff",
    borderBottom: "1px solid #e8eaef",
    padding: "14px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },

  pageTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
  },

  content: {
    flex: 1,
    minHeight: 0,
    padding: "24px 28px",
    overflowY: "auto",
  },

  homePage: {
    maxWidth: "100%",
  },

  banner: {
    background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
    borderRadius: 20,
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    boxShadow: "0 4px 20px rgba(79,70,229,0.3)",
  },

  bannerTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 6px",
  },

  bannerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    margin: 0,
  },

  dateText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },

  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },

  statCard: {
    flex: "1 1 140px",
    background: "#fff",
    borderRadius: 14,
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },

  quickTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "0.06em",
    marginBottom: 12,
  },

  tilesRow: {
    display: "flex",
    gap: 14,
    marginBottom: 24,
    flexWrap: "wrap",
  },

  tile: {
    flex: "1 1 120px",
    background: "#fff",
    borderRadius: 14,
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.15s",
    cursor: "pointer",
  },

  tileLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
    marginTop: 8,
  },

  notice: {
    background: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    borderLeft: "5px solid #6366f1",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    fontSize: 14,
    color: "#1e293b",
  },

  noticeText: {
    margin: "6px 0 0",
    color: "#475569",
    lineHeight: 1.7,
    fontSize: 14,
  },
};

export default TeacherDashboard;
