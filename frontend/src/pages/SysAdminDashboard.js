import React, { useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaUserPlus,
  FaPencilAlt,
  FaTrash,
  FaUserShield,
  FaSearch,
  FaSignOutAlt, // Thêm icon đăng xuất
} from "react-icons/fa";

const ROLE_CONFIG = {
  sysadmin: {
    label: "QUẢN TRỊ VIÊN",
    bg: "#f3f0ff",
    color: "#6d28d9",
    border: "#c4b5fd",
  },
  ministry: {
    label: "GIÁO VỤ",
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fcd34d",
  },
  teacher: {
    label: "GIÁO VIÊN",
    bg: "#d1fae5",
    color: "#065f46",
    border: "#6ee7b7",
  },
  student: {
    label: "SINH VIÊN",
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#93c5fd",
  },
};

const maskPassword = (password) => {
  if (!password) return "****";
  return "$2b$" + "******" + password.slice(-4);
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || {
    label: role?.toUpperCase(),
    bg: "#f3f4f6",
    color: "#374151",
    border: "#d1d5db",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
};

export default function SysAdminUsers() {
  const [users, setUsers] = useState([]);
  const [repair, setRepair] = useState(false);
  const [idUpdate, setIdUpdate] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingSysAdmin, setEditingSysAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    phone: "",
    address: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll(`?_t=${Date.now()}`);
      setUsers(response.data);
    } catch {
      toast.error("Tải dữ liệu không thành công");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      role: "student",
      phone: "",
      address: "",
    });
    setShowForm(false);
    setRepair(false);
    setEditingSysAdmin(false);
    setIdUpdate(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Dữ liệu trống");
      return;
    }
    try {
      await usersAPI.create(formData);
      resetForm();
      await fetchUsers();
      toast.success("Tạo người dùng thành công");
    } catch {
      toast.error("Tạo người dùng thất bại");
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Không được để trống email");
      return;
    }
    try {
      const dataUpdate = {
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
      };
      if (!editingSysAdmin && formData.password) {
        dataUpdate.password = formData.password;
      }
      await usersAPI.update(idUpdate, dataUpdate);
      resetForm();
      await fetchUsers();
      toast.success("Cập nhật thành công");
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === "sysadmin") {
      toast.error("Không thể xóa quản trị viên");
      return;
    }
    if (!window.confirm("Xác nhận xóa người dùng này?")) return;
    try {
      await usersAPI.delete(user.id);
      await fetchUsers();
      toast.success("Xóa thành công");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const handleOpenFormUpdateUser = (id) => {
    const u = users.find((u) => u.id === id);
    if (u)
      setFormData({
        email: u.email,
        password: "",
        role: u.role,
        phone: u.phone || "",
        address: u.address || "",
      });
    setEditingSysAdmin(u?.role === "sysadmin");
    setRepair(true);
    setShowForm(true);
    setIdUpdate(id);
  };

  const handleLogout = () => {
    toast.success("Đăng xuất thành công");
    window.location.href = "/login";
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
    return matchRole && matchSearch;
  });

  const styles = {
    root: {
      display: "flex",
      height: "100vh",
      minHeight: "100vh",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
      background: "#f0f2f7",
      color: "#1e293b",
      overflow: "hidden",
    },
    sidebar: {
      width: 240,
      height: "100vh",
      background: "#fff",
      borderRight: "1px solid #e8eaef",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
    },
    sidebarBrand: { padding: "0 20px 24px", borderBottom: "1px solid #f1f3f7" },
    brandTitle: { fontSize: 17, fontWeight: 800, color: "#3730a3", margin: 0 },
    brandSub: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
    sidebarNav: { padding: "16px 10px" },
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 10,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      color: active ? "#4f46e5" : "#64748b",
      background: active ? "#eef2ff" : "transparent",
      marginBottom: 4,
      transition: "all 0.15s",
    }),
    sidebarFooter: {
      padding: "10px 14px",
      marginTop: 8,
      borderTop: "1px solid #f1f3f7",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    footerAvatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "#3730a3",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 16,
    },
    footerName: { fontSize: 13, fontWeight: 700, color: "#1e293b" },
    footerRole: {
      fontSize: 11,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      minHeight: 0,
    },
    topbar: {
      background: "#fff",
      borderBottom: "1px solid #e8eaef",
      padding: "16px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pageTitle: { fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 },
    topbarRight: { display: "flex", alignItems: "center", gap: 16 },
    addBtn: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 18px",
      background: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
    },
    logoutBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 14px",
      background: "#fee2e2",
      color: "#ef4444",
      border: "none",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
    },
    content: {
      padding: "28px 32px",
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
    },
    banner: {
      background: "#fff",
      borderRadius: 16,
      padding: "24px 32px",
      marginBottom: 24,
      display: "flex",
      alignItems: "center",
      gap: 24,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
    bannerLeft: { flex: 1 },
    bannerTitle: {
      fontSize: 22,
      fontWeight: 800,
      color: "#4f46e5",
      margin: "0 0 6px",
    },
    bannerDesc: { fontSize: 14, color: "#64748b", margin: 0 },
    statCard: {
      background: "linear-gradient(135deg,#4f46e5 0%,#6366f1 100%)",
      borderRadius: 16,
      padding: "20px 28px",
      color: "#fff",
      minWidth: 200,
      display: "flex",
      alignItems: "center",
      gap: 16,
    },
    statNum: { fontSize: 36, fontWeight: 800, margin: 0 },
    statLabel: { fontSize: 13, opacity: 0.85, margin: "2px 0 0" },
    toolbarRow: {
      background: "#fff",
      borderRadius: 12,
      padding: "14px 20px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      flexWrap: "wrap",
    },
    searchWrap: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#f8fafc",
      borderRadius: 8,
      padding: "8px 14px",
      border: "1px solid #e2e8f0",
      flex: "0 0 280px",
    },
    searchInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: 14,
      color: "#1e293b",
      width: "100%",
    },
    filterBtn: (active) => ({
      padding: "7px 16px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      border: active ? "2px solid #4f46e5" : "2px solid transparent",
      background: active ? "#eef2ff" : "#f8fafc",
      color: active ? "#4f46e5" : "#64748b",
      transition: "all 0.15s",
    }),
    tableWrap: {
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      padding: "14px 16px",
      fontSize: 12,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      textAlign: "left",
      borderBottom: "1px solid #f1f5f9",
    },
    td: {
      padding: "16px 16px",
      fontSize: 14,
      color: "#1e293b",
      borderBottom: "1px solid #f8fafc",
      verticalAlign: "middle",
    },
    actionBtn: (color) => ({
      background: "none",
      border: "none",
      cursor: "pointer",
      color,
      fontSize: 16,
      padding: "6px",
      borderRadius: 6,
      transition: "background 0.15s",
    }),
    pagination: {
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: "1px solid #f1f5f9",
      fontSize: 13,
      color: "#64748b",
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      background: "#fff",
      borderRadius: 20,
      width: 480,
      padding: 32,
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 800,
      color: "#1e293b",
      margin: "0 0 24px",
    },
    fieldWrap: { marginBottom: 16 },
    fieldLabel: {
      display: "block",
      fontSize: 12,
      fontWeight: 600,
      color: "#64748b",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    fieldInput: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 8,
      border: "1.5px solid #e2e8f0",
      fontSize: 14,
      color: "#1e293b",
      outline: "none",
      boxSizing: "border-box",
      transition: "border 0.15s",
    },
    fieldInputDisabled: {
      background: "#f8fafc",
      color: "#64748b",
      cursor: "not-allowed",
    },
    modalActions: { display: "flex", gap: 10, marginTop: 24 },
    submitBtn: {
      flex: 1,
      padding: "11px",
      background: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 15,
      cursor: "pointer",
    },
    cancelBtn: {
      padding: "11px 20px",
      background: "#f1f5f9",
      color: "#64748b",
      border: "none",
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <p style={styles.brandTitle}>Admin Panel</p>
          <p style={styles.brandSub}>Quản lý người dùng</p>
        </div>
        <nav style={styles.sidebarNav}>
          <div style={styles.navItem(true)}>
            <FaUsers size={16} /> Người dùng
          </div>
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.footerAvatar}>
            <FaUserShield size={16} />
          </div>
          <div>
            <div style={styles.footerName}>Admin</div>
            <div style={styles.footerRole}>System Root</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <h1 style={styles.pageTitle}>QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG</h1>
          <div style={styles.topbarRight}>
            <button
              style={styles.addBtn}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <FaUserPlus size={14} /> + Thêm người dùng mới
            </button>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              <FaSignOutAlt size={14} /> Đăng xuất
            </button>
          </div>
        </header>

        <div style={styles.content}>
          {/* Banner */}
          <div style={styles.banner}>
            <div style={styles.bannerLeft}>
              <h2 style={styles.bannerTitle}>Tổng quan hệ thống</h2>
              <p style={styles.bannerDesc}>
                Quản lý và giám sát tất cả các tài khoản người dùng, phân quyền
                truy cập và bảo mật dữ liệu hệ thống tập trung.
              </p>
            </div>
            <div style={styles.statCard}>
              <div>
                <p style={styles.statNum}>
                  {users.length.toLocaleString("vi-VN")}
                </p>
                <p style={styles.statLabel}>Tổng số người dùng</p>
              </div>
              <FaUserPlus size={40} style={{ opacity: 0.3 }} />
            </div>
          </div>

          {/* Toolbar */}
          <div style={styles.toolbarRow}>
            <div style={styles.searchWrap}>
              <FaSearch color="#94a3b8" size={14} />
              <input
                style={styles.searchInput}
                placeholder="Tìm kiếm theo email, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
              Vai trò:
            </span>
            {[
              ["all", "Tất cả"],
              ["sysadmin", "Quản trị viên"],
              ["ministry", "Giáo vụ"],
              ["teacher", "Giáo viên"],
              ["student", "Sinh viên"],
            ].map(([v, l]) => (
              <button
                key={v}
                style={styles.filterBtn(roleFilter === v)}
                onClick={() => setRoleFilter(v)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Mật khẩu</th>
                  <th style={styles.th}>Vai trò</th>
                  <th style={styles.th}>Số điện thoại</th>
                  <th style={styles.th}>Địa chỉ</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                  >
                    <td style={styles.td}>{user.id}</td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>
                      {user.email}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontFamily: "monospace",
                        color: "#64748b",
                      }}
                    >
                      {maskPassword(user.password)}
                    </td>
                    <td style={styles.td}>
                      <RoleBadge role={user.role} />
                    </td>
                    <td style={styles.td}>{user.phone || "—"}</td>
                    <td style={styles.td}>{user.address || "—"}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.actionBtn("#4f46e5")}
                        title="Sửa"
                        onClick={() => handleOpenFormUpdateUser(user.id)}
                      >
                        <FaPencilAlt />
                      </button>
                      {user.role !== "sysadmin" && (
                        <button
                          style={styles.actionBtn("#ef4444")}
                          title="Xóa"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "40px",
                      }}
                    >
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={styles.pagination}>
              <span>
                Hiển thị 1 – {filtered.length} trên {filtered.length} người dùng
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {showForm && (
        <div
          style={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && resetForm()}
        >
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {repair ? "✏️ Cập nhật người dùng" : "➕ Tạo người dùng mới"}
            </h3>
            <form onSubmit={repair ? handleSubmitUpdate : handleSubmit}>
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>Email</label>
                <input
                  style={{
                    ...styles.fieldInput,
                    ...(editingSysAdmin ? styles.fieldInputDisabled : {}),
                  }}
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={editingSysAdmin}
                  required
                />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>
                  Mật khẩu{" "}
                  {repair && (
                    <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                      (để trống nếu không đổi)
                    </span>
                  )}
                </label>
                <input
                  style={{
                    ...styles.fieldInput,
                    ...(editingSysAdmin ? styles.fieldInputDisabled : {}),
                  }}
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={editingSysAdmin}
                  required={!repair}
                />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>Vai trò</label>
                <select
                  style={{
                    ...styles.fieldInput,
                    ...(editingSysAdmin ? styles.fieldInputDisabled : {}),
                  }}
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={editingSysAdmin}
                >
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="ministry">Giáo vụ</option>
                  {editingSysAdmin && (
                    <option value="sysadmin">Quản trị viên</option>
                  )}
                  {/* Đã đồng bộ thành sysadmin */}
                </select>
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>Số điện thoại</label>
                <input
                  style={styles.fieldInput}
                  type="tel"
                  name="phone"
                  placeholder="0123456789"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>Địa chỉ</label>
                <input
                  style={styles.fieldInput}
                  type="text"
                  name="address"
                  placeholder="Địa chỉ"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitBtn}>
                  {repair ? "Cập nhật" : "Tạo người dùng"}
                </button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={resetForm}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
