import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { AuthContext } from "../contexts/AuthContext";
import { paginate } from "../utils/pagination";
import {
  useMobileMenu,
  MobileMenuButton,
  MobileMenuOverlay,
} from "../utils/responsiveHelpers";
import "../styles/SysAdminDashboard.css";
const USERS_PER_PAGE = 10;
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
  return `$2b$******${password.slice(-4)}`;
};
const getUserErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("current password is required")) {
    return "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu quản trị viên.";
  }
  if (lowerMessage.includes("current password is incorrect")) {
    return "Mật khẩu hiện tại không chính xác.";
  }
  if (lowerMessage.includes("cannot change email or role of sysadmin")) {
    return "Không thể thay đổi email hoặc vai trò của quản trị viên.";
  }
  if (lowerMessage.includes("cannot delete user that is linked")) {
    return "Không thể xóa người dùng vì tài khoản đang liên kết với hồ sơ sinh viên hoặc giảng viên.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate")) {
    return "Email đã tồn tại. Vui lòng kiểm tra lại.";
  }
  if (action === "delete") return "Không thể xóa người dùng.";
  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
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
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
      className="sys-admin-dashboard__inline-69"
    >
      {cfg.label}
    </span>
  );
};
export default function SysAdminUsers() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [repair, setRepair] = useState(false);
  const [idUpdate, setIdUpdate] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingSysAdmin, setEditingSysAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const resetForm = () => {
    setFormData({
      email: "",
      currentPassword: "",
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
    } catch (err) {
      toast.error(getUserErrorMessage(err));
    }
  };
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Không được để trống email");
      return;
    }
    try {
      const dataUpdate = editingSysAdmin
        ? {
            phone: formData.phone,
            address: formData.address,
          }
        : {
            email: formData.email,
            role: formData.role,
            phone: formData.phone,
            address: formData.address,
          };

      if (formData.password) {
        if (editingSysAdmin && !formData.currentPassword) {
          toast.error("Vui lòng nhập mật khẩu hiện tại");
          return;
        }
        dataUpdate.password = formData.password;
        if (editingSysAdmin) {
          dataUpdate.currentPassword = formData.currentPassword;
        }
      }
      await usersAPI.update(idUpdate, dataUpdate);
      resetForm();
      await fetchUsers();
      toast.success("Cập nhật thành công");
    } catch (err) {
      toast.error(getUserErrorMessage(err));
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
    } catch (err) {
      toast.error(getUserErrorMessage(err, "delete"));
    }
  };
  const handleOpenFormUpdateUser = (id) => {
    const u = users.find((u) => u.id === id);
    if (u)
      setFormData({
        email: u.email,
        currentPassword: "",
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
  const handleLogout = async () => {
    await logout();
    toast.success("Đăng xuất thành công");
    navigate("/login", { replace: true });
  };
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
    return matchRole && matchSearch;
  });
  const {
    page: safePage,
    totalPages,
    startIndex: firstUserIndex,
    items: paginatedUsers,
  } = paginate(filtered, currentPage, USERS_PER_PAGE);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const styles = {
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
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    fieldInputDisabled: {
      background: "#f8fafc",
      color: "#64748b",
      cursor: "not-allowed",
    },
  };
  return (
    <div className="sys-admin-dashboard__root">
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
      {/* Sidebar */}
      <aside
        className={`sidebar ${isMobileMenuOpen ? "active" : ""} sys-admin-dashboard__sidebar`}
      >
        <div className="sys-admin-dashboard__sidebar-brand">
          <p className="sys-admin-dashboard__brand-title">Admin Panel</p>
          <p className="sys-admin-dashboard__brand-sub">Quản lý người dùng</p>
        </div>
        <nav className="sys-admin-dashboard__sidebar-nav">
          <div style={styles.navItem(true)}>
            <FaUsers size={16} /> Người dùng
          </div>
        </nav>
        <div className="sys-admin-dashboard__sidebar-footer">
          <div className="sys-admin-dashboard__footer-avatar">
            <FaUserShield size={16} />
          </div>
          <div>
            <div className="sys-admin-dashboard__footer-name">Admin</div>
            <div className="sys-admin-dashboard__footer-role">System Root</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="sys-admin-dashboard__main">
        <MobileMenuButton
          onClick={toggleMobileMenu}
          isOpen={isMobileMenuOpen}
        />
        {/* Topbar */}
        <header className="sys-admin-dashboard__topbar">
          <h1 className="sys-admin-dashboard__page-title">
            QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG
          </h1>
          <div className="sys-admin-dashboard__topbar-right">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="sys-admin-dashboard__add-btn"
            >
              <FaUserPlus size={14} /> + Thêm người dùng mới
            </button>

            <button
              onClick={handleLogout}
              className="sys-admin-dashboard__logout-btn"
            >
              <FaSignOutAlt size={14} /> Đăng xuất
            </button>
          </div>
        </header>

        <div className="sys-admin-dashboard__content">
          {/* Banner */}
          <div className="sys-admin-dashboard__banner">
            <div className="sys-admin-dashboard__banner-left">
              <h2 className="sys-admin-dashboard__banner-title">
                Tổng quan hệ thống
              </h2>
              <p className="sys-admin-dashboard__banner-desc">
                Quản lý và giám sát tất cả các tài khoản người dùng, phân quyền
                truy cập và bảo mật dữ liệu hệ thống tập trung.
              </p>
            </div>
            <div className="sys-admin-dashboard__stat-card">
              <div>
                <p className="sys-admin-dashboard__stat-num">
                  {users.length.toLocaleString("vi-VN")}
                </p>
                <p className="sys-admin-dashboard__stat-label">
                  Tổng số người dùng
                </p>
              </div>
              <FaUserPlus
                size={40}
                className="sys-admin-dashboard__inline-581"
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="sys-admin-dashboard__toolbar-row">
            <div className="sys-admin-dashboard__search-wrap">
              <FaSearch color="#94a3b8" size={14} />
              <input
                placeholder="Tìm kiếm theo email, số điện thoại..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="sys-admin-dashboard__search-input"
              />
            </div>
            <span className="sys-admin-dashboard__inline-596">Vai trò:</span>
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
                onClick={() => {
                  setRoleFilter(v);
                  setCurrentPage(1);
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="sys-admin-dashboard__table-wrap">
            <table className="sys-admin-dashboard__table">
              <thead>
                <tr className="sys-admin-dashboard__inline-620">
                  <th className="sys-admin-dashboard__th">ID</th>
                  <th className="sys-admin-dashboard__th">Email</th>
                  <th className="sys-admin-dashboard__th">Mật khẩu</th>
                  <th className="sys-admin-dashboard__th">Vai trò</th>
                  <th className="sys-admin-dashboard__th">Số điện thoại</th>
                  <th className="sys-admin-dashboard__th">Địa chỉ</th>
                  <th className="sys-admin-dashboard__th">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, i) => (
                  <tr
                    key={user.id}
                    style={{
                      background: i % 2 === 0 ? "#fff" : "#fafbfc",
                    }}
                  >
                    <td className="sys-admin-dashboard__td">{user.id}</td>
                    <td className="sys-admin-dashboard__td sys-admin-dashboard__inline-637">
                      {user.email}
                    </td>
                    <td className="sys-admin-dashboard__td sys-admin-dashboard__inline-640">
                      {maskPassword(user.password)}
                    </td>
                    <td className="sys-admin-dashboard__td">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="sys-admin-dashboard__td">
                      {user.phone || "—"}
                    </td>
                    <td className="sys-admin-dashboard__td">
                      {user.address || "—"}
                    </td>
                    <td className="sys-admin-dashboard__td">
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
                      className="sys-admin-dashboard__td sys-admin-dashboard__inline-676"
                    >
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="sys-admin-dashboard__pagination">
              <span>
                Hiển thị {filtered.length === 0 ? 0 : firstUserIndex + 1} –{" "}
                {Math.min(firstUserIndex + USERS_PER_PAGE, filtered.length)}{" "}
                trên {filtered.length} người dùng
              </span>
              <div className="sys-admin-dashboard__pagination-controls">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="sys-admin-dashboard__page-btn"
                >
                  Trước
                </button>
                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`sys-admin-dashboard__page-btn${page === safePage ? " sys-admin-dashboard__page-btn--active" : ""}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="sys-admin-dashboard__page-btn"
                >
                  Sau
                </button>
              </div>
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
          <div className="sys-admin-dashboard__modal">
            <h3 className="sys-admin-dashboard__modal-title">
              {repair ? "✏️ Cập nhật người dùng" : "➕ Tạo người dùng mới"}
            </h3>
            <form onSubmit={repair ? handleSubmitUpdate : handleSubmit}>
              <div className="sys-admin-dashboard__field-wrap">
                <label className="sys-admin-dashboard__field-label">
                  Email
                </label>
                <input
                  style={{
                    ...(editingSysAdmin ? styles.fieldInputDisabled : {}),
                  }}
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={editingSysAdmin}
                  required
                  className="sys-admin-dashboard__field-input"
                />
              </div>
              {editingSysAdmin && (
                <div className="sys-admin-dashboard__field-wrap">
                  <label className="sys-admin-dashboard__field-label">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Nhập khi muốn đổi mật khẩu"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required={Boolean(formData.password)}
                    className="sys-admin-dashboard__field-input"
                  />
                </div>
              )}
              <div className="sys-admin-dashboard__field-wrap">
                <label className="sys-admin-dashboard__field-label">
                  {editingSysAdmin ? "Mật khẩu mới" : "Mật khẩu"}{" "}
                  {repair && (
                    <span className="sys-admin-dashboard__inline-731">
                      (để trống nếu không đổi)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder={editingSysAdmin ? "Mật khẩu mới" : "Mật khẩu"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!repair}
                  className="sys-admin-dashboard__field-input"
                />
              </div>
              <div className="sys-admin-dashboard__field-wrap">
                <label className="sys-admin-dashboard__field-label">
                  Vai trò
                </label>
                <select
                  style={{
                    ...(editingSysAdmin ? styles.fieldInputDisabled : {}),
                  }}
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={editingSysAdmin}
                  className="sys-admin-dashboard__field-input"
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
              <div className="sys-admin-dashboard__field-wrap">
                <label className="sys-admin-dashboard__field-label">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0123456789"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="sys-admin-dashboard__field-input"
                />
              </div>
              <div className="sys-admin-dashboard__field-wrap">
                <label className="sys-admin-dashboard__field-label">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Địa chỉ"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="sys-admin-dashboard__field-input"
                />
              </div>
              <div className="sys-admin-dashboard__modal-actions">
                <button
                  type="submit"
                  className="sys-admin-dashboard__submit-btn"
                >
                  {repair ? "Cập nhật" : "Tạo người dùng"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="sys-admin-dashboard__cancel-btn"
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
