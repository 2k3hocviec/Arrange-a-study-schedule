import React, { useEffect, useState } from "react";
import { schedulesAPI, coursesAPI, roomsAPI } from "../services/api";
import toast from "react-hot-toast";

const AdminSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);

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
      const [resSchedules, resCourses, resRooms] = await Promise.all([
        schedulesAPI.getAll(),
        coursesAPI.getAll(),
        roomsAPI.getAll(),
      ]);
      setSchedules(resSchedules.data);
      setCourses(resCourses.data);
      setRooms(resRooms.data);
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
      course_id: "",
      room_id: "",
      dayOfWeek: "",
      start_slot: "",
      end_slot: "",
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
    try {
      await schedulesAPI.delete(id);
      fetchData();
      toast.success("Đã hủy lịch học!");
    } catch (err) {
      toast.error("Không thể xóa lịch này");
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
            <strong>Khóa học:</strong>{" "}
            {new Set(schedules.map((s) => s.course_id)).size}
          </div>
          <div style={{ ...cardStyle, borderLeftColor: "#f39c12" }}>
            <strong>Phòng đang sử dụng:</strong>{" "}
            {new Set(schedules.map((s) => s.room_id)).size}
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
                <label style={labelStyle}>Khóa học</label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {`${c.course_id} : ${c.subject_id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phòng học</label>
                <select
                  name="room_id"
                  value={formData.room_id}
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
                <label style={labelStyle}>Thứ học</label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn thứ --</option>
                  <option value="2">Thứ 2</option>
                  <option value="3">Thứ 3</option>
                  <option value="4">Thứ 4</option>
                  <option value="5">Thứ 5</option>
                  <option value="6">Thứ 6</option>
                  <option value="7">Thứ 7</option>
                  <option value="8">Thứ 7</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tiết bắt đầu</label>
                <select
                  name="start_slot"
                  value={formData.start_slot}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn tiết --</option>
                  <option value="1">Tiết 1</option>
                  <option value="2">Tiết 2</option>
                  <option value="3">Tiết 3</option>
                  <option value="4">Tiết 4</option>
                  <option value="5">Tiết 5</option>
                  <option value="6">Tiết 6</option>
                  <option value="7">Tiết 7</option>
                  <option value="8">Tiết 8</option>
                  <option value="9">Tiết 9</option>
                  <option value="10">Tiết 10</option>
                  <option value="11">Tiết 11</option>
                  <option value="12">Tiết 12</option>
                  <option value="13">Tiết 13</option>
                  <option value="14">Tiết 14</option>
                  <option value="15">Tiết 15</option>
                  <option value="16">Tiết 16</option>
                  <option value="17">Tiết 17</option>
                  <option value="18">Tiết 18</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tiết kết thúc</label>
                <select
                  name="end_slot"
                  value={formData.end_slot}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">-- Chọn tiết --</option>
                  <option value="1">Tiết 1</option>
                  <option value="2">Tiết 2</option>
                  <option value="3">Tiết 3</option>
                  <option value="4">Tiết 4</option>
                  <option value="5">Tiết 5</option>
                  <option value="6">Tiết 6</option>
                  <option value="7">Tiết 7</option>
                  <option value="8">Tiết 8</option>
                  <option value="9">Tiết 9</option>
                  <option value="10">Tiết 10</option>
                  <option value="11">Tiết 11</option>
                  <option value="12">Tiết 12</option>
                  <option value="13">Tiết 13</option>
                  <option value="14">Tiết 14</option>
                  <option value="15">Tiết 15</option>
                  <option value="16">Tiết 16</option>
                  <option value="17">Tiết 17</option>
                  <option value="18">Tiết 18</option>
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
              <th>Mã khóa học</th>
              <th>Phòng</th>
              <th>Thứ học</th>
              <th>Tiết bắt đầu</th>
              <th>Tiết kết thúc</th>
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
                <td>{s.room_id}</td>
                <td>{s.dayOfWeek}</td>
                <td>{s.start_slot}</td>
                <td>{s.end_slot}</td>
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
