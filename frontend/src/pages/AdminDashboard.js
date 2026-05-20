import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import AdminSchedule from "./AdminSchedule";
import AdminRooms from "./AdminRooms";
import AdminTeachers from "./AdminTeachers";
import AdminSubjectsAndCourses from "./AdminSubjectsAndCourses";
import AdminStudents from "./AdminStudent";
import {
  useMobileMenu,
  MobileMenuButton,
  MobileMenuOverlay,
} from "../utils/responsiveHelpers";
import { PiStudentDuotone } from "react-icons/pi";
import { MdMeetingRoom, MdSubject } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { GiTeacher } from "react-icons/gi";
import { roomsAPI, subjectsAPI } from "../services/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const location = useLocation();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (e) {
      console.log(e);
      toast.error("Không thể tải dữ liệu");
    }
  };
  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu phòng học");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchRooms();
  }, []);

  const activeStyle = (path) => ({
    ...navItemStyle,
    background: location.pathname.includes(path) ? "#c2c0d5" : "transparent",
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
        ĐIỀU HÀNH ĐÀO TẠO
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
              color: "#a29bfe",
            }}
          >
            {subjects.length}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Môn học hiện có
          </p>
        </div>
        <div style={statCard}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "#a29bfe",
            }}
          >
            {rooms.length}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontWeight: "bold",
              fontSize: "clamp(12px, 2vw, 14px)",
              margin: 0,
            }}
          >
            Số lượng phòng học
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
        {/* Sidebar */}
        <div
          className={`sidebar ${isMobileMenuOpen ? "active" : ""}`}
          style={{
            width: "100%",
            maxWidth: "280px",
            background: "#1e1621",
            color: "white",
            padding: "clamp(12px, 3vw, 20px)",
            transition: "all 0.3s ease",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#dadae4",
              marginBottom: "30px",
              fontSize: "clamp(16px, 3vw, 18px)",
            }}
          >
            QUẢN TRỊ VIÊN
          </h2>
          <hr style={{ borderColor: "#2d3436" }} />
          <nav>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={activeStyle("subjects")}>
                <Link
                  to="/admin/subjects"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  <MdSubject /> Quản lý môn học
                </Link>
              </li>
              <li style={activeStyle("schedule")}>
                <Link
                  to="/admin/schedule"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  <IoCalendar /> Quản lý lịch học
                </Link>
              </li>
              <li style={activeStyle("rooms")}>
                <Link
                  to="/admin/rooms"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  <MdMeetingRoom /> Quản lý phòng học
                </Link>
              </li>
              <li style={activeStyle("teachers")}>
                <Link
                  to="/admin/teachers"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  <GiTeacher /> Quản lý giảng viên
                </Link>
              </li>
              <li style={activeStyle("students")}>
                <Link
                  to="/admin/students"
                  style={linkStyle}
                  onClick={closeMobileMenu}
                >
                  <PiStudentDuotone /> Quản lý sinh viên
                </Link>
              </li>
            </ul>
          </nav>
          <button
            onClick={() => (window.location.href = "/login")}
            style={{
              marginTop: "30px",
              width: "100%",
              padding: "clamp(10px, 2vw, 12px)",
              background: "#c0392b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "clamp(13px, 2vw, 14px)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#a93226")}
            onMouseOut={(e) => (e.target.style.background = "#c0392b")}
          >
            Đăng xuất
          </button>
        </div>

        {/* Main Content */}
        <div style={mainContentStyle}>
          <MobileMenuButton
            onClick={toggleMobileMenu}
            isOpen={isMobileMenuOpen}
          />
          <Routes>
            <Route path="/" element={HomeContent} />
            <Route path="dashboard" element={HomeContent} />
            <Route path="subjects" element={<AdminSubjectsAndCourses />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="students" element={<AdminStudents />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const mainContentStyle = {
  flex: 1,
  padding: "clamp(16px, 3vw, 40px)",
  background: "#f8f9fa",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
};

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
  borderTop: "6px solid #a29bfe",
  minWidth: "150px",
  transition: "all 0.3s ease",
};

export default AdminDashboard;
