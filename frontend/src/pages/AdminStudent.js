import React, { useEffect, useState } from "react";
import { studentsAPI } from "../services/api";
import toast from "react-hot-toast";
import { PiStudentDuotone } from "react-icons/pi";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: 0,
    student_id: "",
    name: "",
  });
  const [repair, setRepair] = useState(false);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (e) {
      toast.error("Don't load sucess data");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "user_id" ? Number(value) : value,
    });
  };

  function handleClickCreateTeacher() {
    setShowForm(!showForm);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.student_id || formData.user_id === 0 || !formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await studentsAPI.create(formData);
      await fetchStudents();
      setFormData({
        teacher_id: "",
        user_id: 0,
        name: "",
      });
      setShowForm(false);
      toast.success("Tạo sinh viên thành công!");
    } catch (err) {
      toast.error("Tạo sinh viên thất bại!");
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.student_id || formData.user_id === 0 || !formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await studentsAPI.update(formData.student_id, formData);
      await fetchStudents();
      setFormData({
        student_id: "",
        user_id: 0,
        name: "",
      });
      setShowForm(false);
      setRepair(false);
      toast.success("Cập nhật sinh viên thành công!");
    } catch (err) {
      toast.error("Cập nhật sinh viên thất bại!");
    }
  };

  const handleOpenFormUpdateTeacher = async (student) => {
    setFormData(student);
    setRepair(true);
    setShowForm(true);
  };

  const handleDeleteStudent = async (id) => {
    try {
      await studentsAPI.delete(id);
      toast.success("Xóa thành công!");
      await fetchStudents();
      // window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        <PiStudentDuotone /> QUẢN LÝ SINH VIÊN
      </h2>

      <button
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#2ecc71",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleClickCreateTeacher}
      >
        + Thêm sinh viên mới
      </button>

      {showForm && (
        <form
          onSubmit={repair ? handleSubmitUpdate : handleSubmit}
          style={{
            marginBottom: "30px",
            border: "1px solid #ccc",
            padding: "20px",
          }}
        >
          <h3>{repair ? "Cập nhật thông tin sinh viên" : "Tạo sinh viên"} </h3>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Mã Sinh Viên: </label>
            <input
              type="text"
              name="student_id"
              placeholder="Nhập mã sinh viên"
              value={formData.student_id}
              onChange={handleInputChange}
              required
              disabled={repair}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>User ID: </label>
            <input
              type="text"
              name="user_id"
              placeholder="Nhập User ID"
              value={formData.user_id}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Họ tên: </label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên sinh viên"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            {repair ? "Cập nhật sinh viên" : "Tạo sinh viên"}
          </button>
        </form>
      )}

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
            <th style={{ padding: "12px" }}>Mã Sinh viên</th>
            <th>Họ tên</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {students.map((t) => (
            <tr
              key={t.student_id}
              style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
            >
              <td style={{ padding: "12px" }}>{t.student_id}</td>
              <td style={{ fontWeight: "bold" }}>{t.name}</td>
              <td>
                <button
                  style={{ cursor: "pointer", marginRight: "5px" }}
                  onClick={() => handleOpenFormUpdateTeacher(t)}
                >
                  Sửa
                </button>
                <button
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => handleDeleteStudent(t.student_id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminStudents;
