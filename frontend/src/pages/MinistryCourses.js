import React, { useEffect, useState } from "react";
import { coursesAPI, subjectsAPI, teachersAPI } from "../services/api";
import toast from "react-hot-toast";
import { MdMenuBook } from "react-icons/md";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const MinistryCourses = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);

  const [formData, setFormData] = useState({
    subject_id: "",
    teacher_id: "",
    capacity: "",
  });

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu khóa học");
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAllIds();
      setTeachers(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách giáo viên");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAllIds();
      setSubjects(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách môn học");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchSubjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? (value ? Number(value) : "") : value,
    });
  };

  const handleClickCreateCourse = () => {
    setFormData({ subject_id: "", teacher_id: "", capacity: "" });
    setRepair(false);
    setShowForm(!showForm);
  };

  const handleOpenFormUpdate = (course) => {
    setFormData({
      ...course,
      subject_id: course.subject_id || course.subject?.subject_id || "",
      teacher_id: course.teacher_id || course.teacher?.teacher_id || "",
    });
    setRepair(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (repair) {
        await coursesAPI.update(formData.course_id, formData);
        toast.success("Cập nhật khóa học thành công!");
      } else {
        await coursesAPI.create(formData);
        toast.success("Thêm khóa học thành công!");
      }
      setShowForm(false);
      fetchCourses();
    } catch (err) {
      toast.error("Thao tác thất bại!");
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await coursesAPI.delete(id);
      toast.success("Xóa khóa học thành công!");
      fetchCourses();
    } catch (err) {
      toast.error("Không thể xóa khóa học");
    }
  };

  const activeCount = courses.filter((c) => c.status === "Active").length;
  const inactiveCount = courses.filter((c) => c.status === "Inactive").length;

  return (
    <div style={pageWrapper}>
      {/* BREADCRUMB */}
      <div style={breadcrumb}>
        <span style={breadcrumbHome}>Dashboard</span>
        <span style={breadcrumbSep}>›</span>
        <span style={breadcrumbCurrent}>Quản lý khóa học</span>
      </div>

      {/* PAGE HEADER */}
      <div style={pageHeader}>
        <div style={pageHeaderLeft}>
          <div>
            <h1 style={pageTitle}>QUẢN LÝ KHÓA HỌC</h1>
          </div>
        </div>
        <button onClick={handleClickCreateCourse} style={addBtn}>
          <FiPlus size={16} />
          {showForm ? "Đóng Form" : "Thêm khóa học mới"}
        </button>
      </div>

      {/* STAT BANNER */}
      <div style={statBanner}>
        <div style={statBannerInner}>
          <div>
            <p style={statLabel}>Tổng số khóa học</p>
            <p style={statNumber}>{courses.length}</p>
          </div>
          <div style={bannerIconBg}>
            <MdMenuBook size={48} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={modalOverlay}>
          <div style={formCard}>
            {/* HEADER */}
            <div style={modalHeader}>
              <h3 style={formTitle}>
                {repair ? "Cập nhật khóa học" : "Thêm khóa học mới"}
              </h3>

              <button onClick={() => setShowForm(false)} style={closeBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={formGrid}>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Mã môn học</label>

                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    style={fieldInput}
                    required
                  >
                    <option value="">-- Chọn môn học --</option>

                    {subjects.map((s) => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Mã giáo viên</label>

                  <select
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    style={fieldInput}
                    required
                  >
                    <option value="">-- Chọn giáo viên --</option>

                    {teachers.map((t) => (
                      <option key={t.teacher_id} value={t.teacher_id}>
                        {t.teacher_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Số chỗ tối đa</label>

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    style={fieldInput}
                    placeholder="Nhập số lượng sinh viên tối đa"
                    min="1"
                    required
                  />
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Chỗ còn lại</label>

                  <input
                    type="text"
                    value={
                      repair
                        ? formData.remaining_capacity !== undefined
                          ? formData.remaining_capacity
                          : formData.capacity || 0
                        : formData.capacity || 0
                    }
                    disabled
                    style={{
                      ...fieldInput,
                      background: "#f1f5f9",
                      cursor: "not-allowed",
                      color: "#94a3b8",
                    }}
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div style={modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={cancelBtn}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  style={{
                    ...submitBtn,
                    background: repair ? "#4f46e5" : "#16a34a",
                  }}
                >
                  {repair ? "Cập nhật dữ liệu" : "Lưu khóa học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div style={tableCard}>
        <div style={tableHeader}>
          <h3 style={tableTitle}>Danh sách khóa học hiện tại</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>STT</th>
                <th style={th}>MÃ KHÓA HỌC</th>
                <th style={th}>TÊN MÔN HỌC</th>
                <th style={th}>GIÁO VIÊN</th>
                <th style={th}>TỐI ĐA</th>
                <th style={th}>CÒN LẠI</th>
                <th style={th}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => {
                const capacity = course.capacity || 0;
                const remainingCapacity =
                  course.remaining_capacity !== undefined
                    ? course.remaining_capacity
                    : capacity;

                return (
                  <tr key={course.course_id} style={tbodyRow}>
                    <td style={{ ...td, color: "#94a3b8" }}>
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td style={{ ...td, fontWeight: 600, color: "#4f46e5" }}>
                      {course.course_id}
                    </td>
                    <td style={td}>
                      {course.subject?.name || course.subject_id}
                    </td>
                    <td style={td}>
                      {course.teacher?.name || course.teacher_id}
                    </td>
                    <td style={td}>
                      <span style={capacityBadge}>{capacity}</span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          ...capacityBadge,
                          background:
                            remainingCapacity === 0 ? "#fee2e2" : "#dcfce7",
                          color:
                            remainingCapacity === 0 ? "#ef4444" : "#16a34a",
                        }}
                      >
                        {remainingCapacity}
                      </span>
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleOpenFormUpdate(course)}
                        style={editBtn}
                      >
                        <FiEdit2 size={13} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.course_id)}
                        style={deleteBtn}
                      >
                        <FiTrash2 size={13} /> Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {courses.length > 0 && (
          <div style={tableFooter}>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              Hiển thị 1–{courses.length} trên {courses.length} khóa học
            </span>
          </div>
        )}
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
  marginBottom: "20px",
  fontSize: "13px",
};
const breadcrumbHome = { color: "#94a3b8", cursor: "pointer" };
const breadcrumbSep = { color: "#cbd5e1" };
const breadcrumbCurrent = { color: "#4f46e5", fontWeight: 600 };

const pageHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
  flexWrap: "wrap",
  gap: "12px",
};
const pageHeaderLeft = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};
const headerIconWrap = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  background: "#ede9fe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const pageTitle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 800,
  color: "#1e293b",
  letterSpacing: "0.3px",
};
const pageSubtitle = {
  margin: "2px 0 0",
  fontSize: "13px",
  color: "#94a3b8",
};

const addBtn = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "10px 20px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

// Stat banner
const statBanner = {
  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
  borderRadius: "14px",
  padding: "24px 28px",
  marginBottom: "24px",
  color: "white",
  position: "relative",
  overflow: "hidden",
};
const statBannerInner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};
const statLabel = { margin: 0, fontSize: "13px", opacity: 0.85 };
const statNumber = {
  margin: "4px 0",
  fontSize: "42px",
  fontWeight: 700,
  lineHeight: 1.1,
};
const statFootnote = { margin: 0, fontSize: "13px", opacity: 0.75 };
const statArrow = { marginRight: "4px" };
const bannerIconBg = {
  position: "absolute",
  right: "28px",
  top: "50%",
  transform: "translateY(-50%)",
};
const miniStatRow = { display: "flex", gap: "24px" };
const miniStat = { display: "flex", alignItems: "center", gap: "8px" };
const miniStatDot = (color) => ({
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: color,
});
const miniStatText = { fontSize: "13px", opacity: 0.9 };

// Form
const formTitle = {
  margin: "0 0 20px",
  fontSize: "16px",
  fontWeight: 700,
  color: "#1e293b",
};
const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "8px",
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
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

// Table
const tableCard = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
};
const tableHeader = {
  padding: "18px 24px 14px",
  borderBottom: "1px solid #f1f5f9",
};
const tableTitle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: 700,
  color: "#1e293b",
};
const table = {
  width: "100%",
  borderCollapse: "collapse",
};
const theadRow = {
  background: "#f8fafc",
};
const th = {
  padding: "11px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.6px",
  borderBottom: "1px solid #e2e8f0",
};
const tbodyRow = {
  borderBottom: "1px solid #f1f5f9",
  transition: "background 0.15s",
};
const td = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#334155",
};
const capacityBadge = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: 600,
  background: "#ede9fe",
  color: "#4f46e5",
};
const editBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  marginRight: "6px",
  padding: "5px 12px",
  background: "#ede9fe",
  color: "#4f46e5",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};
const deleteBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "5px 12px",
  background: "#fee2e2",
  color: "#ef4444",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};
const tableFooter = {
  padding: "14px 24px",
  borderTop: "1px solid #f1f5f9",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "20px",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
};

const closeBtn = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  border: "none",
  background: "#f1f5f9",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "700",
  color: "#64748b",
};

const cancelBtn = {
  padding: "10px 18px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#475569",
  cursor: "pointer",
  fontWeight: "600",
};

const formCard = {
  background: "white",
  borderRadius: "16px",
  padding: "24px",
  width: "100%",
  maxWidth: "850px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  border: "1px solid #e2e8f0",
};

export default MinistryCourses;
