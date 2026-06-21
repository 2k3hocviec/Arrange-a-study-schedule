import React, { useEffect, useState } from "react";
import { majorsAPI, subjectsAPI } from "../services/api";
import toast from "react-hot-toast";
import { MdMenuBook } from "react-icons/md";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const PAGE_SIZE = 5;

const getSubjectErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot delete subject that has courses")) {
    return "KhÃ´ng thá»ƒ xÃ³a mÃ´n há»c vÃ¬ Ä‘Ã£ cÃ³ khÃ³a há»c thuá»™c mÃ´n nÃ y.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate")) {
    return "MÃ£ mÃ´n há»c Ä‘Ã£ tá»“n táº¡i. Vui lÃ²ng kiá»ƒm tra láº¡i.";
  }
  if (action === "delete") return "KhÃ´ng thá»ƒ xÃ³a mÃ´n há»c.";
  return "Thao tÃ¡c tháº¥t báº¡i. Vui lÃ²ng kiá»ƒm tra láº¡i dá»¯ liá»‡u.";
};

const MinistrySubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [majors, setMajors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    subject_id: "",
    name: "",
    credits: 0,
    major_id: "",
    allow_same_major: false,
    allow_same_department: false,
  });

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (e) {
      toast.error("KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u mÃ´n há»c");
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await majorsAPI.getAll();
      setMajors(response.data || []);
    } catch (e) {
      toast.error("Không thể tải danh sách chuyên ngành");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchMajors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "credits"
            ? Number(value)
            : value,
    });
  };

  const handleClickCreateSubject = () => {
    setFormData({
      subject_id: "",
      name: "",
      credits: 0,
      major_id: "",
      allow_same_major: false,
      allow_same_department: false,
    });
    setRepair(false);
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.subject_id ||
      !formData.name ||
      formData.credits === 0 ||
      !formData.major_id
    ) {
      toast.error("Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin.");
      return;
    }
    try {
      await subjectsAPI.create(formData);
      setFormData({
        subject_id: "",
        name: "",
        credits: 0,
        major_id: "",
        allow_same_major: false,
        allow_same_department: false,
      });
      setShowForm(false);
      await fetchSubjects();
      toast.success("Táº¡o mÃ´n há»c thÃ nh cÃ´ng!");
    } catch (err) {
      toast.error(getSubjectErrorMessage(err));
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (
      !formData.subject_id ||
      !formData.name ||
      formData.credits === 0 ||
      !formData.major_id
    ) {
      toast.error("Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin.");
      return;
    }
    try {
      await subjectsAPI.update(formData.subject_id, formData);
      setFormData({
        subject_id: "",
        name: "",
        credits: 0,
        major_id: "",
        allow_same_major: false,
        allow_same_department: false,
      });
      setShowForm(false);
      setRepair(false);
      await fetchSubjects();
      toast.success("Cáº­p nháº­t mÃ´n há»c thÃ nh cÃ´ng!");
    } catch (err) {
      toast.error(getSubjectErrorMessage(err));
    }
  };

  const handleOpenFormUpdateSubject = (subject) => {
    setFormData(subject);
    setRepair(true);
    setShowForm(true);
  };

  const handleDeleteSubject = async (subject) => {
    if (
      !window.confirm(
        `Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a mÃ´n há»c ${subject.subject_id} - ${subject.name}?`,
      )
    ) {
      return;
    }

    try {
      await subjectsAPI.delete(subject.subject_id);
      await fetchSubjects();
      toast.success("XÃ³a mÃ´n há»c thÃ nh cÃ´ng!");
    } catch (err) {
      toast.error(getSubjectErrorMessage(err, "delete"));
    }
  };

  const totalPages = Math.max(1, Math.ceil(subjects.length / PAGE_SIZE));
  const paginatedSubjects = subjects.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div style={pageWrapper}>
      {/* BREADCRUMB */}
      <div style={breadcrumb}>
        <span style={breadcrumbHome}>Dashboard</span>
        <span style={breadcrumbSep}>â€º</span>
        <span style={breadcrumbCurrent}>Quáº£n lÃ½ mÃ´n há»c</span>
      </div>

      {/* PAGE HEADER */}
      <div style={pageHeader}>
        <div style={pageHeaderLeft}>
          <div>
            <h1 style={pageTitle}>QUáº¢N LÃ DANH Má»¤C MÃ”N Há»ŒC</h1>
          </div>
        </div>
        <button onClick={handleClickCreateSubject} style={addBtn}>
          <FiPlus size={16} />
          {showForm ? "ÄÃ³ng Form" : "ThÃªm mÃ´n há»c má»›i"}
        </button>
      </div>

      {/* STAT BANNER */}
      <div style={statBanner}>
        <div style={statBannerInner}>
          <div>
            <p style={statLabel}>Tá»•ng sá»‘ mÃ´n há»c</p>
            <p style={statNumber}>{subjects.length}</p>
          </div>
          <div style={bannerIconBg}>
            <MdMenuBook size={48} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>

      {/* FORM */}
      {/* MODAL FORM */}
      {showForm && (
        <div style={modalOverlay}>
          <div style={modalContainer}>
            <div style={formCard}>
              <h3 style={formTitle}>
                {repair ? "Cáº­p nháº­t mÃ´n há»c" : "ThÃªm mÃ´n há»c má»›i"}
              </h3>

              <form onSubmit={repair ? handleSubmitUpdate : handleSubmit}>
                <div style={formGrid}>
                  <div style={fieldGroup}>
                    <label style={fieldLabel}>MÃ£ MÃ´n Há»c</label>

                    <input
                      type="text"
                      name="subject_id"
                      placeholder="Nháº­p mÃ£ mÃ´n (VD: INT1306)"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      required
                      disabled={repair}
                      style={{
                        ...fieldInput,
                        ...(repair
                          ? {
                              background: "#f1f5f9",
                              cursor: "not-allowed",
                              color: "#94a3b8",
                            }
                          : {}),
                      }}
                    />
                  </div>

                  <div style={fieldGroup}>
                    <label style={fieldLabel}>TÃªn MÃ´n Há»c</label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Nháº­p tÃªn mÃ´n há»c"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={fieldInput}
                    />
                  </div>

                  <div style={fieldGroup}>
                    <label style={fieldLabel}>Sá»‘ TÃ­n Chá»‰</label>

                    <input
                      type="number"
                      name="credits"
                      placeholder="Nháº­p sá»‘ tÃ­n chá»‰"
                      value={formData.credits}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="10"
                      style={fieldInput}
                    />
                  </div>
                  <div style={fieldGroup}>
                    <label style={fieldLabel}>Chuyên ngành</label>
                    <select
                      name="major_id"
                      value={formData.major_id || ""}
                      onChange={handleInputChange}
                      required
                      style={fieldInput}
                    >
                      <option value="">-- Chọn chuyên ngành --</option>
                      {majors.map((major) => (
                        <option
                          key={major.major_id}
                          value={major.major_id}
                        >
                          {major.major_id} - {major.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label
                    style={{
                      ...fieldGroup,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 26,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="allow_same_major"
                      checked={!!formData.allow_same_major}
                      onChange={handleInputChange}
                    />
                    Cho phép cùng chuyên ngành đăng ký
                  </label>

                  <label
                    style={{
                      ...fieldGroup,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 26,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="allow_same_department"
                      checked={!!formData.allow_same_department}
                      onChange={handleInputChange}
                    />
                    Cho phép cùng khoa đăng ký
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      ...submitBtn,
                      background: repair ? "#4f46e5" : "#16a34a",
                      marginTop: 0,
                    }}
                  >
                    {repair ? "Cáº­p nháº­t MÃ´n Há»c" : "Táº¡o MÃ´n Há»c"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setRepair(false);
                    }}
                    style={cancelBtn}
                  >
                    Há»§y
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* TABLE */}
      <div style={tableCard}>
        <div style={tableHeader}>
          <h3 style={tableTitle}>Danh sÃ¡ch mÃ´n há»c hiá»‡n táº¡i</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>STT</th>
                <th style={th}>MÃƒ MÃ”N</th>
                <th style={th}>TÃŠN MÃ”N Há»ŒC</th>
                <th style={th}>Sá» TÃN CHá»ˆ</th>
                <th style={th}>CHUYÊN NGÀNH</th>
                <th style={th}>KHOA</th>
                <th style={th}>CÙNG NGÀNH</th>
                <th style={th}>CÙNG KHOA</th>
                <th style={th}>THAO TÃC</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubjects.map((subject, index) => (
                <tr key={subject.subject_id} style={tbodyRow}>
                  <td style={{ ...td, color: "#94a3b8" }}>
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(
                      2,
                      "0",
                    )}
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: "#4f46e5" }}>
                    {subject.subject_id}
                  </td>
                  <td style={td}>{subject.name}</td>
                  <td style={td}>
                    <span style={creditBadge}>{subject.credits}</span>
                  </td>
                  <td style={td}>
                    {subject.major
                      ? `${subject.major.major_id} - ${subject.major.name}`
                      : subject.major_id || "-"}
                  </td>
                  <td style={td}>
                    {subject.major?.department
                      ? `${subject.major.department.department_id} - ${subject.major.department.name}`
                      : "-"}
                  </td>
                  <td style={td}>{subject.allow_same_major ? "Có" : "Không"}</td>
                  <td style={td}>
                    {subject.allow_same_department ? "Có" : "Không"}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => handleOpenFormUpdateSubject(subject)}
                      style={editBtn}
                    >
                      <FiEdit2 size={13} /> Sá»­a
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject)}
                      style={deleteBtn}
                    >
                      <FiTrash2 size={13} /> XÃ³a
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subjects.length > 0 && (
          <div style={tableFooter}>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              Hiá»ƒn thá»‹ {(page - 1) * PAGE_SIZE + 1}â€“
              {Math.min(page * PAGE_SIZE, subjects.length)} trÃªn{" "}
              {subjects.length} mÃ´n há»c
            </span>
            <div style={pageControls}>
              <button
                style={{ ...pageBtn, ...(page === 1 ? pageBtnDisabled : {}) }}
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                TrÆ°á»›c
              </button>
              <span style={pageInfo}>
                {page} / {totalPages}
              </span>
              <button
                style={{
                  ...pageBtn,
                  ...(page === totalPages ? pageBtnDisabled : {}),
                }}
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Tiáº¿p
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// â”€â”€â”€ STYLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
const pageTitle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 800,
  color: "#1e293b",
  letterSpacing: "0.3px",
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
};
const statLabel = { margin: 0, fontSize: "13px", opacity: 0.85 };
const statNumber = {
  margin: "4px 0",
  fontSize: "42px",
  fontWeight: 700,
  lineHeight: 1.1,
};
const bannerIconBg = {
  position: "absolute",
  right: "28px",
  top: "50%",
  transform: "translateY(-50%)",
};

const formCard = {
  background: "white",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #e2e8f0",
};
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
const theadRow = { background: "#f8fafc" };
const th = {
  padding: "11px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.6px",
  borderBottom: "1px solid #e2e8f0",
};
const tbodyRow = { borderBottom: "1px solid #f1f5f9" };
const td = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#334155",
};
const creditBadge = {
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
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};
const pageControls = { display: "flex", alignItems: "center", gap: "8px" };
const pageInfo = { color: "#334155", fontWeight: 600, fontSize: "13px" };
const pageBtn = {
  padding: "6px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  background: "#fff",
  color: "#334155",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "13px",
};
const pageBtnDisabled = {
  opacity: 0.45,
  cursor: "not-allowed",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
  padding: "20px",
};

const modalContainer = {
  width: "100%",
  maxWidth: "700px",
  animation: "fadeIn 0.2s ease",
};

const cancelBtn = {
  padding: "10px 24px",
  background: "#e2e8f0",
  color: "#334155",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

export default MinistrySubjects;
