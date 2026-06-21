import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdSubject } from "react-icons/md";
import { departmentsAPI } from "../services/api";

const EMPTY_FORM = {
  department_id: "",
  name: "",
  description: "",
};

const getDepartmentErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lower = message.toLowerCase();

  if (lower.includes("already exists")) return "Ma khoa da ton tai.";
  if (lower.includes("in use")) return "Khong the xoa khoa dang duoc su dung.";
  return action === "delete"
    ? "Khong the xoa khoa."
    : "Khong the luu khoa. Vui long kiem tra du lieu.";
};

const MinistryDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data || []);
    } catch {
      toast.error("Khong the tai danh sach khoa.");
    }
  };

  useEffect(() => {
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

  const openEdit = (department) => {
    setFormData({
      department_id: department.department_id,
      name: department.name,
      description: department.description || "",
    });
    setEditingId(department.department_id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_id || !formData.name) {
      toast.error("Vui long nhap ma khoa va ten khoa.");
      return;
    }

    try {
      if (editingId) {
        await departmentsAPI.update(editingId, formData);
        toast.success("Cap nhat khoa thanh cong.");
      } else {
        await departmentsAPI.create(formData);
        toast.success("Tao khoa thanh cong.");
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      toast.error(getDepartmentErrorMessage(err), { id: "department-error" });
    }
  };

  const handleDelete = async (departmentId) => {
    if (!window.confirm(`Ban co chac muon xoa khoa ${departmentId}?`)) return;

    try {
      await departmentsAPI.delete(departmentId);
      toast.success("Xoa khoa thanh cong.");
      fetchDepartments();
    } catch (err) {
      toast.error(getDepartmentErrorMessage(err, "delete"), {
        id: "department-error",
      });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <MdSubject style={{ marginRight: 10 }} />
          QUAN LY KHOA
        </h2>
        <button style={styles.addBtn} onClick={openCreate}>
          + Them khoa
        </button>
      </div>

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={resetForm}>
              x
            </button>
            <h3 style={styles.formTitle}>
              {editingId ? "Cap nhat khoa" : "Tao khoa moi"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Ma khoa</label>
                <input
                  name="department_id"
                  value={formData.department_id}
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
                <label style={styles.label}>Ten khoa</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mo ta</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ ...styles.input, minHeight: 80 }}
                />
              </div>
              <button style={styles.submitBtn} type="submit">
                {editingId ? "Cap nhat" : "Tao khoa"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>MA KHOA</th>
              <th style={styles.th}>TEN KHOA</th>
              <th style={styles.th}>MO TA</th>
              <th style={styles.th}>LOP</th>
              <th style={styles.th}>GIAO VIEN</th>
              <th style={styles.th}>MON</th>
              <th style={styles.th}>THAO TAC</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.emptyCell}>
                  Chua co khoa nao
                </td>
              </tr>
            ) : (
              departments.map((item) => (
                <tr key={item.department_id} style={styles.tbodyRow}>
                  <td style={{ ...styles.td, color: "#4f63d2", fontWeight: 700 }}>
                    {item.department_id}
                  </td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.description || "-"}</td>
                  <td style={styles.td}>{item._count?.studentClasses || 0}</td>
                  <td style={styles.td}>{item._count?.teachers || 0}</td>
                  <td style={styles.td}>{item._count?.subjects || 0}</td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => openEdit(item)}>
                      Sua
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(item.department_id)}
                    >
                      Xoa
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

export default MinistryDepartments;
