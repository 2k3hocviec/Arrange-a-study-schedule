import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCalendarCheck, FaTrash } from "react-icons/fa";
import { teacherBusySchedulesAPI } from "../services/api";
import "../styles/TeacherBusySchedules.css";
const SLOT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const STATUS_LABEL = {
  pending: "Cần duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối"
};
const STATUS_STYLE = {
  pending: {
    background: "#fef3c7",
    color: "#92400e"
  },
  approved: {
    background: "#dcfce7",
    color: "#166534"
  },
  rejected: {
    background: "#fee2e2",
    color: "#991b1b"
  }
};
const todayInputValue = () => new Date().toISOString().slice(0, 10);
const getErrorMessage = err => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  if (message.includes("teaching schedule")) {
    return "Không thể đăng ký bận vì khoảng tiết này đã có lịch dạy.";
  }
  if (message.includes("already registered")) {
    return "Bạn đã đăng ký bận khoảng tiết này trước đó.";
  }
  if (message.includes("Only pending")) {
    return "Chỉ đơn đang chờ duyệt mới có thể xóa.";
  }
  return "Thao tác thất bại. Vui lòng kiểm tra lại.";
};
const TeacherBusySchedules = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    busy_date: todayInputValue(),
    start_slot: "1",
    end_slot: "1",
    reason: ""
  });
  const fetchData = () => teacherBusySchedulesAPI.getMine().then(res => setItems(res.data || [])).catch(() => toast.error("Không thể tải lịch bận."));
  useEffect(() => {
    fetchData();
  }, []);
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(current => ({
      ...current,
      [name]: value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (Number(formData.start_slot) > Number(formData.end_slot)) {
      toast.error("Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc.");
      return;
    }
    try {
      await teacherBusySchedulesAPI.create(formData);
      toast.success("Đã gửi đơn lịch bận.");
      setFormData({
        busy_date: todayInputValue(),
        start_slot: "1",
        end_slot: "1",
        reason: ""
      });
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), {
        id: "teacher-busy-error"
      });
    }
  };
  const handleDelete = async busyId => {
    try {
      await teacherBusySchedulesAPI.delete(busyId);
      toast.success("Đã xóa đơn lịch bận.");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), {
        id: "teacher-busy-error"
      });
    }
  };
  return <div className="teacher-busy-schedules__page">
      <div className="teacher-busy-schedules__header">
        <div>
          <h2 className="teacher-busy-schedules__title">
            <FaCalendarCheck className="teacher-busy-schedules__inline-103" />
            Lịch bận
          </h2>
          <p className="teacher-busy-schedules__subtitle">
            Gửi đơn khai báo bận theo ngày và khoảng tiết, chờ phòng đào tạo
            duyệt.
          </p>
        </div>
      </div>

      <div className="teacher-busy-schedules__form-card">
        <form onSubmit={handleSubmit}>
          <div className="teacher-busy-schedules__form-grid">
            <div className="teacher-busy-schedules__field-group">
              <label className="teacher-busy-schedules__label">Ngày bận</label>
              <input type="date" name="busy_date" value={formData.busy_date} onChange={handleChange} required className="teacher-busy-schedules__input" />
              
            </div>
            <div className="teacher-busy-schedules__field-group">
              <label className="teacher-busy-schedules__label">Tiết bắt đầu</label>
              <select name="start_slot" value={formData.start_slot} onChange={handleChange} required className="teacher-busy-schedules__input">
                
                {SLOT_OPTIONS.map(slot => <option key={slot} value={slot}>
                    Tiết {slot}
                  </option>)}
              </select>
            </div>
            <div className="teacher-busy-schedules__field-group">
              <label className="teacher-busy-schedules__label">Tiết kết thúc</label>
              <select name="end_slot" value={formData.end_slot} onChange={handleChange} required className="teacher-busy-schedules__input">
                
                {SLOT_OPTIONS.map(slot => <option key={slot} value={slot}>
                    Tiết {slot}
                  </option>)}
              </select>
            </div>
            <div style={S.fieldGroupWide}>
              <label className="teacher-busy-schedules__label">Lý do</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleChange} maxLength={255} placeholder="Ví dụ: họp khoa, công tác, việc cá nhân" className="teacher-busy-schedules__input" />
              
            </div>
          </div>
          <button type="submit" className="teacher-busy-schedules__submit-btn">
            Gửi đơn
          </button>
        </form>
      </div>

      <div className="teacher-busy-schedules__table-card">
        <div className="teacher-busy-schedules__table-header">Danh sách đơn lịch bận của tôi</div>
        <div className="teacher-busy-schedules__inline-180">
          <table className="teacher-busy-schedules__table">
            <thead>
              <tr>
                <th className="teacher-busy-schedules__th">Ngày</th>
                <th className="teacher-busy-schedules__th">Tiết</th>
                <th className="teacher-busy-schedules__th">Lý do</th>
                <th className="teacher-busy-schedules__th">Trạng thái</th>
                <th className="teacher-busy-schedules__th">Lý do từ chối</th>
                <th className="teacher-busy-schedules__th">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => <tr key={item.busy_id}>
                  <td className="teacher-busy-schedules__td">
                    {new Date(item.busy_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="teacher-busy-schedules__td">
                    Tiết {item.start_slot}-{item.end_slot}
                  </td>
                  <td className="teacher-busy-schedules__td">{item.reason || "-"}</td>
                  <td className="teacher-busy-schedules__td">
                    <span style={{
                  ...(STATUS_STYLE[item.status] || {})
                }} className="teacher-busy-schedules__badge">
                    
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </td>
                  <td className="teacher-busy-schedules__td">{item.reject_reason || "-"}</td>
                  <td className="teacher-busy-schedules__td">
                    {item.status === "pending" ? <button type="button" onClick={() => handleDelete(item.busy_id)} className="teacher-busy-schedules__delete-btn">
                    
                        <FaTrash size={13} />
                      </button> : <span className="teacher-busy-schedules__locked-text">Đã khóa</span>}
                  </td>
                </tr>)}
              {items.length === 0 && <tr>
                  <td colSpan={6} className="teacher-busy-schedules__empty-td">
                    Chưa có đơn lịch bận nào.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
const S = {
  fieldGroupWide: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    gridColumn: "span 2"
  }
};
export default TeacherBusySchedules;
