import React, { useEffect, useState } from "react";
import { studentsAPI, usersAPI } from "../services/api";
import toast from "react-hot-toast";
import { PiStudentDuotone } from "react-icons/pi";

const ROWS_PER_PAGE = 10;

const MinistryStudents = () => {
  const [students, setStudents] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    user_id: "",
    student_id: "",
    name: "",
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

  useEffect(() => {
    fetchStudents();
    fetchAvailableUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "user_id" ? Number(value) || "" : value,
    });
  };

  const handleClickCreate = () => {
    setFormData({ user_id: "", student_id: "", name: "" });
    setRepair(false);
    setShowForm(!showForm);
  };

  const handleOpenUpdate = (student) => {
    setFormData({
      user_id: student.user_id,
      student_id: student.student_id,
      name: student.name,
    });
    setRepair(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.student_id || !formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await studentsAPI.create(formData);
      toast.success("Tạo sinh viên thành công!");
      setShowForm(false);
      fetchStudents();
      fetchAvailableUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo sinh viên thất bại!");
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await studentsAPI.update(formData.student_id, formData);
      toast.success("Cập nhật sinh viên thành công!");
      setShowForm(false);
      setRepair(false);
      fetchStudents();
    } catch (err) {
      toast.error("Cập nhật thất bại!");
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
      toast.error("Xóa sinh viên thất bại!");
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

      {/* Stat card - Tổng only */}
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

      {/* Form */}
      {showForm && (
        <form
          onSubmit={repair ? handleSubmitUpdate : handleSubmit}
          style={styles.form}
        >
          <h3 style={styles.formTitle}>
            {repair ? "Cập nhật thông tin sinh viên" : "Tạo sinh viên mới"}
          </h3>

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
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>STT</th>
              <th style={styles.th}>MÃ SINH VIÊN</th>
              <th style={styles.th}>HỌ TÊN</th>
              <th style={styles.th}>USER ID</th>
              <th style={styles.th}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
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
                opacity: currentPage === totalPages ? 0.6 : 1,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
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
  wrapper: {
    padding: "0 4px",
    fontFamily: "'Segoe UI', sans-serif",
  },
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
  statRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "rgb(99, 102, 241)",
    border: "1px solid #e8ecf4",
    borderRadius: 10,
    padding: "14px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    minWidth: 160,
  },
  statIcon: {
    background: "#eef0fb",
    borderRadius: 8,
    padding: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: 600,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#ffffff",
  },
  form: {
    marginBottom: 28,
    border: "1px solid #dde3f0",
    padding: "20px 24px",
    borderRadius: 10,
    backgroundColor: "#f9fafc",
  },
  formTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: 600,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    display: "block",
    marginBottom: 5,
    fontWeight: 600,
    fontSize: 13,
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 6,
    border: "1px solid #cdd3e0",
    fontSize: 14,
    boxSizing: "border-box",
  },
  submitBtn: {
    padding: "10px 22px",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    marginTop: 4,
  },
  tableWrapper: {
    background: "white",
    borderRadius: 10,
    border: "1px solid #e4e9f4",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  theadRow: {
    background: "#ffffff",
  },
  th: {
    padding: "13px 16px",
    color: "#767982",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.5px",
    textAlign: "left",
  },
  tbodyRow: {
    borderBottom: "1px solid #eef0f7",
    transition: "background 0.15s",
  },
  td: {
    padding: "12px 16px",
    fontSize: 14,
    color: "#333",
  },
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
    fontWeight: 500,
  },
  deleteBtn: {
    padding: "5px 14px",
    background: "#fff0f0",
    color: "#e74c3c",
    border: "1px solid #f5c5c5",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #eef0f7",
    fontSize: 13,
  },
  pageInfo: {
    color: "#666",
  },
  pageButtons: {
    display: "flex",
    gap: 8,
  },
  pageBtn: {
    padding: "6px 16px",
    border: "none",
    borderRadius: 5,
    background: "#e9ecf5",
    color: "#333",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13,
  },
};

export default MinistryStudents;
