import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PiStudentDuotone } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { majorsAPI, studentClassesAPI } from "../services/api";

const EMPTY_FORM = {
  class_id: "",
  name: "",
  cohort: "",
  major_id: "",
  capacity: "",
};

const getErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lower = message.toLowerCase();

  if (lower.includes("already exists")) return "Mã lớp đã tồn tại.";
  if (lower.includes("has students")) {
    return "Không thể xóa lớp đang có sinh viên.";
  }
  if (lower.includes("capacity")) {
    return "Sĩ số tối đa không hợp lệ hoặc nhỏ hơn số sinh viên hiện có.";
  }

  return action === "delete"
    ? "Không thể xóa lớp học."
    : "Không thể lưu lớp học. Vui lòng kiểm tra dữ liệu.";
};

const MinistryStudentClasses = () => {
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchClasses = async () => {
    try {
      const res = await studentClassesAPI.getAll();
      setClasses(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách lớp học.");
    }
  };

  const fetchMajors = async () => {
    try {
      const res = await majorsAPI.getAll();
      setMajors(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách chuyên ngành.");
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchMajors();
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

  const openEdit = (item) => {
    setFormData({
      class_id: item.class_id,
      name: item.name,
      cohort: item.cohort,
      major_id: item.major_id || "",
      capacity: item.capacity ?? "",
    });
    setEditingId(item.class_id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.class_id ||
      !formData.name ||
      !formData.cohort ||
      !formData.major_id
    ) {
      toast.error("Vui lòng nhập đầy đủ mã lớp, tên lớp, khóa và chuyên ngành.");
      return;
    }

    const payload = {
      ...formData,
      capacity: formData.capacity === "" ? undefined : Number(formData.capacity),
    };

    try {
      if (editingId) {
        await studentClassesAPI.update(editingId, payload);
        toast.success("Cập nhật lớp học thành công.");
      } else {
        await studentClassesAPI.create(payload);
        toast.success("Tạo lớp học thành công.");
      }
      resetForm();
      fetchClasses();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "student-class-error" });
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${classId}?`)) return;

    try {
      await studentClassesAPI.delete(classId);
      toast.success("Xóa lớp học thành công.");
      fetchClasses();
    } catch (err) {
      toast.error(getErrorMessage(err, "delete"), {
        id: "student-class-error",
      });
    }
  };

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredClasses = normalizedKeyword
    ? classes.filter((item) =>
        [
          item.class_id,
          item.name,
          item.cohort,
          item.major_id,
          item.major?.name,
          item.major?.department_id,
          item.major?.department?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword),
      )
    : classes;

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <PiStudentDuotone style={{ marginRight: 10 }} />
          QUẢN LÝ LỚP
        </h2>
        <button style={styles.addBtn} onClick={openCreate}>
          + Thêm lớp
        </button>
      </div>

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={resetForm}>
              ×
            </button>
            <h3 style={styles.formTitle}>
              {editingId ? "Cập nhật lớp học" : "Tạo lớp học mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Chuyên ngành</label>
                <select
                  name="major_id"
                  value={formData.major_id}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">-- Chọn chuyên ngành --</option>
                  {majors.map((major) => (
                    <option key={major.major_id} value={major.major_id}>
                      {major.major_id} - {major.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mã lớp</label>
                <input
                  name="class_id"
                  value={formData.class_id}
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
                <label style={styles.label}>Tên lớp</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Khóa</label>
                <input
                  name="cohort"
                  value={formData.cohort}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Ví dụ: K23"
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Sĩ số tối đa</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Bỏ trống nếu không giới hạn"
                />
              </div>

              <button style={styles.submitBtn} type="submit">
                {editingId ? "Cập nhật" : "Tạo lớp"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <div style={styles.searchWrap}>
            <FiSearch size={15} color="#94a3b8" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tim ma lop, ten lop, khoa, chuyen nganh..."
              style={styles.searchInput}
            />
          </div>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>MÃ LỚP</th>
              <th style={styles.th}>TÊN LỚP</th>
              <th style={styles.th}>KHÓA</th>
              <th style={styles.th}>CHUYÊN NGÀNH</th>
              <th style={styles.th}>KHOA</th>
              <th style={styles.th}>SĨ SỐ</th>
              <th style={styles.th}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.emptyCell}>
                  Chưa có lớp học nào
                </td>
              </tr>
            ) : (
              filteredClasses.map((item) => {
                const studentCount = item._count?.students || 0;
                return (
                  <tr key={item.class_id} style={styles.tbodyRow}>
                    <td
                      style={{
                        ...styles.td,
                        color: "#4f63d2",
                        fontWeight: 700,
                      }}
                    >
                      {item.class_id}
                    </td>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.td}>{item.cohort}</td>
                    <td style={styles.td}>
                      {item.major
                        ? `${item.major.major_id} - ${item.major.name}`
                        : item.major_id || "-"}
                    </td>
                    <td style={styles.td}>
                      {item.major?.department
                        ? `${item.major.department.department_id} - ${item.major.department.name}`
                        : "-"}
                    </td>
                    <td style={styles.td}>
                      {studentCount}/{item.capacity ?? "∞"}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.editBtn}
                        onClick={() => openEdit(item)}
                      >
                        Sửa
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item.class_id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
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
    padding: "10px 18px",
    background: "#4f63d2",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    borderRadius: 12,
    width: "90%",
    maxWidth: 480,
    padding: "24px 28px",
    position: "relative",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 16,
    fontSize: 28,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
    lineHeight: 1,
  },
  formTitle: {
    margin: "0 0 20px 0",
    fontSize: 18,
    color: "#2c3e50",
    fontWeight: 600,
    textAlign: "center",
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    display: "block",
    marginBottom: 6,
    fontWeight: 600,
    fontSize: 13.5,
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #cdd3e0",
    fontSize: 14,
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    marginTop: 10,
    background: "#27ae60",
  },
  tableWrapper: {
    background: "white",
    borderRadius: 10,
    border: "1px solid #e4e9f4",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tableHeader: {
    padding: "16px",
    borderBottom: "1px solid #eef2f7",
    display: "flex",
    justifyContent: "flex-end",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 12px",
    minWidth: 300,
    background: "#fff",
  },
  searchInput: {
    border: "none",
    outline: "none",
    padding: "10px 0",
    fontSize: 14,
    width: "100%",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "13px 16px",
    color: "#767982",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "left",
  },
  tbodyRow: { borderBottom: "1px solid #eef0f7" },
  td: { padding: "12px 16px", fontSize: 14, color: "#333" },
  emptyCell: {
    textAlign: "center",
    padding: "32px",
    color: "#aaa",
    fontSize: 14,
  },
  editBtn: {
    marginRight: 8,
    padding: "5px 14px",
    background: "#f0f3ff",
    color: "#4f63d2",
    border: "1px solid #c5cdf5",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 13,
  },
  deleteBtn: {
    padding: "5px 14px",
    background: "#fff0f0",
    color: "#e74c3c",
    border: "1px solid #f5c5c5",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 13,
  },
};

export default MinistryStudentClasses;
