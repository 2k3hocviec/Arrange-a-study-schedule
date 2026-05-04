import React, { useEffect, useState } from "react";
import { roomsAPI } from "../services/api"; // Giả định bạn đã định nghĩa roomsAPI trong file api.js
import toast from "react-hot-toast";

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [formData, setFormData] = useState({
    classroom_id: "",
    capacity: 0,
    type: "",
    description: "",
    status: "",
  });

  // 1. Lấy danh sách phòng từ API
  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu phòng học");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 2. Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? Number(value) : value,
    });
  };

  // 3. Mở form thêm mới
  const handleClickCreateRoom = () => {
    setFormData({
      classroom_id: "",
      capacity: 0,
      type: "",
      description: "",
      status: "",
    });
    setRepair(false);
    setShowForm(!showForm);
  };

  // 4. Mở form cập nhật
  const handleOpenFormUpdate = (room) => {
    setFormData(room);
    setRepair(true);
    setShowForm(true);
  };

  // 5. Submit Thêm hoặc Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (repair) {
        await roomsAPI.update(formData.classroom_id, formData);
        toast.success("Cập nhật phòng thành công!");
      } else {
        await roomsAPI.create(formData);
        toast.success("Thêm phòng mới thành công!");
      }
      setShowForm(false);
      fetchRooms();
    } catch (err) {
      toast.error("Thao tác thất bại. Vui lòng kiểm tra lại!");
    }
  };

  // 6. Xóa phòng
  const handleDeleteRoom = async (id) => {
    try {
      await roomsAPI.delete(id);
      fetchRooms();
      toast.success("Xóa phòng thành công!");
    } catch (err) {
      toast.error("Không thể xóa phòng này");
    }
  };

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        🏢 QUẢN LÝ PHÒNG HỌC
      </h2>

      {/* Thống kê nhanh */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={cardStyle}>
          <strong>Tổng số phòng:</strong> {rooms.length}
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#2ecc71" }}>
          <strong>Sẵn sàng:</strong>{" "}
          {rooms.filter((r) => r.status === "Ready").length}
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#e74c3c" }}>
          <strong>Đang sử dụng:</strong>{" "}
          {rooms.filter((r) => r.status !== "Ready").length}
        </div>
      </div>

      <button onClick={handleClickCreateRoom} style={btnPrimaryStyle}>
        {showForm ? "✖ Đóng Form" : "+ Thêm phòng học mới"}
      </button>

      {/* Form Nhập liệu */}
      {showForm && (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <h3 style={{ marginTop: 0 }}>
            {repair ? "🛠 Cập nhật phòng" : "🆕 Thêm phòng mới"}
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
              <label style={labelStyle}>Mã Phòng</label>
              <input
                name="classroom_id"
                value={formData.classroom_id}
                onChange={handleInputChange}
                disabled={repair}
                style={inputStyle}
                required
                placeholder="VD: A2-301"
              />
            </div>
            <div>
              <label style={labelStyle}>Sức chứa</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Loại phòng</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="" disabled>
                  -- Chọn loại --
                </option>
                <option value="Theory">Lý thuyết</option>
                <option value="Practice">Thực hành</option>
              </select>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label style={labelStyle}>Trang thiết bị</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Máy chiếu, Điều hòa..."
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="" disabled>
                  -- Chọn trạng thái --
                </option>
                <option value="Ready">Sẵn sàng</option>
                <option value="Used">Đang sử dụng</option>
                <option value="Maintaince">Bảo trì</option>
              </select>
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
            {repair ? "Cập nhật dữ liệu" : "Lưu phòng học"}
          </button>
        </form>
      )}

      {/* Bảng danh sách */}
      <table style={tableStyle}>
        <thead style={{ background: "#34495e", color: "white" }}>
          <tr>
            <th style={{ padding: "12px" }}>Mã phòng</th>
            <th>Sức chứa</th>
            <th>Loại phòng</th>
            <th>Thiết bị</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr
              key={room.classroom_id}
              style={{ borderBottom: "1px solid #eee", textAlign: "center" }}
            >
              <td style={{ padding: "12px", fontWeight: "bold" }}>
                {room.classroom_id}
              </td>
              <td>{room.capacity} chỗ</td>
              <td>{room.type}</td>
              <td>{room.description}</td>
              <td
                style={{
                  color: room.status === "Sẵn sàng" ? "#27ae60" : "#e67e22",
                  fontWeight: "bold",
                }}
              >
                {room.status}
              </td>
              <td>
                <button
                  onClick={() => handleOpenFormUpdate(room)}
                  style={btnActionStyle}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.classroom_id)}
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

// --- Styles (Giữ nguyên phong cách của AdminRooms nhưng đồng bộ với AdminSubjects) ---
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

export default AdminRooms;
