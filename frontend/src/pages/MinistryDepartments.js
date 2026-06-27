import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdSubject } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { departmentsAPI } from "../services/api";
import "../styles/MinistryDepartments.css";

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

  if (lower.includes("already exists")) return "Mã khoa đã tồn tại.";
  if (lower.includes("in use")) return "Không thể xóa khoa đang được sử dụng.";
  return action === "delete"
    ? "Không thể xóa khoa."
    : "Không thể lưu khoa. Vui lòng kiểm tra dữ liệu.";
};

const MinistryDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách khoa.");
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
      toast.error("Vui lòng nhập mã khoa và tên khoa.");
      return;
    }

    try {
      if (editingId) {
        await departmentsAPI.update(editingId, formData);
        toast.success("Cập nhật khoa thành công.");
      } else {
        await departmentsAPI.create(formData);
        toast.success("Tạo khoa thành công.");
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      toast.error(getDepartmentErrorMessage(err), { id: "department-error" });
    }
  };

  const handleDelete = async (departmentId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khoa ${departmentId}?`)) return;

    try {
      await departmentsAPI.delete(departmentId);
      toast.success("Xóa khoa thành công.");
      fetchDepartments();
    } catch (err) {
      toast.error(getDepartmentErrorMessage(err, "delete"), {
        id: "department-error",
      });
    }
  };

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredDepartments = normalizedKeyword
    ? departments.filter((item) =>
      [
        item.department_id,
        item.name,
        item.description,
        item.studentClassesCount,
        item._count?.studentClasses,
        item._count?.teachers,
        item._count?.majors,
      ]
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword),
    )
    : departments;

  return (
    <div className="ministry-departments">
      <div className="ministry-departments__header-row">
        <h2 className="ministry-departments__title">
          <MdSubject className="ministry-departments__title-icon" />
          QUẢN LÝ KHOA
        </h2>
        <button className="ministry-departments__add-btn" onClick={openCreate}>
          + Thêm khoa
        </button>
      </div>

      {showForm && (
        <div className="ministry-departments__modal-overlay">
          <div className="ministry-departments__modal-content">
            <button
              className="ministry-departments__close-btn"
              onClick={resetForm}
            >
              x
            </button>
            <h3 className="ministry-departments__form-title">
              {editingId ? "Cập nhật khoa" : "Tạo khoa mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="ministry-departments__field-group">
                <label className="ministry-departments__label">Mã khoa</label>
                <input
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  disabled={!!editingId}
                  className={`ministry-departments__input ${editingId ? "ministry-departments__input--disabled" : ""
                    }`}
                  required
                />
              </div>
              <div className="ministry-departments__field-group">
                <label className="ministry-departments__label">Tên khoa</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="ministry-departments__input"
                  required
                />
              </div>
              <div className="ministry-departments__field-group">
                <label className="ministry-departments__label">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="ministry-departments__input ministry-departments__textarea"
                />
              </div>
              <button
                className="ministry-departments__submit-btn"
                type="submit"
              >
                {editingId ? "Cập nhật" : "Tạo khoa"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="ministry-departments__table-wrapper">
        <div className="ministry-departments__table-header">
          <div className="ministry-departments__search-wrap">
            <FiSearch className="ministry-departments__search-icon" size={15} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm mã khoa, tên khoa, mô tả..."
              className="ministry-departments__search-input"
            />
          </div>
        </div>
        <table className="ministry-departments__table">
          <thead>
            <tr>
              <th>MÃ KHOA</th>
              <th>TÊN KHOA</th>
              <th>MÔ TẢ</th>
              <th>LỚP</th>
              <th>GIÁO VIÊN</th>
              <th>CHUYÊN NGÀNH</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan={7} className="ministry-departments__empty-cell">
                  Chua co khoa nao
                </td>
              </tr>
            ) : (
              filteredDepartments.map((item) => (
                <tr key={item.department_id}>
                  <td className="ministry-departments__department-id">
                    {item.department_id}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.description || "-"}</td>
                  <td>
                    {item.studentClassesCount ?? item._count?.studentClasses ?? 0}
                  </td>
                  <td>{item._count?.teachers || 0}</td>
                  <td>{item._count?.majors || 0}</td>
                  <td>
                    <button
                      className="ministry-departments__edit-btn"
                      onClick={() => openEdit(item)}
                    >
                      Sửa
                    </button>
                    <button
                      className="ministry-departments__delete-btn"
                      onClick={() => handleDelete(item.department_id)}
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

export default MinistryDepartments;
