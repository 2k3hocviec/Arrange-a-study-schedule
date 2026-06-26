import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdSubject } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { departmentsAPI, majorsAPI } from "../services/api";
import "../styles/MinistryMajors.css";

const EMPTY_FORM = {
  major_id: "",
  name: "",
  department_id: "",
  description: "",
};

const getMajorErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lower = message.toLowerCase();

  if (lower.includes("already exists")) {
    return "Mã chuyên ngành đã tồn tại.";
  }
  if (lower.includes("cannot change department of major that has student classes")) {
    return "Không thể chuyển khoa vì chuyên ngành này đã có lớp học.";
  }
  if (lower.includes("department not found")) return "Khoa không tồn tại.";
  if (lower.includes("in use")) {
    return "Không thể xóa chuyên ngành đang có sinh viên hoặc môn học.";
  }

  return action === "delete"
    ? "Không thể xóa chuyên ngành."
    : "Không thể lưu chuyên ngành. Vui lòng kiểm tra dữ liệu.";
};

const MinistryMajors = () => {
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchMajors = async () => {
    try {
      const res = await majorsAPI.getAll();
      setMajors(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách chuyên ngành.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách khoa.");
    }
  };

  useEffect(() => {
    fetchMajors();
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

  const openEdit = (major) => {
    setFormData({
      major_id: major.major_id,
      name: major.name,
      department_id: major.department_id,
      description: major.description || "",
    });
    setEditingId(major.major_id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.major_id || !formData.name || !formData.department_id) {
      toast.error("Vui lòng nhập mã, tên chuyên ngành và khoa.");
      return;
    }

    try {
      if (editingId) {
        await majorsAPI.update(editingId, formData);
        toast.success("Cập nhật chuyên ngành thành công.");
      } else {
        await majorsAPI.create(formData);
        toast.success("Tạo chuyên ngành thành công.");
      }
      resetForm();
      fetchMajors();
    } catch (err) {
      toast.error(getMajorErrorMessage(err), { id: "major-error" });
    }
  };

  const handleDelete = async (majorId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chuyên ngành ${majorId}?`)) {
      return;
    }

    try {
      await majorsAPI.delete(majorId);
      toast.success("Xóa chuyên ngành thành công.");
      fetchMajors();
    } catch (err) {
      toast.error(getMajorErrorMessage(err, "delete"), { id: "major-error" });
    }
  };

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredMajors = normalizedKeyword
    ? majors.filter((major) =>
        [
          major.major_id,
          major.name,
          major.description,
          major.department_id,
          major.department?.name,
          major.studentsCount,
          major._count?.students,
          major._count?.subjects,
        ]
          .filter((value) => value !== undefined && value !== null)
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword),
      )
    : majors;

  return (
    <div className="ministry-majors">
      <div className="ministry-majors__header-row">
        <h2 className="ministry-majors__title">
          <MdSubject className="ministry-majors__title-icon" />
          QUẢN LÝ CHUYÊN NGÀNH
        </h2>
        <button className="ministry-majors__add-btn" onClick={openCreate}>
          + Thêm chuyên ngành
        </button>
      </div>

      {showForm && (
        <div className="ministry-majors__modal-overlay">
          <div className="ministry-majors__modal-content">
            <button className="ministry-majors__close-btn" onClick={resetForm}>
              x
            </button>
            <h3 className="ministry-majors__form-title">
              {editingId ? "Cập nhật chuyên ngành" : "Tạo chuyên ngành mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="ministry-majors__field-group">
                <label className="ministry-majors__label">
                  Mã chuyên ngành
                </label>
                <input
                  name="major_id"
                  value={formData.major_id}
                  onChange={handleChange}
                  disabled={!!editingId}
                  className={`ministry-majors__input ${
                    editingId ? "ministry-majors__input--disabled" : ""
                  }`}
                  required
                />
              </div>
              <div className="ministry-majors__field-group">
                <label className="ministry-majors__label">
                  Tên chuyên ngành
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="ministry-majors__input"
                  required
                />
              </div>
              <div className="ministry-majors__field-group">
                <label className="ministry-majors__label">Khoa</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="ministry-majors__input"
                  required
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
              <div className="ministry-majors__field-group">
                <label className="ministry-majors__label">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="ministry-majors__input ministry-majors__textarea"
                />
              </div>
              <button className="ministry-majors__submit-btn" type="submit">
                {editingId ? "Cập nhật" : "Tạo chuyên ngành"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="ministry-majors__table-wrapper">
        <div className="ministry-majors__table-header">
          <div className="ministry-majors__search-wrap">
            <FiSearch className="ministry-majors__search-icon" size={15} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm mã, tên chuyên ngành, khoa..."
              className="ministry-majors__search-input"
            />
          </div>
        </div>
        <table className="ministry-majors__table">
          <thead>
            <tr>
              <th>MÃ</th>
              <th>TÊN CHUYÊN NGÀNH</th>
              <th>KHOA</th>
              <th>SINH VIÊN</th>
              <th>MÔN HỌC</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredMajors.length === 0 ? (
              <tr>
                <td colSpan={6} className="ministry-majors__empty-cell">
                  Chưa có chuyên ngành nào
                </td>
              </tr>
            ) : (
              filteredMajors.map((major) => (
                <tr key={major.major_id}>
                  <td className="ministry-majors__major-id">
                    {major.major_id}
                  </td>
                  <td>{major.name}</td>
                  <td>
                    {major.department
                      ? `${major.department.department_id} - ${major.department.name}`
                      : major.department_id}
                  </td>
                  <td>{major.studentsCount ?? major._count?.students ?? 0}</td>
                  <td>{major._count?.subjects || 0}</td>
                  <td>
                    <button
                      className="ministry-majors__edit-btn"
                      onClick={() => openEdit(major)}
                    >
                      Sửa
                    </button>
                    <button
                      className="ministry-majors__delete-btn"
                      onClick={() => handleDelete(major.major_id)}
                    >
                      Xóa
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

export default MinistryMajors;
