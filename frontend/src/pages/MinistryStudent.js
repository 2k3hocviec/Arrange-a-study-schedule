import React, { useEffect, useState } from "react";
import { studentClassesAPI, studentsAPI, usersAPI } from "../services/api";
import toast from "react-hot-toast";
import { PiStudentDuotone } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import "../styles/MinistryStudent.css";
const ROWS_PER_PAGE = 5;
const getStudentErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  const lowerMessage = message.toLowerCase();
  const target = err?.response?.data?.meta?.target || err?.meta?.target || [];
  const targetText = Array.isArray(target) ? target.join(" ").toLowerCase() : String(target).toLowerCase();
  if (lowerMessage.includes("cannot delete student that has enrollments")) {
    return "Không thể xóa sinh viên vì sinh viên đã có đăng ký học phần.";
  }
  if (lowerMessage.includes("cannot change student class when student has enrollments")) {
    return "Không thể đổi lớp học vì sinh viên này đã có môn học đăng ký.";
  }
  if (lowerMessage.includes("student already exists") || targetText.includes("student_id")) {
    return "Mã sinh viên đã tồn tại. Vui lòng nhập mã sinh viên khác.";
  }
  if (targetText.includes("user_id")) {
    return "Tài khoản này đã được gắn với một sinh viên khác. Vui lòng chọn tài khoản khác.";
  }
  if (lowerMessage.includes("student class not found")) {
    return "Lớp học đã chọn không tồn tại. Vui lòng chọn lại lớp học.";
  }
  if (lowerMessage.includes("student class is full")) {
    return "Lớp học đã đủ số lượng sinh viên. Vui lòng chọn lớp khác.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate")) {
    return "Mã sinh viên hoặc tài khoản sinh viên đã tồn tại. Vui lòng kiểm tra lại.";
  }
  if (action === "delete") return "Không thể xóa sinh viên.";
  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
};
const MinistryStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState({
    user_id: "",
    student_id: "",
    name: "",
    class_id: "",
    has_enrollments: false
  });
  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (e) {
      toast.error("Tải dữ liệu sinh viên thất bại");
    }
  };
  const refreshStudentsKeepOrder = async () => {
    const response = await studentsAPI.getAll();
    const refreshedStudents = Array.isArray(response.data) ? response.data : [];
    const refreshedById = new Map(
      refreshedStudents.map(student => [student.student_id, student])
    );
    const currentIds = new Set(students.map(student => student.student_id));
    const updatedStudents = students.map(
      student => refreshedById.get(student.student_id) || student
    );
    const newStudents = refreshedStudents.filter(
      student => !currentIds.has(student.student_id)
    );

    setStudents([...updatedStudents, ...newStudents]);
  };
  const fetchAvailableUsers = async () => {
    try {
      const response = await usersAPI.getAvailableStudents();
      setAvailableUsers(response.data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách user khả dụng");
    }
  };
  const fetchStudentClasses = async () => {
    try {
      const response = await studentClassesAPI.getAll();
      setStudentClasses(response.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách lớp học");
    }
  };
  useEffect(() => {
    fetchStudents();
    fetchAvailableUsers();
    fetchStudentClasses();
  }, []);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: name === "user_id" ? Number(value) || "" : value
    });
  };
  const handleClickCreate = () => {
    setFormData({
      user_id: "",
      student_id: "",
      name: "",
      class_id: "",
      has_enrollments: false
    });
    setRepair(false);
    setShowForm(true);
  };
  const handleOpenUpdate = student => {
    setFormData({
      user_id: student.user_id,
      student_id: student.student_id,
      name: student.name,
      class_id: student.class_id || "",
      has_enrollments: (student._count?.enrollments || 0) > 0
    });
    setRepair(true);
    setShowForm(true);
  };
  const closeModal = () => {
    setShowForm(false);
    setRepair(false);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.user_id || !formData.student_id || !formData.name || !formData.class_id) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await studentsAPI.create(formData);
      toast.success("Tạo sinh viên thành công!");
      closeModal();
      fetchStudents();
      fetchAvailableUsers();
    } catch (err) {
      toast.error(getStudentErrorMessage(err));
    }
  };
  const handleSubmitUpdate = async e => {
    e.preventDefault();
    if (!formData.student_id || !formData.name || !formData.class_id) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await studentsAPI.update(formData.student_id, formData);
      toast.success("Cập nhật sinh viên thành công!");
      closeModal();
      await refreshStudentsKeepOrder();
    } catch (err) {
      toast.error(getStudentErrorMessage(err));
    }
  };
  const handleDeleteStudent = async id => {
    if (!window.confirm("Bạn có chắc muốn xóa sinh viên này?")) return;
    try {
      await studentsAPI.delete(id);
      toast.success("Xóa sinh viên thành công!");
      fetchStudents();
      fetchAvailableUsers();
    } catch (error) {
      toast.error(getStudentErrorMessage(error, "delete"));
    }
  };
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredStudents = normalizedKeyword ? students.filter(student => [student.student_id, student.name, student.user?.email, student.class_id, student.class?.name, student.class?.major_id, student.class?.major?.name, student.class?.major?.department_id, student.class?.major?.department?.name, student.user_id].filter(Boolean).join(" ").toLowerCase().includes(normalizedKeyword)) : students;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ROWS_PER_PAGE));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);
  return <div className="ministry-student__wrapper">
    {/* Header row */}
    <div className="ministry-student__header-row">
      <h2 className="ministry-student__title">
        <PiStudentDuotone className="ministry-student__inline-184" />


        QUẢN LÝ SINH VIÊN
      </h2>
      <button onClick={handleClickCreate} className="ministry-student__add-btn">
        + Thêm sinh viên mới
      </button>
    </div>

    {/* Stat card */}
    <div className="ministry-student__stat-row">
      <div className="ministry-student__stat-card">
        <div className="ministry-student__stat-icon">
          <PiStudentDuotone size={28} color="#4f63d2" />
        </div>
        <div>
          <div className="ministry-student__stat-label">TỔNG</div>
          <div className="ministry-student__stat-value">
            {students.length.toLocaleString()}
          </div>
        </div>
      </div>
    </div>

    {/* ==================== MODAL ==================== */}
    {showForm && <div className="ministry-student__modal-overlay">
      <div className="ministry-student__modal-content">
        <button onClick={closeModal} className="ministry-student__close-btn">
          ×
        </button>

        <h3 className="ministry-student__form-title">
          {repair ? "Cập nhật thông tin sinh viên" : "Tạo sinh viên mới"}
        </h3>

        <form onSubmit={repair ? handleSubmitUpdate : handleSubmit} className="ministry-student__form">


          {!repair && <div className="ministry-student__field-group">
            <label className="ministry-student__label">
              Chọn User (Role: Student - Chưa đăng ký)
            </label>
            <select name="user_id" value={formData.user_id} onChange={handleInputChange} required className="ministry-student__input">

              <option value="">-- Chọn User --</option>
              {availableUsers.map(user => <option key={user.id} value={user.id}>
                {user.username || user.email} (ID: {user.id})
              </option>)}
            </select>
          </div>}

          <div className="ministry-student__field-group">
            <label className="ministry-student__label">Mã Sinh Viên</label>
            <input type="text" name="student_id" placeholder="Nhập mã sinh viên" value={formData.student_id} onChange={handleInputChange} required disabled={repair} style={{
              background: repair ? "#f0f0f0" : "white"
            }} className="ministry-student__input" />

          </div>

          <div className="ministry-student__field-group">
            <label className="ministry-student__label">Họ và Tên</label>
            <input type="text" name="name" placeholder="Nhập họ tên sinh viên" value={formData.name} onChange={handleInputChange} required className="ministry-student__input" />


          </div>

          <div className="ministry-student__field-group">
            <label className="ministry-student__label">Lớp học {repair && formData.has_enrollments && "(Không thể đổi)"}</label>
            <select name="class_id" value={formData.class_id} onChange={handleInputChange} required className="ministry-student__input" disabled={repair && formData.has_enrollments} style={{
              background: repair && formData.has_enrollments ? "#f0f0f0" : "white"
            }}>


              <option value="">-- Chọn lớp học --</option>
              {studentClasses.map(item => <option key={item.class_id} value={item.class_id}>
                {item.class_id} - {item.name}
              </option>)}
            </select>
          </div>

          <button type="submit" style={{
            background: "#3498db"
          }} className="ministry-student__submit-btn">

            {repair ? "Cập nhật sinh viên" : "Tạo sinh viên"}
          </button>
        </form>
      </div>
    </div>}

    {/* Table */}
    <div className="ministry-student__table-wrapper">
      <div className="ministry-student__table-header">
        <div className="ministry-student__search-wrap">
          <FiSearch size={15} color="#94a3b8" />
          <input value={keyword} onChange={e => {
            setKeyword(e.target.value);
            setCurrentPage(1);
          }} placeholder="Tim ma, ten, email, lop, chuyen nganh..." className="ministry-student__search-input" />


        </div>
      </div>
      <table className="ministry-student__table">
        <thead>
          <tr className="ministry-student__thead-row">
            <th className="ministry-student__th">STT</th>
            <th className="ministry-student__th">MÃ SINH VIÊN</th>
            <th className="ministry-student__th">HỌ TÊN</th>
            <th className="ministry-student__th">TÀI KHOẢN</th>
            <th className="ministry-student__th">LỚP HỌC</th>
            <th className="ministry-student__th">CHUYÊN NGÀNH</th>
            <th className="ministry-student__th">KHOA</th>
            <th className="ministry-student__th">USER ID</th>
            <th className="ministry-student__th">THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStudents.length === 0 ? <tr>
            <td colSpan={9} className="ministry-student__empty-cell">
              Không có dữ liệu sinh viên
            </td>
          </tr> : paginatedStudents.map((student, idx) => <tr key={student.student_id} className="ministry-student__tbody-row">
            <td className="ministry-student__td">
              {String((currentPage - 1) * ROWS_PER_PAGE + idx + 1).padStart(2, "0")}
            </td>
            <td className="ministry-student__td ministry-student__inline-354">


              {student.student_id}
            </td>
            <td className="ministry-student__td">{student.name}</td>
            <td className="ministry-student__td">{student.user?.email || "-"}</td>
            <td className="ministry-student__td">
              {student.class ? `${student.class.class_id} - ${student.class.name}` : student.class_id || "-"}
            </td>
            <td className="ministry-student__td">
              {student.class?.major ? `${student.class.major.major_id} - ${student.class.major.name}` : student.class?.major_id || "-"}
            </td>
            <td className="ministry-student__td">
              {student.class?.major?.department ? `${student.class.major.department.department_id} - ${student.class.major.department.name}` : "-"}
            </td>
            <td className="ministry-student__td">{student.user_id}</td>
            <td className="ministry-student__td">
              <button onClick={() => handleOpenUpdate(student)} className="ministry-student__edit-btn">

                Sửa
              </button>
              <button onClick={() => handleDeleteStudent(student.student_id)} className="ministry-student__delete-btn">

                Xóa
              </button>
            </td>
          </tr>)}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="ministry-student__pagination">
        <span className="ministry-student__page-info">
          Trang {currentPage} / {totalPages}
        </span>
        <div className="ministry-student__page-buttons">
          <button style={{
            opacity: currentPage === 1 ? 0.4 : 1,
            cursor: currentPage === 1 ? "not-allowed" : "pointer"
          }} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="ministry-student__page-btn">

            Trước
          </button>
          <button style={{
            background: currentPage === totalPages ? "#4f63d2" : "#e9ecf5",
            color: currentPage === totalPages ? "white" : "#333"
          }} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ministry-student__page-btn">

            Tiếp theo
          </button>
        </div>
      </div>
    </div>
  </div>;
};
export default MinistryStudents;
