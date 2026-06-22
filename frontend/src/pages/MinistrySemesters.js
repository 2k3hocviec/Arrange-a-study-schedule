import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoCalendar } from "react-icons/io5";
import { semestersAPI } from "../services/api";
import "../styles/MinistrySemesters.css";
const EMPTY_FORM = {
  name: "",
  school_year: "",
  start_date: "",
  end_date: "",
  is_active: false,
  is_register: false,
};
const formatDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};
const getSemesterErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lowerMessage = message.toLowerCase();
  if (
    lowerMessage.includes("unique") ||
    lowerMessage.includes("duplicate") ||
    lowerMessage.includes("p2002") ||
    lowerMessage.includes("name_school_year") ||
    lowerMessage.includes("semester_name_school_year_key")
  ) {
    return "Kỳ học này đã tồn tại trong năm học đã chọn. Vui lòng kiểm tra lại tên kỳ học và năm học.";
  }
  if (
    lowerMessage.includes("start_date must be before end_date") ||
    lowerMessage.includes("start date") ||
    lowerMessage.includes("before end date")
  ) {
    return "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.";
  }
  if (
    lowerMessage.includes("start_date and end_date are required") ||
    lowerMessage.includes("required")
  ) {
    return "Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.";
  }
  if (
    lowerMessage.includes("cannot update semester date range") ||
    lowerMessage.includes("outside the new semester date range")
  ) {
    return "Không thể thay đổi thời gian kỳ học vì đã có lịch học nằm ngoài khoảng ngày mới.";
  }
  if (
    lowerMessage.includes("semester not found") ||
    lowerMessage.includes("not found")
  ) {
    return "Không tìm thấy kỳ học này. Vui lòng tải lại danh sách và thử lại.";
  }
  if (
    lowerMessage.includes("cannot delete semester that has courses") ||
    lowerMessage.includes("has courses")
  ) {
    return "Không thể xóa kỳ học vì đã có khóa học thuộc kỳ này.";
  }
  if (action === "create") {
    return "Không thể thêm kỳ học. Vui lòng kiểm tra lại thông tin.";
  }
  if (action === "update") {
    return "Không thể cập nhật kỳ học. Vui lòng kiểm tra lại thông tin.";
  }
  if (action === "delete") {
    return "Không thể xóa kỳ học.";
  }
  if (action === "activate") {
    return "Không thể đặt kỳ học hiện hành.";
  }
  if (action === "register") {
    return "Không thể thay đổi trạng thái đăng ký. Chỉ kỳ học hiện hành mới được mở đăng ký.";
  }
  return "Thao tác thất bại. Vui lòng thử lại.";
};
const MinistrySemesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fetchSemesters = async () => {
    try {
      const res = await semestersAPI.getAll();
      setSemesters(res.data);
    } catch {
      toast.error("Không thể tải danh sách kỳ học");
    }
  };
  useEffect(() => {
    fetchSemesters();
  }, []);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "is_active" && !checked) {
        next.is_register = false;
      }
      return next;
    });
  };
  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };
  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };
  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };
  const handleEdit = (semester) => {
    setEditingId(semester.semester_id);
    setFormData({
      name: semester.name || "",
      school_year: semester.school_year || "",
      start_date: formatDateInput(semester.start_date),
      end_date: formatDateInput(semester.end_date),
      is_active: Boolean(semester.is_active),
      is_register: Boolean(semester.is_register),
    });
    setShowForm(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await semestersAPI.update(editingId, formData);
        toast.success("Cập nhật kỳ học thành công");
      } else {
        await semestersAPI.create(formData);
        toast.success("Thêm kỳ học thành công");
      }
      closeForm();
      fetchSemesters();
    } catch (err) {
      toast.error(
        getSemesterErrorMessage(err, editingId ? "update" : "create"),
      );
    }
  };
  const handleActivate = async (id) => {
    try {
      await semestersAPI.activate(id);
      toast.success("Đã đặt kỳ học hiện hành");
      fetchSemesters();
    } catch (err) {
      toast.error(getSemesterErrorMessage(err, "activate"));
    }
  };
  const handleSetRegisterStatus = async (semester) => {
    try {
      await semestersAPI.setRegisterStatus(
        semester.semester_id,
        !semester.is_register,
      );
      toast.success(semester.is_register ? "Đã đóng đăng ký" : "Đã mở đăng ký");
      fetchSemesters();
    } catch (err) {
      toast.error(getSemesterErrorMessage(err, "register"));
    }
  };
  const handleDelete = async (semester) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa kỳ học ${semester.name} ${semester.school_year}?`,
      )
    ) {
      return;
    }
    try {
      await semestersAPI.delete(semester.semester_id);
      toast.success("Đã xóa kỳ học");
      fetchSemesters();
    } catch (err) {
      toast.error(getSemesterErrorMessage(err, "delete"));
    }
  };
  return (
    <div className="ministry-semesters__page">
      <div className="ministry-semesters__header">
        <div>
          <div className="ministry-semesters__breadcrumb">
            Dashboard / Kỳ học
          </div>
          <h1 className="ministry-semesters__title">Quản lý kỳ học</h1>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="ministry-semesters__add-btn"
        >
          <FiPlus size={16} />
          Thêm kỳ học mới
        </button>
      </div>

      {showForm && (
        <div className="ministry-semesters__modal-overlay">
          <div className="ministry-semesters__modal-card">
            <div className="ministry-semesters__modal-header">
              <div className="ministry-semesters__form-title">
                <IoCalendar size={18} color="#4f46e5" />
                {editingId ? "Cập nhật kỳ học" : "Thêm kỳ học mới"}
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="ministry-semesters__close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ministry-semesters__form-grid">
                <label className="ministry-semesters__field">
                  Tên kỳ học
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="HK1, HK2, HK Hè"
                    required
                    className="ministry-semesters__input"
                  />
                </label>
                <label className="ministry-semesters__field">
                  Năm học
                  <input
                    name="school_year"
                    value={formData.school_year}
                    onChange={handleChange}
                    placeholder="2025-2026"
                    required
                    className="ministry-semesters__input"
                  />
                </label>
                <label className="ministry-semesters__field">
                  Ngày bắt đầu
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="ministry-semesters__input"
                  />
                </label>
                <label className="ministry-semesters__field">
                  Ngày kết thúc
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="ministry-semesters__input"
                  />
                </label>
                <label className="ministry-semesters__checkbox-field">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Đặt làm kỳ hiện hành
                </label>
                <label className="ministry-semesters__checkbox-field">
                  <input
                    type="checkbox"
                    name="is_register"
                    checked={formData.is_register}
                    onChange={handleChange}
                    disabled={!formData.is_active}
                  />
                  Mở đăng ký
                </label>
              </div>
              <div className="ministry-semesters__modal-footer">
                <button
                  type="button"
                  onClick={closeForm}
                  className="ministry-semesters__cancel-btn"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    background: editingId ? "#4f46e5" : "#16a34a",
                  }}
                  className="ministry-semesters__submit-btn"
                >
                  <FiPlus size={15} />
                  {editingId ? "Lưu thay đổi" : "Thêm kỳ học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="ministry-semesters__table-card">
        <div className="ministry-semesters__table-header">Danh sách kỳ học</div>
        <div className="ministry-semesters__inline-292">
          <table className="ministry-semesters__table">
            <thead>
              <tr>
                <th className="ministry-semesters__th">Tên kỳ</th>
                <th className="ministry-semesters__th">Năm học</th>
                <th className="ministry-semesters__th">Bắt đầu</th>
                <th className="ministry-semesters__th">Kết thúc</th>
                <th className="ministry-semesters__th">Trạng thái</th>
                <th className="ministry-semesters__th">Đăng ký</th>
                <th className="ministry-semesters__th">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((semester) => (
                <tr
                  key={semester.semester_id}
                  className="ministry-semesters__tr"
                >
                  <td className="ministry-semesters__td">{semester.name}</td>
                  <td className="ministry-semesters__td">
                    {semester.school_year}
                  </td>
                  <td className="ministry-semesters__td">
                    {new Date(semester.start_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="ministry-semesters__td">
                    {new Date(semester.end_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="ministry-semesters__td">
                    <span
                      className={
                        semester.is_active
                          ? "ministry-semesters__active-badge"
                          : "ministry-semesters__badge"
                      }
                    >
                      {semester.is_active ? "Hiện hành" : "Chưa kích hoạt"}
                    </span>
                  </td>
                  <td className="ministry-semesters__td">
                    <span
                      className={
                        semester.is_register
                          ? "ministry-semesters__active-badge"
                          : "ministry-semesters__badge"
                      }
                    >
                      {semester.is_register ? "Đang mở" : "Đã đóng"}
                    </span>
                  </td>
                  <td className="ministry-semesters__td">
                    {!semester.is_active && (
                      <button
                        type="button"
                        onClick={() => handleActivate(semester.semester_id)}
                        className="ministry-semesters__activate-btn"
                      >
                        Đặt hiện hành
                      </button>
                    )}
                    {semester.is_active && (
                      <button
                        type="button"
                        onClick={() => handleSetRegisterStatus(semester)}
                        className={
                          semester.is_register
                            ? "ministry-semesters__register-close-btn"
                            : "ministry-semesters__register-open-btn"
                        }
                      >
                        {semester.is_register ? "Đóng đăng ký" : "Mở đăng ký"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(semester)}
                      className="ministry-semesters__edit-btn"
                    >
                      <FiEdit2 size={13} /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(semester)}
                      className="ministry-semesters__delete-btn"
                    >
                      <FiTrash2 size={13} /> Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {semesters.length === 0 && (
                <tr>
                  <td colSpan={7} className="ministry-semesters__empty">
                    Chưa có kỳ học nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default MinistrySemesters;
