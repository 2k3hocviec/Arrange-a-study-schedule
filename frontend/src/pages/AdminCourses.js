import React, { useEffect, useState } from "react";
import { coursesAPI, subjectsAPI, teachersAPI } from "../services/api";
import toast from "react-hot-toast";

const AdminCourses = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: "",
    teacher_id: "",
  });

  // 1. Lấy danh sách khóa học từ API
  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu khóa học");
    }
  };
  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu khóa học");
    }
  };
  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu khóa học");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  // 2. Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "credits" ? Number(value) : value,
    });
  };

  // 3. Mở form thêm mới
  const handleClickCreateCourse = () => {
    setFormData({
      subject_id: "",
      teacher_id: "",
    });
    setRepair(false);
    setShowForm(!showForm);
  };

  // 4. Mở form cập nhật
  const handleOpenFormUpdate = (course) => {
    setFormData(course);
    setRepair(true);
    setShowForm(true);
  };

  // 5. Submit Thêm hoặc Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (repair) {
        await coursesAPI.update(formData.course_id, formData);
        toast.success("Cập nhật khóa học thành công!");
      } else {
        await coursesAPI.create(formData);
        toast.success("Thêm khóa học mới thành công!");
      }
      setShowForm(false);
      fetchCourses();
    } catch (err) {
      toast.error("Thao tác thất bại. Vui lòng kiểm tra lại!");
    }
  };

  // 6. Xóa khóa học
  const handleDeleteCourse = async (id) => {
    try {
      await coursesAPI.delete(id);
      fetchCourses();
      toast.success("Xóa khóa học thành công!");
    } catch (err) {
      toast.error("Không thể xóa khóa học này");
    }
  };

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        📚 QUẢN LÝ KHÓA HỌC
      </h2>

      {/* Thống kê nhanh */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={cardStyle}>
          <strong>Tổng số khóa học:</strong> {courses.length}
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#2ecc71" }}>
          <strong>Đang mở:</strong>{" "}
          {courses.filter((c) => c.status === "Active").length}
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#e74c3c" }}>
          <strong>Đã kết thúc:</strong>{" "}
          {courses.filter((c) => c.status === "Inactive").length}
        </div>
      </div>

      <button onClick={handleClickCreateCourse} style={btnPrimaryStyle}>
        {showForm ? "✖ Đóng Form" : "+ Thêm khóa học mới"}
      </button>

      {/* Form Nhập liệu */}
      {showForm && (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <h3 style={{ marginTop: 0 }}>
            {repair ? "🛠 Cập nhật khóa học" : "🆕 Thêm khóa học mới"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Mã môn học</label>
              <input
                name="subject_id"
                value={formData.subject_id}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="Nhập mã môn học (INT1337)"
              />
            </div>
            <div>
              <label style={labelStyle}>Mã giáo viên</label>
              <input
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="Nhập ID giáo viên(GV001)"
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              ...btnPrimaryStyle,
              marginTop: "20px",
              background: repair ? "#3498db" : "#27ae60",
            }}
          >
            {repair ? "Cập nhật dữ liệu" : "Lưu khóa học"}
          </button>
        </form>
      )}

      {/* Bảng danh sách */}
      <table style={tableStyle}>
        <thead style={{ background: "#34495e", color: "white" }}>
          <tr>
            <th style={{ padding: "12px" }}>Mã khóa học</th>
            <th>Mã môn học</th>
            <th>Tên môn học</th>
            <th>Mã Giáo viên</th>
            <th>Tên giáo viên</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.course_id}
              style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
            >
              <td style={{ padding: "12px", fontWeight: "bold" }}>
                {course.course_id}
              </td>
              <td>{course.subject_id}</td>
              <td>
                {subjects.find((s) => s.subject_id === course.subject_id)?.name}
              </td>
              <td>{course.teacher_id}</td>
              <td>
                {teachers.find((t) => t.teacher_id === course.teacher_id)?.name}
              </td>
              <td>
                <button
                  onClick={() => handleOpenFormUpdate(course)}
                  style={btnActionStyle}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.course_id)}
                  style={{ ...btnActionStyle, background: "#e74c3c" }}
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

// --- Styles ---
const cardStyle = {
  flex: 1,
  background: "white",
  padding: "15px",
  borderRadius: "8px",
  borderLeft: "5px solid #3498db",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};
const tableStyle = {
  width: "100%",
  background: "white",
  borderCollapse: "collapse",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};
const formContainerStyle = {
  marginBottom: "30px",
  border: "1px solid #eee",
  padding: "20px",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
};
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "14px",
  fontWeight: "bold",
};
const btnPrimaryStyle = {
  marginBottom: "20px",
  padding: "10px 20px",
  background: "#27ae60",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
};
const btnActionStyle = {
  marginRight: "5px",
  padding: "5px 12px",
  background: "#3498db",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "3px",
};

export default AdminCourses;
