import React, { useEffect, useState } from "react";
import { enrollmentsAPI, studentsAPI, coursesAPI } from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const PAGE_SIZE = 10;

const MinistryEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
  });

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getAll();
      setEnrollments(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách đăng ký");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách sinh viên");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách khóa học");
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClickCreate = () => {
    setFormData({ student_id: "", course_id: "" });
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.course_id) {
      toast.error("Vui lòng chọn đầy đủ Sinh viên và Khóa học");
      return;
    }
    try {
      await enrollmentsAPI.create(formData);
      toast.success("Đăng ký thành công!");
      setShowForm(false);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const handleDelete = async (enroll) => {
    if (
      !window.confirm(
        `Xóa đăng ký của SV ${enroll.student_id} - Khóa ${enroll.course?.course_code || enroll.course_id}?`,
      )
    )
      return;
    try {
      await enrollmentsAPI.delete({
        student_id: enroll.student_id,
        course_id: enroll.course_id,
      });
      toast.success("Xóa đăng ký thành công!");
      fetchEnrollments();
    } catch (err) {
      toast.error("Không thể xóa đăng ký này");
    }
  };

  const totalPages = Math.ceil(enrollments.length / PAGE_SIZE);
  const paginated = enrollments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={pageWrapper}>
      {/* BREADCRUMB */}
      <div style={breadcrumb}>
        <span style={breadcrumbHome}>Dashboard</span>
        <span style={breadcrumbSep}>›</span>
        <span style={breadcrumbCurrent}>Quản lý ghi danh</span>
      </div>

      {/* PAGE HEADER */}
      <div style={pageHeader}>
        <h1 style={pageTitle}>DANH SÁCH ĐĂNG KÝ HỌC PHẦN</h1>
        <button onClick={handleClickCreate} style={addBtn}>
          <FiPlus size={16} />
          Thêm đăng ký mới
        </button>
      </div>

      {/* STATS BANNER */}
      <div style={statBanner}>
        <div style={statBannerInner}>
          <div>
            <p style={statLabel}>Tổng số lượt đăng ký</p>

            <p style={statNumber}>{enrollments.length}</p>

            <p style={statFootnote}>
              Hệ thống hiện có {students.length} sinh viên và {courses.length}{" "}
              khóa học
            </p>
          </div>

          <div style={bannerIconBg}>
            <FiPlus size={50} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={formTitle}>Thêm đăng ký mới</h3>

              <button onClick={() => setShowForm(false)} style={closeBtn}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={formGrid}>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Sinh viên</label>

                  <select
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    style={fieldInput}
                    required
                  >
                    <option value="">-- Chọn sinh viên --</option>

                    {students.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.student_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Khóa học</label>

                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    style={fieldInput}
                    required
                  >
                    <option value="">-- Chọn khóa học --</option>

                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_code || c.course_id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={modalActions}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={cancelModalBtn}
                >
                  Hủy
                </button>

                <button type="submit" style={submitBtn}>
                  Lưu đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div style={tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>STT</th>
                <th style={th}>MÃ ĐK</th>
                <th style={th}>MÃ SV</th>
                <th style={th}>MÃ CODE</th>
                <th style={th}>MÃ MÔN HỌC</th>
                <th style={th}>NGÀY ĐĂNG KÝ</th>
                <th style={th}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((enroll, index) => (
                <tr key={enroll.enrollment_id} style={tbodyRow}>
                  <td style={{ ...td, color: "#94a3b8" }}>
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(
                      2,
                      "0",
                    )}
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: "#4338ca" }}>
                    {enroll.enrollment_id}
                  </td>
                  <td style={td}>{enroll.student_id}</td>
                  <td style={td}>{enroll.course?.course_code || enroll.course_id}</td>
                  <td style={td}>
                    {enroll.course?.subject_id ||
                      enroll.course?.subject?.subject_id ||
                      "N/A"}
                  </td>
                  <td style={td}>
                    {enroll.createdAt
                      ? new Date(enroll.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => handleDelete(enroll)}
                      style={cancelBtn}
                    >
                      Hủy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={paginationRow}>
          <span style={pageInfo}>
            Trang {page} / {totalPages || 1}
          </span>
          <div style={pageControls}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ ...pageBtn, ...(page === 1 ? pageBtnDisabled : {}) }}
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              style={{
                ...pageBtn,
                ...pageBtnActive,
                ...(page === totalPages || totalPages === 0
                  ? pageBtnDisabled
                  : {}),
              }}
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────────

const pageWrapper = {
  padding: "28px 32px",
  fontFamily: "'Segoe UI', sans-serif",
  background: "#f8fafc",
  minHeight: "100vh",
};

const breadcrumb = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginBottom: "16px",
  fontSize: "13px",
};
const breadcrumbHome = { color: "#94a3b8", cursor: "pointer" };
const breadcrumbSep = { color: "#cbd5e1" };
const breadcrumbCurrent = { color: "#4338ca", fontWeight: 600 };

const pageHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
  flexWrap: "wrap",
  gap: "12px",
};
const pageTitle = {
  margin: 0,
  fontSize: "26px",
  fontWeight: 800,
  color: "#0f172a",
  letterSpacing: "-0.3px",
};
const addBtn = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "11px 22px",
  background: "#4338ca",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "13px",
  letterSpacing: "0.4px",
};

const formCard = {
  background: "white",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #e2e8f0",
};
const formTitle = {
  margin: "0 0 18px",
  fontSize: "15px",
  fontWeight: 700,
  color: "#1e293b",
};
const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginBottom: "4px",
};
const fieldGroup = { display: "flex", flexDirection: "column" };
const fieldLabel = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "6px",
};
const fieldInput = {
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "7px",
  fontSize: "14px",
  color: "#1e293b",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const submitBtn = {
  marginTop: "16px",
  padding: "10px 24px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

const tableCard = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
};
const table = { width: "100%", borderCollapse: "collapse" };
const theadRow = { background: "#f8fafc" };
const th = {
  padding: "12px 18px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.6px",
  borderBottom: "1px solid #e2e8f0",
};
const tbodyRow = { borderBottom: "1px solid #f1f5f9" };
const td = { padding: "15px 18px", fontSize: "14px", color: "#334155" };

const cancelBtn = {
  padding: "5px 14px",
  background: "#fee2e2",
  color: "#ef4444",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
};

const paginationRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 18px",
  borderTop: "1px solid #f1f5f9",
};
const pageInfo = { fontSize: "13px", color: "#64748b" };
const pageControls = { display: "flex", gap: "8px" };
const pageBtn = {
  padding: "7px 18px",
  border: "1px solid #e2e8f0",
  borderRadius: "7px",
  background: "white",
  color: "#334155",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};
const pageBtnActive = {
  background: "#0f172a",
  color: "white",
  border: "1px solid #0f172a",
};
const pageBtnDisabled = {
  opacity: 0.4,
  cursor: "not-allowed",
};

const statBanner = {
  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
  borderRadius: "16px",
  padding: "24px 28px",
  marginBottom: "24px",
  color: "white",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(79,70,229,0.18)",
};

const statBannerInner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statLabel = {
  margin: 0,
  fontSize: "13px",
  opacity: 0.85,
  letterSpacing: "0.08em",
  fontWeight: 600,
};

const statNumber = {
  margin: "6px 0",
  fontSize: "42px",
  fontWeight: 800,
  lineHeight: 1.1,
};

const statFootnote = {
  margin: 0,
  fontSize: "13px",
  opacity: 0.8,
};

const bannerIconBg = {
  position: "absolute",
  right: "28px",
  top: "50%",
  transform: "translateY(-50%)",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: "20px",
};

const modalBox = {
  width: "100%",
  maxWidth: "620px",
  background: "white",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
  animation: "fadeIn 0.25s ease",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const closeBtn = {
  border: "none",
  background: "transparent",
  fontSize: "28px",
  cursor: "pointer",
  color: "#64748b",
  lineHeight: 1,
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "20px",
};

const cancelModalBtn = {
  padding: "10px 20px",
  background: "#e2e8f0",
  color: "#334155",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 600,
};

export default MinistryEnrollments;
