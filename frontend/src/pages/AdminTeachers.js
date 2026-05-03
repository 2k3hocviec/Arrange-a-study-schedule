import React, { useEffect, useState } from "react";
import { teachersAPI } from "../services/api";
import toast from "react-hot-toast";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [idUpdate, setIdUpdate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: 0,
    teacher_id: "",
    name: "",
    degree: "",
    expertise: "",
  });
  const [repair, setRepair] = useState(false);
  const [id, setID] = useState("");

  const fetchTeachers = async () => {
    try {
      const respone = await teachersAPI.getAll(`?_t=${Date.now()}`);
      setTeachers(respone.data);
    } catch (e) {
      toast.error("Don't load sucess data");
    }
  };

  useEffect(() => {
    fetchTeachers();
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

    if (
      !formData.teacher_id ||
      formData.user_id === 0 ||
      !formData.name ||
      !formData.degree ||
      !formData.expertise
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await teachersAPI.create(formData);
      setFormData({
        teacher_id: "",
        user_id: 0,
        name: "",
        degree: "",
        expertise: "",
      });
      setShowForm(false);
      await fetchTeachers();
      toast.success("Tạo giáo viên thành công!");
    } catch (err) {
      toast.error("Tạo giáo viên thất bại!");
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (
      !formData.teacher_id ||
      formData.user_id === 0 ||
      !formData.name ||
      !formData.degree ||
      !formData.expertise
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await teachersAPI.update(formData.teacher_id, formData);
      setFormData({
        teacher_id: "",
        user_id: 0,
        name: "",
        degree: "",
        expertise: "",
      });
      setShowForm(!showForm);
      setRepair(!repair);
      await fetchTeachers();
      toast.success("Cập nhật giáo viên thành công!");
    } catch (err) {
      toast.error("Cập nhật giáo viên thất bại!");
    }
  };

  const handleOpenFormUpdateTeacher = async (teacher) => {
    setFormData(teacher);
    setRepair(true);
    setShowForm(true);
  };

  const handleDeleteTeacher = async (id) => {
    try {
      console.log(id);
      await teachersAPI.delete(id);
      toast.success("Xóa thành công!");
      await fetchTeachers();
      // window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        👥 QUẢN LÝ GIẢNG VIÊN
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
        + Thêm giảng viên mới
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
          <h3>{repair ? "Cập nhật thông tin giáo viên" : "Tạo giáo viên"} </h3>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Mã Giáo Viên: </label>
            <input
              type="text"
              name="teacher_id"
              placeholder="Nhập mã giáo viên"
              value={formData.teacher_id}
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
              placeholder="Nhập họ tên giáo viên"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Học vị: </label>
            <input
              type="text"
              name="degree"
              placeholder="Ví dụ: Thạc sĩ, Tiến sĩ"
              value={formData.degree}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Chuyên môn: </label>
            <input
              type="text"
              name="expertise"
              placeholder="Ví dụ: Toán học, Tiếng Anh"
              value={formData.expertise}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            {repair ? "Cập nhật Giảng Viên" : "Tạo Giảng viên"}
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
              key={t.teacher_id}
              style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
            >
              <td style={{ padding: "12px" }}>{t.teacher_id}</td>
              <td style={{ fontWeight: "bold" }}>{t.name}</td>
              <td>{t.degree}</td>
              <td>{t.expertise}</td>
              <td>
                <button
                  style={{ cursor: "pointer", marginRight: "5px" }}
                  onClick={() => handleOpenFormUpdateTeacher(t)}
                >
                  Sửa
                </button>
                <button
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => handleDeleteTeacher(t.teacher_id)}
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

export default AdminTeachers;
