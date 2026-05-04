import React, { useEffect, useState } from "react";
import {
  schedulesAPI,
  teachersAPI,
  roomsAPI,
  subjectsAPI,
  coursesAPI,
} from "../services/api";
import toast from "react-hot-toast";

const AdminSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]); // Để đổ vào select Giảng viên
  const [rooms, setRooms] = useState([]); // Để đổ vào select Phòng học
  const [subjects, setSubjects] = useState([]); // Để đổ vào select Môn học
  const [courses, setCourses] = useState([]); // Để đổ vào select Môn học

  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    room_id: "",
    dayOfWeek: "",
    start_slot: "",
    end_slot: "",
  });

  // 1. Fetch tất cả dữ liệu cần thiết
  const fetchData = async () => {
    try {
      const [resSchedules, resTeachers, resRooms, resSubjects] =
        await Promise.all([
          schedulesAPI.getAll(),
          teachersAPI.getAll(),
          roomsAPI.getAll(),
          subjectsAPI.getAll(),
          coursesAPI.getAll(),
        ]);
      setSchedules(resSchedules.data);
      setTeachers(resTeachers.data);
      setRooms(resRooms.data);
      setSubjects(resSubjects.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu lịch học");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClickCreate = () => {
    setFormData({
      schedule_id: "",
      class_id: "",
      subject_id: "",
      teacher_id: "",
      classroom_id: "",
      date: "",
      slot: "",
    });
    setRepair(false);
    setShowForm(!showForm);
  };

  const handleOpenUpdate = (item) => {
    setFormData(item);
    setRepair(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (repair) {
        await schedulesAPI.update(formData.schedule_id, formData);
        toast.success("Cập nhật lịch học thành công!");
      } else {
        await schedulesAPI.create(formData);
        toast.success("Sắp xếp lịch học mới thành công!");
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error("Thao tác thất bại. Lịch học có thể bị trùng!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn hủy lịch học này?")) {
      try {
        await schedulesAPI.delete(id);
        fetchData();
        toast.success("Đã hủy lịch học!");
      } catch (err) {
        toast.error("Không thể xóa lịch này");
      }
    }
  };

  return (
    <>
      <div>
        <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
          📅 ĐIỀU PHỐI LỊCH HỌC
        </h2>

        {/* Thống kê nhanh */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <div style={cardStyle}>
            <strong>Tổng số lịch:</strong> {schedules.length}
          </div>
          <div style={{ ...cardStyle, borderLeftColor: "#8e44ad" }}>
            <strong>Lớp đang học:</strong> {schedules.length > 0 ? "12" : "0"}
          </div>
          <div style={{ ...cardStyle, borderLeftColor: "#f39c12" }}>
            <strong>Phòng đang sử dụng:</strong>{" "}
            {new Set(schedules.map((s) => s.classroom_id)).size}
          </div>
        </div>

        <button onClick={handleClickCreate} style={btnPrimaryStyle}>
          {showForm ? "✖ Đóng Form" : "+ Thêm lịch học mới"}
        </button>

        {/* Form Cập nhật/Thêm mới */}
        {showForm && (
          <form onSubmit={handleSubmit} style={formContainerStyle}>
            <h3 style={{ marginTop: 0 }}>
              {repair ? "🛠 Cập nhật lịch học" : "🆕 Sắp xếp lịch mới"}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "15px",
              }}
            >
              <div>
                <label style={labelStyle}>Mã lớp học</label>
                <input
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                  placeholder="VD: D21CQCN01"
                />
              </div>
              <div>
                <label style={labelStyle}>Môn học</label>
                <select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map((s) => (
                    <option key={s.subject_id} value={s.subject_id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Giảng viên</label>
                <select
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {teachers.map((t) => (
                    <option key={t.teacher_id} value={t.teacher_id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phòng học</label>
                <select
                  name="classroom_id"
                  value={formData.classroom_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.classroom_id} value={r.classroom_id}>
                      {r.classroom_id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ngày học</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Tiết học (Slot)</label>
                <select
                  name="slot"
                  value={formData.slot}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn ca --</option>
                  <option value="1-3">Sáng (1-3)</option>
                  <option value="4-6">Sáng (4-6)</option>
                  <option value="7-9">Chiều (7-9)</option>
                  <option value="10-12">Chiều (10-12)</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{
                ...btnPrimaryStyle,
                marginTop: "20px",
                background: repair ? "#3498db" : "#8e44ad",
              }}
            >
              {repair ? "Xác nhận cập nhật" : "Lưu lịch học"}
            </button>
          </form>
        )}

        {/* Bảng danh sách lịch học */}
        <table style={tableStyle}>
          <thead style={{ background: "#34495e", color: "white" }}>
            <tr>
              <th style={{ padding: "12px" }}>Mã lịch học</th>
              <th>Mã môn học</th>
              <th>Tên Môn Học</th>
              <th>Phòng</th>
              <th>Giáo Viên</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr
                key={s.schedule_id}
                style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
              >
                <td style={{ padding: "12px", fontWeight: "bold" }}>
                  {s.schedule_id}
                </td>
                <td>{s.course_id}</td>
                <td>{s.teacher_name || s.teacher_id}</td>
                <td>{s.classroom_id}</td>
                <td></td>
                <td>
                  {s.date} (Tiết {s.slot})
                </td>
                <td>
                  <button
                    onClick={() => handleOpenUpdate(s)}
                    style={btnActionStyle}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(s.schedule_id)}
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
    </>
  );
};

// --- Styles Toolkit ---
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
  background: "#8e44ad",
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

export default AdminSchedule;
