import React, { useContext, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import StudentTimetable from "./StudentTimetable";
import StudentRegister from "./StudentRegister";
import StudentNotifications from "./StudentNotifications";
import { studentsAPI, enrollmentsAPI } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import {
  useMobileMenu,
  MobileMenuButton,
  MobileMenuOverlay,
} from "../utils/responsiveHelpers";
import { FaCalendarAlt } from "react-icons/fa";
import { PiBellSimpleRingingFill } from "react-icons/pi";
import { GiArchiveRegister } from "react-icons/gi";
import { TiPin } from "react-icons/ti";

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [registeredIds, setRegisteredIds] = useState([]);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        setLoading(true);
        const res = await studentsAPI.getMe();
        setStudentInfo(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch student info:", err);
        setError("Không thể tải thông tin sinh viên");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchStudentInfo();
    }
  }, [user]);

  useEffect(() => {
    if (!studentInfo || !studentInfo.student_id) return;
    const fetchEnrollments = async () => {
      try {
        const res = await enrollmentsAPI.getByStudentId(studentInfo.student_id);
        if (res.data && Array.isArray(res.data)) {
          const enrolledCourseIds = res.data.map((e) => e.course_id);
          setRegisteredIds(enrolledCourseIds);
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }
    };
    fetchEnrollments();
  }, [studentInfo]);

  const navItemStyle = {
    padding: "clamp(10px, 2vw, 14px) clamp(10px, 2vw, 15px)",
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
    borderTop: "6px solid #00d2ff",
    minWidth: "150px",
    transition: "all 0.3s ease",
  };

  const activeStyle = (path) => ({
    ...navItemStyle,
    background: location.pathname.includes(path) ? "#00a8cc" : "transparent",
  });

  const HomeContent = (
    <div>
      <h1
        style={{
          color: "#2c3e50",
          fontSize: "clamp(24px, 5vw, 28px)",
          marginBottom: "10px",
        }}
      >
        BẢNG ĐIỀU KHIỂN SINH VIÊN
      </h1>
      {loading ? (
        <p style={{ color: "#7f8c8d", fontSize: "clamp(14px, 2vw, 16px)" }}>
          Đang tải thông tin...
        </p>
      ) : error ? (
        <p style={{ color: "#e74c3c", fontSize: "clamp(14px, 2vw, 16px)" }}>
          {" "}
          ❌ {error}
        </p>
      ) : studentInfo ? (
        <div style={{ marginBottom: "30px" }}>
          <p
            style={{
              color: "#7f8c8d",
              marginBottom: "5px",
              fontSize: "clamp(13px, 2vw, 14px)",
            }}
          >
            Mã sinh viên:{" "}
            <strong style={{ color: "#2c3e50" }}>
              {studentInfo.student_id}
            </strong>
          </p>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "clamp(13px, 2vw, 14px)",
            }}
          >
            Họ tên:{" "}
            <strong style={{ color: "#2c3e50" }}>{studentInfo.name}</strong>
          </p>
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          gap: "clamp(12px, 3vw, 25px)",
          marginBottom: "35px",
          flexWrap: "wrap",
        }}
      >
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#00d2ff",
            }}
          >
            {registeredIds.length}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Môn đã đăng ký
          </p>
        </div>
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#00d2ff",
            }}
          >
            18
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Tín chỉ tối đa cho phép
          </p>
        </div>
      </div>
      <div
        style={{
          background: "#fff",
          padding: "clamp(16px, 3vw, 25px)",
          borderRadius: "12px",
          borderLeft: "8px solid #00d2ff",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <h4
          style={{ margin: "0 0 10px 0", fontSize: "clamp(14px, 2vw, 16px)" }}
        >
          {" "}
          <TiPin /> Quy định sinh viên
        </h4>
        <p
          style={{
            margin: 0,
            color: "#34495e",
            lineHeight: 1.7,
            fontSize: "clamp(13px, 2vw, 14px)",
          }}
        >
          Sinh viên chỉ được xem thời khóa biểu cá nhân, đăng ký môn trong thời
          gian mở đăng ký, không đăng ký trùng giờ và không vượt quá số tín chỉ
          tối đa.
        </p>
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
        {/* Sidebar */}
        <div
          className={`sidebar ${isMobileMenuOpen ? "active" : ""}`}
          style={{
            width: "100%",
            maxWidth: "270px",
            background: "#1a1c23",
            color: "white",
            padding: "clamp(12px, 3vw, 20px)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "#00d2ff",
                marginBottom: "0",
                fontSize: "clamp(16px, 3vw, 18px)",
                flex: 1,
              }}
            >
              SINH VIÊN
            </h2>
          </div>
          <p
            style={{
              textAlign: "center",
              color: "#bdc3c7",
              marginTop: 0,
              fontSize: "clamp(11px, 2vw, 13px)",
            }}
          >
            {loading ? "Đang tải..." : studentInfo?.student_id || "N/A"}
          </p>
          {studentInfo && (
            <p
              style={{
                textAlign: "center",
                color: "#95a5a6",
                fontSize: "clamp(11px, 2vw, 12px)",
                marginTop: "-10px",
                marginBottom: "10px",
              }}
            >
              {studentInfo.name}
            </p>
          )}
          <hr style={{ borderColor: "#2d3436", marginBottom: "20px" }} />
          <nav>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={activeStyle("timetable")}>
                <Link
                  to="/student/timetable"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  {" "}
                  <FaCalendarAlt style={{ color: "#00d2ff" }} /> Thời khóa biểu
                </Link>
              </li>
              <li style={activeStyle("register")}>
                <Link
                  to="/student/register"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  {" "}
                  <GiArchiveRegister style={{ color: "#00d2ff" }} /> Đăng ký môn
                  học
                </Link>
              </li>
              <li style={activeStyle("notifications")}>
                <Link
                  to="/student/notifications"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  <PiBellSimpleRingingFill style={{ color: "#00d2ff" }} /> Thông
                  báo
                </Link>
              </li>
            </ul>
          </nav>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              marginTop: "40px",
              width: "100%",
              padding: "clamp(10px, 2vw, 12px)",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(13px, 2vw, 14px)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#c0392b")}
            onMouseOut={(e) => (e.target.style.background = "#e74c3c")}
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
              path="timetable"
              element={<StudentTimetable studentInfo={studentInfo} />}
            />
            <Route
              path="register"
              element={
                <StudentRegister
                  registeredIds={registeredIds}
                  setRegisteredIds={setRegisteredIds}
                  studentInfo={studentInfo}
                />
              }
            />
            <Route
              path="notifications"
              element={<StudentNotifications registeredIds={registeredIds} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
