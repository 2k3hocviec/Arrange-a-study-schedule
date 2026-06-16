import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoCalendar } from "react-icons/io5";
import { semestersAPI } from "../services/api";

const EMPTY_FORM = {
  name: "",
  school_year: "",
  start_date: "",
  end_date: "",
  is_active: false,
};

const formatDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const getSemesterErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("unique") ||
    lowerMessage.includes("duplicate") ||
    lowerMessage.includes("p2002") ||
    lowerMessage.includes("name_school_year") ||
    lowerMessage.includes("semester_name_school_year_key")
  ) {
    return "Kỳ học này đã tồn tại trong năm học đã chọn. Vui lòng kiểm tra lại tên kỳ học và năm học.";
  }

  if (
    lowerMessage.includes("start_date must be before end_date") ||
    lowerMessage.includes("start date") ||
    lowerMessage.includes("before end date")
  ) {
    return "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.";
  }

  if (
    lowerMessage.includes("start_date and end_date are required") ||
    lowerMessage.includes("required")
  ) {
    return "Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.";
  }

  if (
    lowerMessage.includes("cannot update semester date range") ||
    lowerMessage.includes("outside the new semester date range")
  ) {
    return "Không thể thay đổi thời gian kỳ học vì đã có lịch học nằm ngoài khoảng ngày mới.";
  }

  if (lowerMessage.includes("semester not found") || lowerMessage.includes("not found")) {
    return "Không tìm thấy kỳ học này. Vui lòng tải lại danh sách và thử lại.";
  }

  if (
    lowerMessage.includes("cannot delete semester that has courses") ||
    lowerMessage.includes("has courses")
  ) {
    return "Không thể xóa kỳ học vì đã có khóa học thuộc kỳ này.";
  }

  if (action === "create") {
    return "Không thể thêm kỳ học. Vui lòng kiểm tra lại thông tin.";
  }

  if (action === "update") {
    return "Không thể cập nhật kỳ học. Vui lòng kiểm tra lại thông tin.";
  }

  if (action === "delete") {
    return "Không thể xóa kỳ học.";
  }

  if (action === "activate") {
    return "Không thể đặt kỳ học hiện hành.";
  }

  return "Thao tác thất bại. Vui lòng thử lại.";
};

const MinistrySemesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchSemesters = async () => {
    try {
      const res = await semestersAPI.getAll();
      setSemesters(res.data);
    } catch {
      toast.error("Không thể tải danh sách kỳ học");
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (semester) => {
    setEditingId(semester.semester_id);
    setFormData({
      name: semester.name || "",
      school_year: semester.school_year || "",
      start_date: formatDateInput(semester.start_date),
      end_date: formatDateInput(semester.end_date),
      is_active: Boolean(semester.is_active),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await semestersAPI.update(editingId, formData);
        toast.success("Cập nhật kỳ học thành công");
      } else {
        await semestersAPI.create(formData);
        toast.success("Thêm kỳ học thành công");
      }
      closeForm();
      fetchSemesters();
    } catch (err) {
      toast.error(getSemesterErrorMessage(err, editingId ? "update" : "create"));
    }
  };

  const handleActivate = async (id) => {
    try {
      await semestersAPI.activate(id);
      toast.success("Đã đặt kỳ học hiện hành");
      fetchSemesters();
    } catch (err) {
      toast.error(getSemesterErrorMessage(err, "activate"));
    }
  };

  const handleDelete = async (semester) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa kỳ học ${semester.name} ${semester.school_year}?`,
      )
    ) {
      return;
    }

    try {
      await semestersAPI.delete(semester.semester_id);
      toast.success("Đã xóa kỳ học");
      fetchSemesters();
    } catch (err) {
      toast.error(getSemesterErrorMessage(err, "delete"));
    }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <div style={S.breadcrumb}>Dashboard / Kỳ học</div>
          <h1 style={S.title}>Quản lý kỳ học</h1>
        </div>
        <button type="button" onClick={handleOpenCreate} style={S.addBtn}>
          <FiPlus size={16} />
          Thêm kỳ học mới
        </button>
      </div>

      {showForm && (
        <div style={S.modalOverlay}>
          <div style={S.modalCard}>
            <div style={S.modalHeader}>
              <div style={S.formTitle}>
                <IoCalendar size={18} color="#4f46e5" />
                {editingId ? "Cập nhật kỳ học" : "Thêm kỳ học mới"}
              </div>
              <button type="button" onClick={closeForm} style={S.closeBtn}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={S.formGrid}>
                <label style={S.field}>
                  Tên kỳ học
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={S.input}
                    placeholder="HK1, HK2, HK Hè"
                    required
                  />
                </label>
                <label style={S.field}>
                  Năm học
                  <input
                    name="school_year"
                    value={formData.school_year}
                    onChange={handleChange}
                    style={S.input}
                    placeholder="2025-2026"
                    required
                  />
                </label>
                <label style={S.field}>
                  Ngày bắt đầu
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    style={S.input}
                    required
                  />
                </label>
                <label style={S.field}>
                  Ngày kết thúc
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    style={S.input}
                    required
                  />
                </label>
                <label style={S.checkboxField}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Đặt làm kỳ hiện hành
                </label>
              </div>
              <div style={S.modalFooter}>
                <button type="button" onClick={closeForm} style={S.cancelBtn}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    ...S.submitBtn,
                    background: editingId ? "#4f46e5" : "#16a34a",
                  }}
                >
                  <FiPlus size={15} />
                  {editingId ? "Lưu thay đổi" : "Thêm kỳ học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={S.tableCard}>
        <div style={S.tableHeader}>Danh sách kỳ học</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Tên kỳ</th>
                <th style={S.th}>Năm học</th>
                <th style={S.th}>Bắt đầu</th>
                <th style={S.th}>Kết thúc</th>
                <th style={S.th}>Trạng thái</th>
                <th style={S.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((semester) => (
                <tr key={semester.semester_id} style={S.tr}>
                  <td style={S.td}>{semester.name}</td>
                  <td style={S.td}>{semester.school_year}</td>
                  <td style={S.td}>
                    {new Date(semester.start_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={S.td}>
                    {new Date(semester.end_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={S.td}>
                    <span style={semester.is_active ? S.activeBadge : S.badge}>
                      {semester.is_active ? "Hiện hành" : "Chưa kích hoạt"}
                    </span>
                  </td>
                  <td style={S.td}>
                    {!semester.is_active && (
                      <button
                        type="button"
                        style={S.activateBtn}
                        onClick={() => handleActivate(semester.semester_id)}
                      >
                        Đặt hiện hành
                      </button>
                    )}
                    <button
                      type="button"
                      style={S.editBtn}
                      onClick={() => handleEdit(semester)}
                    >
                      <FiEdit2 size={13} /> Sửa
                    </button>
                    <button
                      type="button"
                      style={S.deleteBtn}
                      onClick={() => handleDelete(semester)}
                    >
                      <FiTrash2 size={13} /> Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {semesters.length === 0 && (
                <tr>
                  <td style={S.empty} colSpan={6}>
                    Chưa có kỳ học nào
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
    padding: "28px 32px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  breadcrumb: { color: "#94a3b8", fontSize: 13, marginBottom: 6 },
  title: { margin: 0, color: "#1e293b", fontSize: 22, fontWeight: 800 },
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  modalCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 760,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 700,
    color: "#64748b",
  },
  formTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#1e293b",
    fontWeight: 700,
    margin: 0,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    color: "#475569",
    fontWeight: 600,
    fontSize: 13,
  },
  input: {
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    fontSize: 14,
  },
  checkboxField: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#475569",
    fontWeight: 600,
    fontSize: 13,
    paddingTop: 24,
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#fff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    padding: "16px 22px",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
    fontWeight: 700,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 12,
    textTransform: "uppercase",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "13px 14px", color: "#334155", fontSize: 14 },
  badge: {
    padding: "4px 10px",
    borderRadius: 20,
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: 700,
    fontSize: 12,
  },
  activeBadge: {
    padding: "4px 10px",
    borderRadius: 20,
    background: "#dcfce7",
    color: "#16a34a",
    fontWeight: 700,
    fontSize: 12,
  },
  activateBtn: {
    marginRight: 6,
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
    background: "#dcfce7",
    color: "#15803d",
    cursor: "pointer",
    fontWeight: 700,
  },
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    marginRight: 6,
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
    background: "#ede9fe",
    color: "#4f46e5",
    cursor: "pointer",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
    background: "#fee2e2",
    color: "#ef4444",
    cursor: "pointer",
  },
  empty: {
    padding: 28,
    textAlign: "center",
    color: "#94a3b8",
  },
};

export default MinistrySemesters;
