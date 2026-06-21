import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCalendarCheck, FaTrash } from "react-icons/fa";
import { teacherBusySchedulesAPI } from "../services/api";

const SLOT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const STATUS_LABEL = {
  pending: "Cần duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};
const STATUS_STYLE = {
  pending: { background: "#fef3c7", color: "#92400e" },
  approved: { background: "#dcfce7", color: "#166534" },
  rejected: { background: "#fee2e2", color: "#991b1b" },
};

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const getErrorMessage = (err) => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);

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
    reason: "",
  });

  const fetchData = () =>
    teacherBusySchedulesAPI
      .getMine()
      .then((res) => setItems(res.data || []))
      .catch(() => toast.error("Không thể tải lịch bận."));

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
        reason: "",
      });
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "teacher-busy-error" });
    }
  };

  const handleDelete = async (busyId) => {
    try {
      await teacherBusySchedulesAPI.delete(busyId);
      toast.success("Đã xóa đơn lịch bận.");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "teacher-busy-error" });
    }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>
            <FaCalendarCheck style={{ color: "#4f46e5", marginRight: 10 }} />
            Lịch bận
          </h2>
          <p style={S.subtitle}>
            Gửi đơn khai báo bận theo ngày và khoảng tiết, chờ phòng đào tạo
            duyệt.
          </p>
        </div>
      </div>

      <div style={S.formCard}>
        <form onSubmit={handleSubmit}>
          <div style={S.formGrid}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Ngày bận</label>
              <input
                type="date"
                name="busy_date"
                value={formData.busy_date}
                onChange={handleChange}
                style={S.input}
                required
              />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Tiết bắt đầu</label>
              <select
                name="start_slot"
                value={formData.start_slot}
                onChange={handleChange}
                style={S.input}
                required
              >
                {SLOT_OPTIONS.map((slot) => (
                  <option key={slot} value={slot}>
                    Tiết {slot}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Tiết kết thúc</label>
              <select
                name="end_slot"
                value={formData.end_slot}
                onChange={handleChange}
                style={S.input}
                required
              >
                {SLOT_OPTIONS.map((slot) => (
                  <option key={slot} value={slot}>
                    Tiết {slot}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.fieldGroupWide}>
              <label style={S.label}>Lý do</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                style={S.input}
                maxLength={255}
                placeholder="Ví dụ: họp khoa, công tác, việc cá nhân"
              />
            </div>
          </div>
          <button type="submit" style={S.submitBtn}>
            Gửi đơn
          </button>
        </form>
      </div>

      <div style={S.tableCard}>
        <div style={S.tableHeader}>Danh sách đơn lịch bận của tôi</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Ngày</th>
                <th style={S.th}>Tiết</th>
                <th style={S.th}>Lý do</th>
                <th style={S.th}>Trạng thái</th>
                <th style={S.th}>Lý do từ chối</th>
                <th style={S.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.busy_id}>
                  <td style={S.td}>
                    {new Date(item.busy_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={S.td}>
                    Tiết {item.start_slot}-{item.end_slot}
                  </td>
                  <td style={S.td}>{item.reason || "-"}</td>
                  <td style={S.td}>
                    <span
                      style={{
                        ...S.badge,
                        ...(STATUS_STYLE[item.status] || {}),
                      }}
                    >
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </td>
                  <td style={S.td}>{item.reject_reason || "-"}</td>
                  <td style={S.td}>
                    {item.status === "pending" ? (
                      <button
                        type="button"
                        style={S.deleteBtn}
                        onClick={() => handleDelete(item.busy_id)}
                      >
                        <FaTrash size={13} />
                      </button>
                    ) : (
                      <span style={S.lockedText}>Đã khóa</span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td style={S.emptyTd} colSpan={6}>
                    Chưa có đơn lịch bận nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const S = {
  page: {
    fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
    color: "#1e293b",
  },
  header: { marginBottom: 16 },
  title: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  subtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 13 },
  formCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: 18,
    marginBottom: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    alignItems: "end",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldGroupWide: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    gridColumn: "span 2",
  },
  label: { fontSize: 13, fontWeight: 700, color: "#475569" },
  input: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "9px 11px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  submitBtn: {
    marginTop: 14,
    border: "none",
    borderRadius: 8,
    background: "rgb(58, 77, 183)",
    color: "#fff",
    padding: "10px 18px",
    fontWeight: 800,
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  tableHeader: {
    padding: 16,
    fontWeight: 800,
    borderBottom: "1px solid #f1f5f9",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 880 },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#334155",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-block",
    borderRadius: 999,
    padding: "4px 9px",
    fontSize: 12,
    fontWeight: 800,
  },
  deleteBtn: {
    border: "none",
    borderRadius: 8,
    width: 32,
    height: 32,
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
  },
  lockedText: { color: "#94a3b8", fontSize: 12 },
  emptyTd: { padding: 24, textAlign: "center", color: "#94a3b8" },
};

export default TeacherBusySchedules;
