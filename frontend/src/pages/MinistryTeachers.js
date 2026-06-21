import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GiTeacher } from "react-icons/gi";
import { FiSearch } from "react-icons/fi";
import { departmentsAPI, teachersAPI, usersAPI } from "../services/api";
import "../styles/MinistryTeacher.css";

const ROWS_PER_PAGE = 5;

const EMPTY_FORM = {
  user_id: 0,
  teacher_id: "",
  name: "",
  degree: "",
  expertise: "",
  department_id: "",
};

const getTeacherErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot delete teacher that has courses")) {
    return "Không thể xóa giảng viên vì giảng viên đã được phân công khóa học.";
  }
  if (lowerMessage.includes("department not found")) {
    return "Khoa không tồn tại. Vui lòng chọn lại khoa.";
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
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.data || []);
    } catch (e) {
      toast.error("Tải dữ liệu giảng viên không thành công");
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await usersAPI.getAvailableTeachers();
      setAvailableUsers(response.data || []);
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
      toast.error("Không thể tải danh sách khoa");
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchAvailableUsers();
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "user_id" ? Number(value) : value,
    }));
  };

  const handleClickCreate = () => {
    setFormData(EMPTY_FORM);
    setRepair(false);
    setShowForm(true);
  };

  const handleOpenFormUpdateTeacher = (teacher) => {
    setFormData({
      user_id: teacher.user_id,
      teacher_id: teacher.teacher_id,
      name: teacher.name,
      degree: teacher.degree,
      expertise: teacher.expertise,
      department_id: teacher.department_id || "",
    });
    setRepair(true);
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setRepair(false);
  };

  const validateForm = () => {
    if (
      !formData.teacher_id ||
      formData.user_id === 0 ||
      !formData.name ||
      !formData.degree ||
      !formData.expertise ||
      !formData.department_id
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await teachersAPI.create(formData);
      toast.success("Tạo giảng viên thành công!");
      closeModal();
      await fetchTeachers();
      await fetchAvailableUsers();
    } catch (err) {
      toast.error(getTeacherErrorMessage(err));
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await teachersAPI.update(formData.teacher_id, formData);
      toast.success("Cập nhật giảng viên thành công!");
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

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredTeachers = normalizedKeyword
    ? teachers.filter((teacher) =>
        [
          teacher.teacher_id,
          teacher.name,
          teacher.degree,
          teacher.expertise,
          teacher.department_id,
          teacher.department?.name,
          teacher.user?.email,
          teacher.user_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword),
      )
    : teachers;

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / ROWS_PER_PAGE));
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  return (
    <div className="teacher-page">
      <div className="teacher-header-row">
        <h2 className="teacher-title">
          <GiTeacher className="teacher-title-icon" />
          QUẢN LÝ GIẢNG VIÊN
        </h2>
        <button className="teacher-add-btn" onClick={handleClickCreate}>
          + Thêm giảng viên mới
        </button>
      </div>

      <div className="teacher-stat-row">
        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">
            <GiTeacher size={28} color="#4f63d2" />
          </div>
          <div>
            <div className="teacher-stat-label">TỔNG</div>
            <div className="teacher-stat-value">
              {teachers.length.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal-content">
            <button className="teacher-close-btn" onClick={closeModal}>
              x
            </button>

            <h3 className="teacher-form-title">
              {repair ? "Cập nhật thông tin giảng viên" : "Tạo giảng viên mới"}
            </h3>

            <form
              className="teacher-form"
              onSubmit={repair ? handleSubmitUpdate : handleSubmit}
            >
              <div className="teacher-field-group">
                <label className="teacher-label">Mã Giáo Viên</label>
                <input
                  className={`teacher-input${repair ? " teacher-input--disabled" : ""}`}
                  disabled={repair}
                  name="teacher_id"
                  onChange={handleInputChange}
                  placeholder="Nhập mã giảng viên"
                  required
                  type="text"
                  value={formData.teacher_id}
                />
              </div>

              {!repair && (
                <div className="teacher-field-group">
                  <label className="teacher-label">
                    Chọn User (Role: Teacher - Chưa đăng ký)
                  </label>
                  <select
                    className="teacher-input"
                    name="user_id"
                    onChange={handleInputChange}
                    required
                    value={formData.user_id}
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

              <div className="teacher-field-group">
                <label className="teacher-label">Họ và Tên</label>
                <input
                  className="teacher-input"
                  name="name"
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên giảng viên"
                  required
                  type="text"
                  value={formData.name}
                />
              </div>

              <div className="teacher-field-group">
                <label className="teacher-label">Học vị</label>
                <input
                  className="teacher-input"
                  name="degree"
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Thạc sĩ, Tiến sĩ"
                  required
                  type="text"
                  value={formData.degree}
                />
              </div>

              <div className="teacher-field-group">
                <label className="teacher-label">Chuyên môn</label>
                <input
                  className="teacher-input"
                  name="expertise"
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Toán học, Tiếng Anh"
                  required
                  type="text"
                  value={formData.expertise}
                />
              </div>

              <div className="teacher-field-group">
                <label className="teacher-label">Khoa</label>
                <select
                  className="teacher-input"
                  name="department_id"
                  onChange={handleInputChange}
                  required
                  value={formData.department_id || ""}
                >
                  <option value="">-- Chọn khoa --</option>
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
                className={`teacher-submit-btn ${
                  repair
                    ? "teacher-submit-btn--update"
                    : "teacher-submit-btn--create"
                }`}
                type="submit"
              >
                {repair ? "Cập nhật giảng viên" : "Tạo giảng viên"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="teacher-table-wrapper">
        <div className="teacher-table-header">
          <div className="teacher-search-wrap">
            <FiSearch size={15} color="#94a3b8" />
            <input
              className="teacher-search-input"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tim ma, ten, email, khoa, chuyen mon..."
            />
          </div>
        </div>
        <table className="teacher-table">
          <thead>
            <tr className="teacher-thead-row">
              <th className="teacher-th">STT</th>
              <th className="teacher-th">MÃ GIẢNG VIÊN</th>
              <th className="teacher-th">HỌ TÊN</th>
              <th className="teacher-th">HỌC VỊ</th>
              <th className="teacher-th">CHUYÊN MÔN</th>
              <th className="teacher-th">KHOA</th>
              <th className="teacher-th">TÀI KHOẢN</th>
              <th className="teacher-th">USER ID</th>
              <th className="teacher-th">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTeachers.length === 0 ? (
              <tr>
                <td colSpan={9} className="teacher-empty-cell">
                  Không có dữ liệu giảng viên
                </td>
              </tr>
            ) : (
              paginatedTeachers.map((teacher, idx) => (
                <tr key={teacher.teacher_id} className="teacher-tbody-row">
                  <td className="teacher-td">
                    {String(
                      (currentPage - 1) * ROWS_PER_PAGE + idx + 1,
                    ).padStart(2, "0")}
                  </td>
                  <td className="teacher-td teacher-td--primary">
                    {teacher.teacher_id}
                  </td>
                  <td className="teacher-td teacher-td--name">
                    {teacher.name}
                  </td>
                  <td className="teacher-td">{teacher.degree}</td>
                  <td className="teacher-td">{teacher.expertise}</td>
                  <td className="teacher-td">
                    {teacher.department
                      ? `${teacher.department.department_id} - ${teacher.department.name}`
                      : teacher.department_id || "-"}
                  </td>
                  <td className="teacher-td">{teacher.user?.email || "-"}</td>
                  <td className="teacher-td">{teacher.user_id}</td>
                  <td className="teacher-td">
                    <button
                      className="teacher-edit-btn"
                      onClick={() => handleOpenFormUpdateTeacher(teacher)}
                    >
                      Sửa
                    </button>
                    <button
                      className="teacher-delete-btn"
                      onClick={() => handleDeleteTeacher(teacher.teacher_id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="teacher-pagination">
          <span className="teacher-page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="teacher-page-buttons">
            <button
              className="teacher-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <button
              className={`teacher-page-btn${
                currentPage === totalPages ? " teacher-page-btn--active" : ""
              }`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTeachers;
