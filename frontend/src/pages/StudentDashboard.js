import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import StudentTimetable from "./StudentTimetable";
import StudentRegister from "./StudentRegister";
import StudentNotifications from "./StudentNotifications";
import StudentDetails from "./StudentDetails";
import { availableCourses, defaultRegisteredIds, MAX_CREDITS, notifications, STUDENT_ID } from "./studentData";

const storageKey = `student_registered_${STUDENT_ID}`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [registeredIds, setRegisteredIds] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultRegisteredIds;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(registeredIds));
  }, [registeredIds]);

  const registeredCourses = useMemo(
    () => availableCourses.filter((course) => registeredIds.includes(course.id)),
    [registeredIds],
  );

  const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0);
  const relevantNotifications = notifications.filter(
    (item) => item.type === "system" || registeredIds.includes(item.courseId),
  );

  const navItemStyle = { padding: "14px 15px", borderBottom: "1px solid #2d3436", borderRadius: "8px" };
  const linkStyle = { color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", width: "100%" };
  const statCard = {
    flex: 1,
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    borderTop: "6px solid #00d2ff",
  };

  const activeStyle = (path) => ({
    ...navItemStyle,
    background: location.pathname.includes(path) ? "#00a8cc" : "transparent",
  });

  const HomeContent = (
    <div>
      <h1 style={{ color: "#2c3e50", fontSize: "28px", marginBottom: "10px" }}>BẢNG ĐIỀU KHIỂN SINH VIÊN</h1>
      <p style={{ color: "#7f8c8d", marginBottom: "30px" }}>Mã sinh viên: <strong>{STUDENT_ID}</strong></p>

      <div style={{ display: "flex", gap: "25px", marginBottom: "35px", flexWrap: "wrap" }}>
        <div style={statCard}>
          <h2 style={{ margin: 0, fontSize: "32px", color: "#00d2ff" }}>{registeredCourses.length}</h2>
          <p style={{ color: "#7f8c8d", fontWeight: "bold" }}>Môn đã đăng ký</p>
        </div>
        <div style={statCard}>
          <h2 style={{ margin: 0, fontSize: "32px", color: "#00d2ff" }}>{totalCredits}/{MAX_CREDITS}</h2>
          <p style={{ color: "#7f8c8d", fontWeight: "bold" }}>Tín chỉ học kỳ</p>
        </div>
        <div style={statCard}>
          <h2 style={{ margin: 0, fontSize: "32px", color: "#00d2ff" }}>{relevantNotifications.length}</h2>
          <p style={{ color: "#7f8c8d", fontWeight: "bold" }}>Thông báo liên quan</p>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", borderLeft: "8px solid #00d2ff", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <h4 style={{ margin: "0 0 10px 0" }}>📌 Quy định sinh viên</h4>
        <p style={{ margin: 0, color: "#34495e", lineHeight: 1.7 }}>
          Sinh viên chỉ được xem thời khóa biểu cá nhân, đăng ký môn trong thời gian mở đăng ký, không đăng ký trùng giờ và không vượt quá số tín chỉ tối đa.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ width: "270px", background: "#1a1c23", color: "white", padding: "20px" }}>
        <h2 style={{ textAlign: "center", color: "#00d2ff", marginBottom: "8px" }}>SINH VIÊN</h2>
        <p style={{ textAlign: "center", color: "#bdc3c7", marginTop: 0, fontSize: "13px" }}>{STUDENT_ID}</p>
        <hr style={{ borderColor: "#2d3436", marginBottom: "20px" }} />
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={activeStyle("timetable")}><Link to="/student/timetable" style={linkStyle}>📅 Thời khóa biểu</Link></li>
            <li style={activeStyle("register")}><Link to="/student/register" style={linkStyle}>📝 Đăng ký môn học</Link></li>
            <li style={activeStyle("details")}><Link to="/student/details" style={linkStyle}>🔍 Chi tiết môn học</Link></li>
            <li style={activeStyle("notifications")}><Link to="/student/notifications" style={linkStyle}>🔔 Thông báo</Link></li>
          </ul>
        </nav>
        <button onClick={() => navigate("/login")} style={{ marginTop: "40px", width: "100%", padding: "12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Đăng xuất</button>
      </div>
      <div style={{ flex: 1, padding: "40px", background: "#f8f9fa", overflowY: "auto" }}>
        <Routes>
          <Route path="/" element={HomeContent} />
          <Route path="dashboard" element={HomeContent} />
          <Route path="timetable" element={<StudentTimetable registeredCourses={registeredCourses} />} />
          <Route path="register" element={<StudentRegister registeredIds={registeredIds} setRegisteredIds={setRegisteredIds} />} />
          <Route path="details" element={<StudentDetails registeredCourses={registeredCourses} />} />
          <Route path="notifications" element={<StudentNotifications registeredIds={registeredIds} />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
