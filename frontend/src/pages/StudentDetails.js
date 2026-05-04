import React from "react";
import { formatTime } from "./studentData";

const StudentDetails = ({ registeredCourses = [] }) => {
  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "8px" }}>SV_BM 3 - XEM CHI TIẾT MÔN HỌC</h2>
      <p style={{ color: "#7f8c8d", marginBottom: "20px" }}>Chỉ hiển thị chi tiết các môn sinh viên đã đăng ký.</p>

      {registeredCourses.length === 0 ? (
        <div style={{ background: "white", padding: "25px", borderRadius: "10px", color: "#7f8c8d" }}>Bạn chưa đăng ký môn học nào.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "20px" }}>
          {registeredCourses.map((course, index) => (
            <div key={course.id} style={{ background: "white", padding: "22px", borderRadius: "10px", borderLeft: "5px solid #3498db", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <p style={{ marginTop: 0, color: "#7f8c8d" }}>STT: {index + 1}</p>
              <h3 style={{ margin: "0 0 12px 0", color: "#3498db" }}>{course.name}</h3>
              <p><strong>Mã môn học:</strong> {course.id}</p>
              <p><strong>Số tín chỉ:</strong> {course.credits}</p>
              <p><strong>Thời gian:</strong> {formatTime(course)}</p>
              <p><strong>Giáo viên:</strong> {course.teacher}</p>
              <p><strong>Phòng học:</strong> {course.room}</p>
              <p><strong>Học kỳ:</strong> {course.semester}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
