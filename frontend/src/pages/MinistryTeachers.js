import React, { useEffect, useState } from "react";
import { departmentsAPI, teachersAPI, usersAPI } from "../services/api";
import toast from "react-hot-toast";
import { GiTeacher } from "react-icons/gi";

const ROWS_PER_PAGE = 5;

const getTeacherErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot delete teacher that has courses")) {
    return "Không thể xóa giảng viên vì giảng viên đã được phân công khóa học.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate")) {
    return "Mã giảng viên hoặc tài khoản đã tồn tại. Vui lòng kiểm tra lại.";
  }
  if (action === "delete") return "Không thể xóa giảng viên.";
  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
};

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    user_id: 0,
    teacher_id: "",
    name: "",
    degree: "",
    expertise: "",
    department_id: "",
  });

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.data);
    } catch (e) {
      toast.error("Tải dữ liệu không thành công");
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await usersAPI.getAvailableTeachers();
      setAvailableUsers(response.data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách user khả dụng");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Khong the tai danh sach khoa");
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchAvailableUsers();
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "user_id" ? Number(value) : value,
    });
  };

  const handleClickCreate = () => {
    setFormData({
      user_id: 0,
      teacher_id: "",
      name: "",
      degree: "",
      expertise: "",
      department_id: "",
    });
    setRepair(false);
    setShowForm(true);
  };

  const handleOpenFormUpdateTeacher = (teacher) => {
    setFormData(teacher);
    setRepair(true);
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setRepair(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.teacher_id ||
      formData.user_id === 0 ||
      !formData.name ||
      !formData.degree ||
      !formData.expertise ||
      !formData.department_id
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await teachersAPI.create(formData);
      toast.success("Tạo giáo viên thành công!");
      closeModal();
      await fetchTeachers();
      await fetchAvailableUsers();
    } catch (err) {
      toast.error(getTeacherErrorMessage(err));
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (
      !formData.teacher_id ||
      formData.user_id === 0 ||
      !formData.name ||
      !formData.degree ||
      !formData.expertise ||
      !formData.department_id
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await teachersAPI.update(formData.teacher_id, formData);
      toast.success("Cập nhật giáo viên thành công!");
      closeModal();
      await fetchTeachers();
      await fetchAvailableUsers();
    } catch (err) {
      toast.error(getTeacherErrorMessage(err));
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa giảng viên này?")) return;
    try {
      await teachersAPI.delete(id);
      toast.success("Xóa thành công!");
      await fetchTeachers();
      await fetchAvailableUsers();
    } catch (error) {
      console.error(error);
      toast.error(getTeacherErrorMessage(error, "delete"));
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(teachers.length / ROWS_PER_PAGE));
  const paginatedTeachers = teachers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  return (
    <div style={styles.wrapper}>
      {/* Header row */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <GiTeacher style={{ marginRight: 10, verticalAlign: "middle" }} />
          QUẢN LÝ GIẢNG VIÊN
        </h2>
        <button style={styles.addBtn} onClick={handleClickCreate}>
          + Thêm giảng viên mới
        </button>
      </div>

      {/* Stat card */}
      <div style={styles.statRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <GiTeacher size={28} color="#4f63d2" />
          </div>
          <div>
            <div style={styles.statLabel}>TỔNG</div>
            <div style={styles.statValue}>
              {teachers.length.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODAL FORM ==================== */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={closeModal}>
              ×
            </button>

            <h3 style={styles.formTitle}>
              {repair ? "Cập nhật thông tin giảng viên" : "Tạo giảng viên mới"}
            </h3>

            <form
              onSubmit={repair ? handleSubmitUpdate : handleSubmit}
              style={styles.form}
            >
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mã Giáo Viên</label>
                <input
                  type="text"
                  name="teacher_id"
                  placeholder="Nhập mã giáo viên"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
                  required
                  disabled={repair}
                  style={{
                    ...styles.input,
                    background: repair ? "#f0f0f0" : "white",
                  }}
                />
              </div>

              {!repair && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Chọn User (Role: Teacher - Chưa đăng ký)
                  </label>
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  >
                    <option value="">-- Chọn User --</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username || user.email} (ID: {user.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Họ và Tên</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập họ tên giảng viên"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Học vị</label>
                <input
                  type="text"
                  name="degree"
                  placeholder="Ví dụ: Thạc sĩ, Tiến sĩ"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Chuyên môn</label>
                <input
                  type="text"
                  name="expertise"
                  placeholder="Ví dụ: Toán học, Tiếng Anh"
                  value={formData.expertise}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Khoa</label>
                <select
                  name="department_id"
                  value={formData.department_id || ""}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  <option value="">-- Chon khoa --</option>
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

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  background: repair ? "#3498db" : "#27ae60",
                }}
              >
                {repair ? "Cập nhật giảng viên" : "Tạo giảng viên"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>STT</th>
              <th style={styles.th}>MÃ GIẢNG VIÊN</th>
              <th style={styles.th}>HỌ TÊN</th>
              <th style={styles.th}>HỌC VỊ</th>
              <th style={styles.th}>CHUYÊN MÔN</th>
              <th style={styles.th}>KHOA</th>
              <th style={styles.th}>TAI KHOAN</th>
              <th style={styles.th}>USER ID</th>
              <th style={styles.th}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTeachers.length === 0 ? (
              <tr>
                <td colSpan={9} style={styles.emptyCell}>
                  Không có dữ liệu giảng viên
                </td>
              </tr>
            ) : (
              paginatedTeachers.map((t, idx) => (
                <tr key={t.teacher_id} style={styles.tbodyRow}>
                  <td style={styles.td}>
                    {String(
                      (currentPage - 1) * ROWS_PER_PAGE + idx + 1,
                    ).padStart(2, "0")}
                  </td>
                  <td
                    style={{ ...styles.td, color: "#4f63d2", fontWeight: 600 }}
                  >
                    {t.teacher_id}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{t.name}</td>
                  <td style={styles.td}>{t.degree}</td>
                  <td style={styles.td}>{t.expertise}</td>
                  <td style={styles.td}>
                    {t.department
                      ? `${t.department.department_id} - ${t.department.name}`
                      : t.department_id || "-"}
                  </td>
                  <td style={styles.td}>{t.user?.email || "-"}</td>
                  <td style={styles.td}>{t.user_id}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleOpenFormUpdateTeacher(t)}
                    >
                      Sửa
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteTeacher(t.teacher_id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={styles.pagination}>
          <span style={styles.pageInfo}>
            Trang {currentPage} / {totalPages}
          </span>
          <div style={styles.pageButtons}>
            <button
              style={{
                ...styles.pageBtn,
                opacity: currentPage === 1 ? 0.4 : 1,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <button
              style={{
                ...styles.pageBtn,
                background: currentPage === totalPages ? "#4f63d2" : "#e9ecf5",
                color: currentPage === totalPages ? "white" : "#333",
              }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Tiếp theo
            </button>
          </div>
        </div>
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

  /* ==================== MODAL STYLES ==================== */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    maxWidth: 520,
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

  form: { marginTop: 10 },
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
  },

  /* Các style cũ giữ nguyên */
  statRow: { display: "flex", gap: 16, marginBottom: 24 },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "rgb(99, 102, 241)",
    borderRadius: 10,
    padding: "14px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    minWidth: 160,
  },
  statIcon: {
    background: "#eef0fb",
    borderRadius: 8,
    padding: 10,
  },
  statLabel: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: 600,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: { fontSize: 22, fontWeight: 700, color: "#ffffff" },

  tableWrapper: {
    background: "white",
    borderRadius: 10,
    border: "1px solid #e4e9f4",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { background: "#ffffff" },
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
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #eef0f7",
    fontSize: 13,
  },
  pageInfo: { color: "#666" },
  pageButtons: { display: "flex", gap: 8 },
  pageBtn: {
    padding: "6px 16px",
    border: "none",
    borderRadius: 5,
    background: "#e9ecf5",
    color: "#333",
    cursor: "pointer",
    fontWeight: 500,
  },
};

export default AdminTeachers;
