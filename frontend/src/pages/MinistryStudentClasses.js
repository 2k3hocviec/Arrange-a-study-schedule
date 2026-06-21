import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PiStudentDuotone } from "react-icons/pi";
import { departmentsAPI, studentClassesAPI } from "../services/api";

const EMPTY_FORM = {
  class_id: "",
  name: "",
  cohort: "",
  major: "",
  department_id: "",
  capacity: "",
};

const getErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lower = message.toLowerCase();

  if (lower.includes("already exists")) {
    return "MÃ£ lá»›p Ä‘Ã£ tá»“n táº¡i.";
  }
  if (lower.includes("has students")) {
    return "KhÃ´ng thá»ƒ xÃ³a lá»›p Ä‘ang cÃ³ sinh viÃªn.";
  }
  if (lower.includes("capacity")) {
    return "SÄ© sá»‘ tá»‘i Ä‘a khÃ´ng há»£p lá»‡ hoáº·c nhá» hÆ¡n sá»‘ sinh viÃªn hiá»‡n cÃ³.";
  }

  return action === "delete"
    ? "KhÃ´ng thá»ƒ xÃ³a lá»›p há»c."
    : "KhÃ´ng thá»ƒ lÆ°u lá»›p há»c. Vui lÃ²ng kiá»ƒm tra dá»¯ liá»‡u.";
};

const MinistryStudentClasses = () => {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await studentClassesAPI.getAll();
      setClasses(res.data || []);
    } catch {
      toast.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch lá»›p há»c.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data || []);
    } catch {
      toast.error("Khong the tai danh sach khoa.");
    }
  };

  useEffect(() => {
    fetchClasses();
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

  const openEdit = (item) => {
    setFormData({
      class_id: item.class_id,
      name: item.name,
      cohort: item.cohort,
      major: item.major,
      department_id: item.department_id || "",
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
      !formData.major ||
      !formData.department_id
    ) {
      toast.error("Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ mÃ£ lá»›p, tÃªn lá»›p, khÃ³a vÃ  ngÃ nh.");
      return;
    }

    const payload = {
      ...formData,
      capacity: formData.capacity === "" ? undefined : Number(formData.capacity),
    };

    try {
      if (editingId) {
        await studentClassesAPI.update(editingId, payload);
        toast.success("Cáº­p nháº­t lá»›p há»c thÃ nh cÃ´ng.");
      } else {
        await studentClassesAPI.create(payload);
        toast.success("Táº¡o lá»›p há»c thÃ nh cÃ´ng.");
      }
      resetForm();
      fetchClasses();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "student-class-error" });
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a lá»›p ${classId}?`)) return;

    try {
      await studentClassesAPI.delete(classId);
      toast.success("XÃ³a lá»›p há»c thÃ nh cÃ´ng.");
      fetchClasses();
    } catch (err) {
      toast.error(getErrorMessage(err, "delete"), { id: "student-class-error" });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <PiStudentDuotone style={{ marginRight: 10 }} />
          QUáº¢N LÃ Lá»šP Há»ŒC
        </h2>
        <button style={styles.addBtn} onClick={openCreate}>
          + ThÃªm lá»›p há»c
        </button>
      </div>

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={resetForm}>
              Ã—
            </button>
            <h3 style={styles.formTitle}>
              {editingId ? "Cáº­p nháº­t lá»›p há»c" : "Táº¡o lá»›p há»c má»›i"}
            </h3>
            <form onSubmit={handleSubmit}>              <div style={styles.fieldGroup}>
                <label style={styles.label}>Khoa</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  style={styles.input}
                  required
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
              <div style={styles.fieldGroup}>
                <label style={styles.label}>MÃ£ lá»›p</label>
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
                <label style={styles.label}>TÃªn lá»›p</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>KhÃ³a</label>
                <input
                  name="cohort"
                  value={formData.cohort}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="VÃ­ dá»¥: K23"
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>NgÃ nh</label>
                <input
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>SÄ© sá»‘ tá»‘i Ä‘a</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Bá» trá»‘ng náº¿u khÃ´ng giá»›i háº¡n"
                />
              </div>
              <button style={styles.submitBtn} type="submit">
                {editingId ? "Cáº­p nháº­t" : "Táº¡o lá»›p"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>MÃƒ Lá»šP</th>
              <th style={styles.th}>TÃŠN Lá»šP</th>
              <th style={styles.th}>KHÃ“A</th>
              <th style={styles.th}>NGÃ€NH</th>
              <th style={styles.th}>KHOA</th>
              <th style={styles.th}>SÄ¨ Sá»</th>
              <th style={styles.th}>THAO TÃC</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.emptyCell}>
                  ChÆ°a cÃ³ lá»›p há»c nÃ o
                </td>
              </tr>
            ) : (
              classes.map((item) => {
                const studentCount = item._count?.students || 0;
                return (
                  <tr key={item.class_id} style={styles.tbodyRow}>
                    <td style={{ ...styles.td, color: "#4f63d2", fontWeight: 700 }}>
                      {item.class_id}
                    </td>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.td}>{item.cohort}</td>
                    <td style={styles.td}>{item.major}</td>
                    <td style={styles.td}>
                      {item.department
                        ? `${item.department.department_id} - ${item.department.name}`
                        : item.department_id || "-"}
                    </td>
                    <td style={styles.td}>
                      {studentCount}/{item.capacity ?? "âˆž"}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => openEdit(item)}>
                        Sá»­a
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item.class_id)}
                      >
                        XÃ³a
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

