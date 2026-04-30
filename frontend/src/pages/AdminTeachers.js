import React, { useEffect, useState } from "react";
import { teachersAPI } from "../services/api";
import toast from "react-hot-toast";

const AdminTeachers = () => {
  const teacher = [
    {
      id: "GV001",
      name: "Nguyễn Văn A",
      degree: "Tiến sĩ",
      major: "Công nghệ phần mềm",
      phone: "0901.xxx.xxx",
    },
    {
      id: "GV002",
      name: "Trần Thị B",
      degree: "Thạc sĩ",
      major: "An toàn thông tin",
      phone: "0902.xxx.xxx",
    },
    {
      id: "GV003",
      name: "Lê Văn C",
      degree: "Tiến sĩ",
      major: "Mạng máy tính",
      phone: "0903.xxx.xxx",
    },
  ];

  const [teachers, setTeachers] = useState([]);

  const fetchTeacher = async () => {
    try {
      const respone = await teachersAPI.getAll(`?_t=${Date.now()}`);
      setTeachers(respone.data);
    } catch (e) {
      console.log(e);
      toast.error("Don't load sucess data");
    }
  };

  useEffect(() => {
    fetchTeacher();
  });

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        👥 QUẢN LÝ GIẢNG VIÊN
      </h2>

      <button
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          background: "#27ae60",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        + Thêm giảng viên mới
      </button>

      <table
        style={{
          width: "100%",
          background: "white",
          borderCollapse: "collapse",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ background: "#34495e", color: "white" }}>
          <tr>
            <th style={{ padding: "12px" }}>Mã GV</th>
            <th>Họ tên</th>
            <th>Học vị</th>
            <th>Chuyên môn</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr
              key={t.id}
              style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
            >
              <td style={{ padding: "12px" }}>{t.teacher_id}</td>
              <td style={{ fontWeight: "bold" }}>{t.name}</td>
              <td>{t.degree}</td>
              <td>{t.expertise}</td>
              <td>
                <button style={{ marginRight: "5px" }}>Sửa</button>
                <button style={{ color: "red" }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTeachers;
