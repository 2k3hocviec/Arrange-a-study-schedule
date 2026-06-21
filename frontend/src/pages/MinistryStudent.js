import React, { useEffect, useState } from "react";
import { studentClassesAPI, studentsAPI, usersAPI } from "../services/api";
import toast from "react-hot-toast";
import { PiStudentDuotone } from "react-icons/pi";

const ROWS_PER_PAGE = 5;

const getStudentErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot delete student that has enrollments")) {
    return "Không thể xóa sinh viên vì sinh viên đã có đăng ký học phần.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate")) {
    return "Mã sinh viên hoặc tài khoản đã tồn tại. Vui lòng kiểm tra lại.";
  }
  if (action === "delete") return "Không thể xóa sinh viên.";
  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
};

const MinistryStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    user_id: "",
    student_id: "",
    name: "",
    class_id: "",
  });

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (e) {
      toast.error("Tải dữ liệu sinh viên thất bại");
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await usersAPI.getAvailableStudents();
      setAvailableUsers(response.data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách user khả dụng");
    }
  };

  const fetchStudentClasses = async () => {
    try {
      const response = await studentClassesAPI.getAll();
      setStudentClasses(response.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách lớp học");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAvailableUsers();
    fetchStudentClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "user_id" ? Number(value) || "" : value,
    });
  };

  const handleClickCreate = () => {
    setFormData({ user_id: "", student_id: "", name: "", class_id: "" });
    setRepair(false);
    setShowForm(true);
  };

  const handleOpenUpdate = (student) => {
    setFormData({
      user_id: student.user_id,
      student_id: student.student_id,
      name: student.name,
      class_id: student.class_id || "",
    });
    setRepair(true);
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setRepair(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.student_id || !formData.name || !formData.class_id) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await studentsAPI.create(formData);
      toast.success("Tạo sinh viên thành công!");
      closeModal();
      fetchStudents();
      fetchAvailableUsers();
    } catch (err) {
      toast.error(getStudentErrorMessage(err));
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.name || !formData.class_id) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await studentsAPI.update(formData.student_id, formData);
      toast.success("Cập nhật sinh viên thành công!");
      closeModal();
      fetchStudents();
    } catch (err) {
      toast.error(getStudentErrorMessage(err));
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sinh viên này?")) return;
    try {
      await studentsAPI.delete(id);
      toast.success("Xóa sinh viên thành công!");
      fetchStudents();
      fetchAvailableUsers();
    } catch (error) {
      toast.error(getStudentErrorMessage(error, "delete"));
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(students.length / ROWS_PER_PAGE));
  const paginatedStudents = students.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  return (
    <div style={styles.wrapper}>
      {/* Header row */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <PiStudentDuotone
            style={{ marginRight: 10, verticalAlign: "middle" }}
          />
          QUẢN LÝ SINH VIÊN
        </h2>
        <button style={styles.addBtn} onClick={handleClickCreate}>
          + Thêm sinh viên mới
        </button>
      </div>

      {/* Stat card */}
      <div style={styles.statRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <PiStudentDuotone size={28} color="#4f63d2" />
          </div>
          <div>
            <div style={styles.statLabel}>TỔNG</div>
            <div style={styles.statValue}>
              {students.length.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODAL ==================== */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={closeModal}>
              ×
            </button>

            <h3 style={styles.formTitle}>
              {repair ? "Cập nhật thông tin sinh viên" : "Tạo sinh viên mới"}
            </h3>

            <form
              onSubmit={repair ? handleSubmitUpdate : handleSubmit}
              style={styles.form}
            >
              {!repair && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Chọn User (Role: Student - Chưa đăng ký)
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
                <label style={styles.label}>Mã Sinh Viên</label>
                <input
                  type="text"
                  name="student_id"
                  placeholder="Nhập mã sinh viên"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                  disabled={repair}
                  style={{
                    ...styles.input,
                    background: repair ? "#f0f0f0" : "white",
                  }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Họ và Tên</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập họ tên sinh viên"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Lớp học</label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  <option value="">-- Chọn lớp học --</option>
                  {studentClasses.map((item) => (
                    <option key={item.class_id} value={item.class_id}>
                      {item.class_id} - {item.name}
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
                {repair ? "Cập nhật sinh viên" : "Tạo sinh viên"}
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
              <th style={styles.th}>MÃ SINH VIÊN</th>
              <th style={styles.th}>HỌ TÊN</th>
              <th style={styles.th}>TÀI KHOẢN</th>
              <th style={styles.th}>LỚP HỌC</th>
              <th style={styles.th}>KHOA</th>
              <th style={styles.th}>USER ID</th>
              <th style={styles.th}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} style={styles.emptyCell}>
                  Không có dữ liệu sinh viên
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student, idx) => (
                <tr key={student.student_id} style={styles.tbodyRow}>
                  <td style={styles.td}>
                    {String(
                      (currentPage - 1) * ROWS_PER_PAGE + idx + 1,
                    ).padStart(2, "0")}
                  </td>
                  <td
                    style={{ ...styles.td, color: "#4f63d2", fontWeight: 600 }}
                  >
                    {student.student_id}
                  </td>
                  <td style={styles.td}>{student.name}</td>
                  <td style={styles.td}>{student.user?.email || "-"}</td>
                  <td style={styles.td}>
                    {student.class
                      ? `${student.class.class_id} - ${student.class.name}`
                      : student.class_id || "-"}
                  </td>
                  <td style={styles.td}>
                    {student.class?.department
                      ? `${student.class.department.department_id} - ${student.class.department.name}`
                      : "-"}
                  </td>
                  <td style={styles.td}>{student.user_id}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleOpenUpdate(student)}
                    >
                      Sửa
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteStudent(student.student_id)}
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

  // Modal Styles
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

  // Các style còn lại giữ nguyên
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

export default MinistryStudents;
