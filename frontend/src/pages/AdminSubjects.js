import React, { useEffect, useState } from "react";
import { subjectsAPI } from "../services/api";
import toast from "react-hot-toast";

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: "",
    name: "",
    credits: 0,
  });
  const [repair, setRepair] = useState(false);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (e) {
      console.log(e);
      toast.error("Không thể tải dữ liệu môn học");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "credits" ? Number(value) : value,
    });
  };

  const handleClickCreateSubject = () => {
    setFormData({ subject_id: "", name: "", credits: 0 });
    setRepair(false);
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject_id || !formData.name || formData.credits === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await subjectsAPI.create(formData);
      setFormData({ subject_id: "", name: "", credits: 0 });
      setShowForm(false);
      await fetchSubjects();
      toast.success("Tạo môn học thành công!");
    } catch (err) {
      toast.error("Tạo môn học thất bại!");
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    if (!formData.subject_id || !formData.name || formData.credits === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await subjectsAPI.update(formData.subject_id, formData);
      setFormData({ subject_id: "", name: "", credits: 0 });
      setShowForm(false);
      setRepair(false);
      await fetchSubjects();
      toast.success("Cập nhật môn học thành công!");
    } catch (err) {
      toast.error("Cập nhật môn học thất bại!");
    }
  };

  const handleOpenFormUpdateSubject = (subject) => {
    setFormData(subject);
    setRepair(true);
    setShowForm(true);
  };

  const handleDeleteSubject = async (id) => {
    try {
      await subjectsAPI.delete(id);
      await fetchSubjects();
      toast.success("Xóa môn học thành công!");
    } catch (err) {
      console.log(err);
      toast.error("Không thể xóa môn học này");
    }
  };

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        📚 QUẢN LÝ DANH MỤC MÔN HỌC
      </h2>
      <button
        onClick={handleClickCreateSubject}
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
        + Thêm môn học mới
      </button>

      {showForm && (
        <form
          onSubmit={repair ? handleSubmitUpdate : handleSubmit}
          style={{
            marginBottom: "30px",
            border: "1px solid #ccc",
            padding: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>{repair ? "Cập nhật môn học" : "Tạo môn học mới"}</h3>

          <div style={{ marginBottom: "15px" }}>
            <label>Mã Môn Học: </label>
            <input
              type="text"
              name="subject_id"
              placeholder="Nhập mã môn (VD: INT1306)"
              value={formData.subject_id}
              onChange={handleInputChange}
              required
              disabled={repair}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Tên Môn Học: </label>
            <input
              type="text"
              name="name"
              placeholder="Nhập tên môn học"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Số Tín Chỉ: </label>
            <input
              type="number"
              name="credits"
              placeholder="Nhập số tín chỉ"
              value={formData.credits}
              onChange={handleInputChange}
              required
              min="1"
              max="10"
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: repair ? "#3498db" : "#27ae60",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            {repair ? "Cập nhật Môn Học" : "Tạo Môn Học"}
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
        <thead style={{ background: "#8e44ad", color: "white" }}>
          <tr>
            <th style={{ padding: "12px" }}>Mã môn</th>
            <th>Tên môn học</th>
            <th>Số tín chỉ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr
              key={subject.subject_id}
              style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
            >
              <td style={{ padding: "12px" }}>{subject.subject_id}</td>
              <td>{subject.name}</td>
              <td>{subject.credits}</td>
              <td>
                <button
                  onClick={() => handleOpenFormUpdateSubject(subject)}
                  style={{
                    marginRight: "5px",
                    padding: "5px 10px",
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "3px",
                  }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteSubject(subject.subject_id)}
                  style={{
                    padding: "5px 10px",
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "3px",
                  }}
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
export default AdminSubjects;
