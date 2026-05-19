import React, { useEffect, useState, useContext } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import TeacherSchedule from "./TeacherSchedule";
import TeacherNotifications from "./TeacherNotifications";
import { AuthContext } from "../contexts/AuthContext";
import { teachersAPI } from "../services/api";
import {
  useMobileMenu,
  MobileMenuButton,
  MobileMenuOverlay,
} from "../utils/responsiveHelpers";
import { FaCalendarAlt } from "react-icons/fa";
import { PiBellSimpleRingingFill } from "react-icons/pi";

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [numCourses, setNumCourses] = useState(0);
  const [numSlots, setNumSlots] = useState(0);
  const navigate = useNavigate();
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
    borderTop: "6px solid #00ff88",
    minWidth: "150px",
    transition: "all 0.3s ease",
  };

  const activeStyle = (path) => ({
    ...navItemStyle,
    background: location.pathname.includes(path) ? "#1a8a4f" : "transparent",
  });

  // Lấy thông tin Giảng viên đang đăng nhập từ token
  useEffect(() => {
    if (user) {
      teachersAPI
        .getMyInfo()
        .then((res) => {
          setTeacherInfo(res.data);
        })
        .catch((err) => {
          console.error("Error fetching teacher info:", err);
        });
    }
  }, [user]);

  // Tính toán số lượng lớp học và tiết dạy
  useEffect(() => {
    if (teacherInfo && teacherInfo.teacher_id) {
      teachersAPI
        .getSchedule(teacherInfo.teacher_id)
        .then((res) => {
          if (res.data && res.data.course) {
            // Số lượng lớp học
            setNumCourses(res.data.course.length);

            // Tính tổng tiết dạy trong tuần
            let totalSlots = 0;
            res.data.course.forEach((course) => {
              if (course.schedule && course.schedule.length > 0) {
                course.schedule.forEach((sch) => {
                  totalSlots += sch.end_slot - sch.start_slot + 1;
                });
              }
            });
            setNumSlots(totalSlots);
          }
        })
        .catch((err) => {
          console.error("Error fetching schedule:", err);
        });
    }
  }, [teacherInfo]);

  const HomeContent = (
    <div>
      <h1
        style={{
          color: "#2c3e50",
          fontSize: "clamp(24px, 5vw, 28px)",
          marginBottom: "30px",
        }}
      >
        TỔNG QUAN GIẢNG DẠY
      </h1>
      <div
        style={{
          display: "flex",
          gap: "clamp(12px, 3vw, 25px)",
          marginBottom: "40px",
          flexWrap: "wrap",
        }}
      >
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#00ff88",
            }}
          >
            {numCourses}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Lớp học đảm nhận
          </p>
        </div>
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#00ff88",
            }}
          >
            {numSlots}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Tiết dạy trong tuần
          </p>
        </div>
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#00ff88",
            }}
          >
            2
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Thông báo mới
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
        {/* Sidebar bên trái */}
        <div
          className={`sidebar ${isMobileMenuOpen ? "active" : ""}`}
          style={{
            width: "100%",
            maxWidth: "260px",
            background: "#16211a",
            color: "white",
            padding: "clamp(12px, 3vw, 20px)",
            transition: "all 0.3s ease",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#00ff88",
              marginBottom: "10px",
              fontSize: "clamp(16px, 3vw, 18px)",
            }}
          >
            GIẢNG VIÊN
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#bdc3c7",
              marginTop: 0,
              fontSize: "clamp(11px, 2vw, 13px)",
            }}
          >
            {teacherInfo ? teacherInfo.teacher_id : "Đang tải..."}
          </p>
          {teacherInfo && (
            <p
              style={{
                textAlign: "center",
                color: "#95a5a6",
                fontSize: "clamp(11px, 2vw, 12px)",
                marginTop: "-10px",
                marginBottom: "10px",
              }}
            >
              {teacherInfo ? teacherInfo.name : "Đang tải..."}
            </p>
          )}
          <hr style={{ borderColor: "#2d3436" }} />
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={activeStyle("schedule")}>
              <Link
                to="/teacher/schedule"
                style={linkStyle}
                onClick={closeMobileMenu}
              >
                <FaCalendarAlt style={{ color: "#27ae60" }} /> Lịch giảng dạy
              </Link>
            </li>
            <li style={activeStyle("notifications")}>
              <Link
                to="/teacher/notifications"
                style={linkStyle}
                onClick={closeMobileMenu}
              >
                <PiBellSimpleRingingFill style={{ color: "#27ae60" }} /> Thông
                báo
              </Link>
            </li>
          </ul>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              marginTop: "30px",
              width: "100%",
              padding: "clamp(10px, 2vw, 10px)",
              background: "#c0392b",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "clamp(13px, 2vw, 14px)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#a93226")}
            onMouseOut={(e) => (e.target.style.background = "#c0392b")}
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
            <Route
              path="schedule"
              element={<TeacherSchedule teacherInfo={teacherInfo} />}
            />
            <Route path="notifications" element={<TeacherNotifications />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
