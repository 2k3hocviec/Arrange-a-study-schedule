import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import AdminSchedule from "./AdminSchedule";
import AdminRooms from "./AdminRooms";
import AdminTeachers from "./AdminTeachers";
import AdminSubjectsAndCourses from "./AdminSubjectsAndCourses";

const AdminDashboard = () => {
  const navItemStyle = {
    padding: "15px 10px",
    borderBottom: "1px solid #2d3436",
  };
  const linkStyle = {
    color: "white",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
  };
  const statCard = {
    flex: 1,
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    borderTop: "6px solid #a29bfe",
  };

  const HomeContent = (
    <div>
      <h1 style={{ color: "#2c3e50", fontSize: "28px", marginBottom: "30px" }}>
        ĐIỀU HÀNH ĐÀO TẠO
      </h1>
      <div style={{ display: "flex", gap: "25px", marginBottom: "40px" }}>
        <div style={statCard}>
          <h2 style={{ margin: 0, fontSize: "32px", color: "#a29bfe" }}>120</h2>
          <p style={{ color: "#7f8c8d", fontWeight: "bold" }}>
            Môn học hiện có
          </p>
        </div>
        <div style={statCard}>
          <h2 style={{ margin: 0, fontSize: "32px", color: "#a29bfe" }}>45</h2>
          <p style={{ color: "#7f8c8d", fontWeight: "bold" }}>
            Phòng học sẵn sàng
          </p>
        </div>
        <div style={statCard}>
          <h2 style={{ margin: 0, fontSize: "32px", color: "#a29bfe" }}>3</h2>
          <p style={{ color: "#7f8c8d", fontWeight: "bold" }}>Lịch cần duyệt</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>
      <div
        style={{
          width: "280px",
          background: "#1e1621",
          color: "white",
          padding: "20px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#a29bfe",
            marginBottom: "30px",
          }}
        >
          QUẢN TRỊ VIÊN
        </h2>
        <hr style={{ borderColor: "#2d3436" }} />
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={navItemStyle}>
              <Link to="/admin/subjects" style={linkStyle}>
                📚 Quản lý môn học
              </Link>
            </li>
            <li style={navItemStyle}>
              <Link to="/admin/schedule" style={linkStyle}>
                📅 Quản lý lịch học
              </Link>
            </li>
            <li style={navItemStyle}>
              <Link to="/admin/rooms" style={linkStyle}>
                🏢 Quản lý phòng học
              </Link>
            </li>
            <li style={navItemStyle}>
              <Link to="/admin/teachers" style={linkStyle}>
                👥 Quản lý giảng viên
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={() => (window.location.href = "/login")}
          style={{
            marginTop: "30px",
            width: "100%",
            padding: "12px",
            background: "#c0392b",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          Đăng xuất
        </button>
      </div>
      <div style={{ flex: 1, padding: "40px", background: "#f8f9fa" }}>
        <Routes>
          <Route path="/" element={HomeContent} />
          <Route path="dashboard" element={HomeContent} />
          <Route path="subjects" element={<AdminSubjectsAndCourses />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="teachers" element={<AdminTeachers />} />
        </Routes>
      </div>
    </div>
  );
};
export default AdminDashboard;
