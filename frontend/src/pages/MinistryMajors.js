import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdSubject } from "react-icons/md";
import { departmentsAPI, majorsAPI } from "../services/api";

const EMPTY_FORM = {
  major_id: "",
  name: "",
  department_id: "",
  description: "",
};

const getMajorErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lower = message.toLowerCase();

  if (lower.includes("already exists")) return "Mã chuyên ngành đã tồn tại.";
  if (lower.includes("department not found")) return "Khoa không tồn tại.";
  if (lower.includes("in use")) {
    return "Không thể xóa chuyên ngành đang có sinh viên hoặc môn học.";
  }
  return action === "delete"
    ? "Không thể xóa chuyên ngành."
    : "Không thể lưu chuyên ngành. Vui lòng kiểm tra dữ liệu.";
};

const MinistryMajors = () => {
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchMajors = async () => {
    try {
      const res = await majorsAPI.getAll();
      setMajors(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách chuyên ngành.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách khoa.");
    }
  };

  useEffect(() => {
    fetchMajors();
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (major) => {
    setFormData({
      major_id: major.major_id,
      name: major.name,
      department_id: major.department_id,
      description: major.description || "",
    });
    setEditingId(major.major_id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.major_id || !formData.name || !formData.department_id) {
      toast.error("Vui lòng nhập mã, tên chuyên ngành và khoa.");
      return;
    }

    try {
      if (editingId) {
        await majorsAPI.update(editingId, formData);
        toast.success("Cập nhật chuyên ngành thành công.");
      } else {
        await majorsAPI.create(formData);
        toast.success("Tạo chuyên ngành thành công.");
      }
      resetForm();
      fetchMajors();
    } catch (err) {
      toast.error(getMajorErrorMessage(err), { id: "major-error" });
    }
  };

  const handleDelete = async (majorId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chuyên ngành ${majorId}?`)) return;

    try {
      await majorsAPI.delete(majorId);
      toast.success("Xóa chuyên ngành thành công.");
      fetchMajors();
    } catch (err) {
      toast.error(getMajorErrorMessage(err, "delete"), { id: "major-error" });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <MdSubject style={{ marginRight: 10 }} />
          QUẢN LÝ CHUYÊN NGÀNH
        </h2>
        <button style={styles.addBtn} onClick={openCreate}>
          + Thêm chuyên ngành
        </button>
      </div>

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={resetForm}>
              x
            </button>
            <h3 style={styles.formTitle}>
              {editingId ? "Cập nhật chuyên ngành" : "Tạo chuyên ngành mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mã chuyên ngành</label>
                <input
                  name="major_id"
                  value={formData.major_id}
                  onChange={handleChange}
                  disabled={!!editingId}
                  style={{
                    ...styles.input,
                    background: editingId ? "#f0f0f0" : "white",
                  }}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tên chuyên ngành</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Khoa</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">-- Chọn khoa --</option>
                  {departments.map((department) => (
                    <option
                      key={department.department_id}
                      value={department.department_id}
                    >
                      {department.department_id} - {department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ ...styles.input, minHeight: 80 }}
                />
              </div>
              <button style={styles.submitBtn} type="submit">
                {editingId ? "Cập nhật" : "Tạo chuyên ngành"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>MÃ</th>
              <th style={styles.th}>TÊN CHUYÊN NGÀNH</th>
              <th style={styles.th}>KHOA</th>
              <th style={styles.th}>SINH VIÊN</th>
              <th style={styles.th}>MÔN HỌC</th>
              <th style={styles.th}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {majors.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyCell}>
                  Chưa có chuyên ngành nào
                </td>
              </tr>
            ) : (
              majors.map((major) => (
                <tr key={major.major_id} style={styles.tbodyRow}>
                  <td style={{ ...styles.td, color: "#4f63d2", fontWeight: 700 }}>
                    {major.major_id}
                  </td>
                  <td style={styles.td}>{major.name}</td>
                  <td style={styles.td}>
                    {major.department
                      ? `${major.department.department_id} - ${major.department.name}`
                      : major.department_id}
                  </td>
                  <td style={styles.td}>{major._count?.students || 0}</td>
                  <td style={styles.td}>{major._count?.subjects || 0}</td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => openEdit(major)}>
                      Sửa
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(major.major_id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { padding: "0 4px", fontFamily: "'Segoe UI', sans-serif" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    color: "#2c3e50",
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },
  addBtn: {
    background: "#4f63d2",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    background: "white",
    width: "min(520px, 92vw)",
    borderRadius: 12,
    padding: 24,
    position: "relative",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.25)",
  },
  closeBtn: {
    position: "absolute",
    right: 14,
    top: 12,
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
  },
  formTitle: { marginTop: 0, color: "#1f2937" },
  fieldGroup: { display: "flex", flexDirection: "column", marginBottom: 14 },
  label: { fontWeight: 600, marginBottom: 6, color: "#475569" },
  input: {
    border: "1px solid #dbe2ef",
    borderRadius: 8,
    padding: "10px 12px",
    outline: "none",
  },
  submitBtn: {
    width: "100%",
    border: "none",
    borderRadius: 8,
    padding: "11px 16px",
    background: "#16a34a",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  tableWrapper: {
    background: "white",
    borderRadius: 10,
    overflowX: "auto",
    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    background: "#f8fafc",
    padding: "12px 14px",
    fontSize: 12,
    textAlign: "left",
    color: "#64748b",
  },
  td: {
    padding: "12px 14px",
    borderTop: "1px solid #eef2f7",
    fontSize: 14,
  },
  tbodyRow: { background: "white" },
  emptyCell: { padding: 24, textAlign: "center", color: "#64748b" },
  editBtn: {
    marginRight: 8,
    border: "none",
    borderRadius: 6,
    padding: "7px 10px",
    background: "#e0f2fe",
    color: "#0369a1",
    cursor: "pointer",
  },
  deleteBtn: {
    border: "none",
    borderRadius: 6,
    padding: "7px 10px",
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
  },
};

export default MinistryMajors;
