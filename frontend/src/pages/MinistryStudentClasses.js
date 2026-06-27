import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PiStudentDuotone } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { majorsAPI, studentClassesAPI } from "../services/api";
import "../styles/MinistryStudentClasses.css";
const EMPTY_FORM = {
  class_id: "",
  name: "",
  cohort: "",
  major_id: "",
  capacity: ""
};
const getErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  const lower = message.toLowerCase();
  if (lower.includes("already exists")) return "Mã lớp đã tồn tại.";
  if (lower.includes("has students")) {
    return "Không thể xóa lớp đang có sinh viên.";
  }
  if (lower.includes("capacity")) {
    return "Sĩ số tối đa không hợp lệ hoặc nhỏ hơn số sinh viên hiện có.";
  }
  return action === "delete" ? "Không thể xóa lớp học." : "Không thể lưu lớp học. Vui lòng kiểm tra dữ liệu.";
};
const MinistryStudentClasses = () => {
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const fetchClasses = async () => {
    try {
      const res = await studentClassesAPI.getAll();
      setClasses(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách lớp học.");
    }
  };
  const fetchMajors = async () => {
    try {
      const res = await majorsAPI.getAll();
      setMajors(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách chuyên ngành.");
    }
  };
  useEffect(() => {
    fetchClasses();
    fetchMajors();
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
  const openEdit = item => {
    setFormData({
      class_id: item.class_id,
      name: item.name,
      cohort: item.cohort,
      major_id: item.major_id || "",
      capacity: item.capacity ?? ""
    });
    setEditingId(item.class_id);
    setShowForm(true);
  };
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(current => ({
      ...current,
      [name]: value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.class_id || !formData.name || !formData.cohort || !formData.major_id) {
      toast.error("Vui lòng nhập đầy đủ mã lớp, tên lớp, khóa và chuyên ngành.");
      return;
    }
    const payload = {
      ...formData,
      class_id: formData.class_id.trim(),
      capacity: formData.capacity === "" ? undefined : Number(formData.capacity)
    };
    try {
      if (editingId) {
        await studentClassesAPI.update(editingId, payload);
        toast.success("Cập nhật lớp học thành công.");
      } else {
        await studentClassesAPI.create(payload);
        toast.success("Tạo lớp học thành công.");
      }
      resetForm();
      fetchClasses();
    } catch (err) {
      toast.error(getErrorMessage(err), {
        id: "student-class-error"
      });
    }
  };
  const handleDelete = async classId => {
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${classId}?`)) return;
    try {
      await studentClassesAPI.delete(classId);
      toast.success("Xóa lớp học thành công.");
      fetchClasses();
    } catch (err) {
      toast.error(getErrorMessage(err, "delete"), {
        id: "student-class-error"
      });
    }
  };
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredClasses = normalizedKeyword ? classes.filter(item => [item.class_id, item.name, item.cohort, item.major_id, item.major?.name, item.major?.department_id, item.major?.department?.name].filter(Boolean).join(" ").toLowerCase().includes(normalizedKeyword)) : classes;
  return <div className="ministry-student-classes__wrapper">
      <div className="ministry-student-classes__header-row">
        <h2 className="ministry-student-classes__title">
          <PiStudentDuotone className="ministry-student-classes__inline-165" />
          QUẢN LÝ LỚP
        </h2>
        <button onClick={openCreate} className="ministry-student-classes__add-btn">
          + Thêm lớp
        </button>
      </div>

      {showForm && <div style={styles.modalOverlay}>
          <div className="ministry-student-classes__modal-content">
            <button onClick={resetForm} className="ministry-student-classes__close-btn">
              ×
            </button>
            <h3 className="ministry-student-classes__form-title">
              {editingId ? "Cập nhật lớp học" : "Tạo lớp học mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="ministry-student-classes__field-group">
                <label className="ministry-student-classes__label">Chuyên ngành</label>
                <select name="major_id" value={formData.major_id} onChange={handleChange} required className="ministry-student-classes__input">
                
                  <option value="">-- Chọn chuyên ngành --</option>
                  {majors.map(major => <option key={major.major_id} value={major.major_id}>
                      {major.major_id} - {major.name}
                    </option>)}
                </select>
              </div>

              <div className="ministry-student-classes__field-group">
                <label className="ministry-student-classes__label">Mã lớp</label>
                <input name="class_id" value={formData.class_id} onChange={handleChange} disabled={!!editingId} style={{
              background: editingId ? "#f0f0f0" : "white"
            }} required className="ministry-student-classes__input" />
              
              </div>

              <div className="ministry-student-classes__field-group">
                <label className="ministry-student-classes__label">Tên lớp</label>
                <input name="name" value={formData.name} onChange={handleChange} required className="ministry-student-classes__input" />
              
              </div>

              <div className="ministry-student-classes__field-group">
                <label className="ministry-student-classes__label">Khóa</label>
                <input name="cohort" value={formData.cohort} onChange={handleChange} placeholder="Ví dụ: K23" required className="ministry-student-classes__input" />
              
              </div>

              <div className="ministry-student-classes__field-group">
                <label className="ministry-student-classes__label">Sĩ số tối đa</label>
                <input type="number" name="capacity" min="1" value={formData.capacity} onChange={handleChange} placeholder="Bỏ trống nếu không giới hạn" className="ministry-student-classes__input" />
              
              </div>

              <button type="submit" className="ministry-student-classes__submit-btn">
                {editingId ? "Cập nhật" : "Tạo lớp"}
              </button>
            </form>
          </div>
        </div>}

      <div className="ministry-student-classes__table-wrapper">
        <div className="ministry-student-classes__table-header">
          <div className="ministry-student-classes__search-wrap">
            <FiSearch size={15} color="#94a3b8" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tim ma lop, ten lop, khoa, chuyen nganh..." className="ministry-student-classes__search-input" />

            
          </div>
        </div>
        <table className="ministry-student-classes__table">
          <thead>
            <tr>
              <th className="ministry-student-classes__th">MÃ LỚP</th>
              <th className="ministry-student-classes__th">TÊN LỚP</th>
              <th className="ministry-student-classes__th">KHÓA</th>
              <th className="ministry-student-classes__th">CHUYÊN NGÀNH</th>
              <th className="ministry-student-classes__th">KHOA</th>
              <th className="ministry-student-classes__th">SĨ SỐ</th>
              <th className="ministry-student-classes__th">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length === 0 ? <tr>
                <td colSpan={7} className="ministry-student-classes__empty-cell">
                  Chưa có lớp học nào
                </td>
              </tr> : filteredClasses.map(item => {
            const studentCount = item._count?.students || 0;
            return <tr key={item.class_id} className="ministry-student-classes__tbody-row">
                    <td className="ministry-student-classes__td ministry-student-classes__inline-296">





                    
                      {item.class_id}
                    </td>
                    <td className="ministry-student-classes__td">{item.name}</td>
                    <td className="ministry-student-classes__td">{item.cohort}</td>
                    <td className="ministry-student-classes__td">
                      {item.major ? `${item.major.major_id} - ${item.major.name}` : item.major_id || "-"}
                    </td>
                    <td className="ministry-student-classes__td">
                      {item.major?.department ? `${item.major.department.department_id} - ${item.major.department.name}` : "-"}
                    </td>
                    <td className="ministry-student-classes__td">
                      {studentCount}/{item.capacity ?? "∞"}
                    </td>
                    <td className="ministry-student-classes__td">
                      <button onClick={() => openEdit(item)} className="ministry-student-classes__edit-btn">
                      
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(item.class_id)} className="ministry-student-classes__delete-btn">
                      
                        Xóa
                      </button>
                    </td>
                  </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
};
const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  }
};
export default MinistryStudentClasses;
