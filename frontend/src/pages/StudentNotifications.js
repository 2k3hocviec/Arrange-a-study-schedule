import React from "react";
import { notifications } from "./studentData";

const StudentNotifications = ({ registeredIds = [] }) => {
  const relevantNotifications = notifications.filter(
    (item) => item.type === "system" || registeredIds.includes(item.courseId),
  );

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "8px" }}>SV_BM 4 - THÔNG BÁO</h2>
      <p style={{ color: "#7f8c8d", marginBottom: "20px" }}>Sinh viên chỉ nhận thông báo toàn trường hoặc liên quan đến môn đã đăng ký.</p>

      {relevantNotifications.map((item) => (
        <div key={item.id} style={{ background: item.type === "system" ? "#fff9c4" : "#e1f5fe", padding: "18px", marginBottom: "15px", borderLeft: `5px solid ${item.type === "system" ? "#f1c40f" : "#3498db"}`, borderRadius: "8px", boxShadow: "0 2px 7px rgba(0,0,0,0.06)" }}>
          <strong style={{ display: "block", marginBottom: "8px", color: "#2c3e50" }}>THÔNG BÁO: {item.title}</strong>
          <div style={{ marginBottom: "8px", color: "#34495e" }}>MÔ TẢ: {item.description}</div>
          <div style={{ color: "#7f8c8d", fontSize: "14px" }}>THỜI GIAN: {item.time}</div>
        </div>
      ))}
    </div>
  );
};

export default StudentNotifications;
