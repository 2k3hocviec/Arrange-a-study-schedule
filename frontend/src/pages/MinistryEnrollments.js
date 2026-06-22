import React, { useEffect, useState } from "react";
import { enrollmentsAPI, studentsAPI, coursesAPI, semestersAPI } from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiSearch } from "react-icons/fi";
import "../styles/MinistryEnrollments.css";
const PAGE_SIZE = 10;
const MinistryEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState({
    student_id: "",
    course_id: ""
  });
  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getAll();
      setEnrollments(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách đăng ký");
    }
  };
  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách sinh viên");
    }
  };
  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách khóa học");
    }
  };
  const fetchSemesters = async () => {
    try {
      const response = await semestersAPI.getAll();
      setSemesters(response.data);
      setSelectedSemesterId(current => current || response.data.find(s => s.is_active)?.semester_id || "");
    } catch (e) {
      toast.error("Không thể tải danh sách kỳ học");
    }
  };
  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
    fetchSemesters();
  }, []);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleClickCreate = () => {
    setFormData({
      student_id: "",
      course_id: ""
    });
    setShowForm(!showForm);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.student_id || !formData.course_id) {
      toast.error("Vui lòng chọn đầy đủ Sinh viên và Khóa học");
      return;
    }
    try {
      await enrollmentsAPI.create(formData);
      toast.success("Đăng ký thành công!");
      setShowForm(false);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại!");
    }
  };
  const handleDelete = async enroll => {
    if (!window.confirm(`Xóa đăng ký của SV ${enroll.student_id} - Khóa ${enroll.course?.course_code || enroll.course_id}?`)) return;
    try {
      await enrollmentsAPI.delete({
        student_id: enroll.student_id,
        course_id: enroll.course_id
      });
      toast.success("Xóa đăng ký thành công!");
      fetchEnrollments();
    } catch (err) {
      toast.error("Không thể xóa đăng ký này");
    }
  };
  const courseById = new Map(courses.map(course => [course.course_id, course]));
  const semesterEnrollments = selectedSemesterId ? enrollments.filter(enroll => {
    const course = courseById.get(enroll.course_id);
    return course?.semester_id === selectedSemesterId;
  }) : enrollments;
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredEnrollments = normalizedKeyword ? semesterEnrollments.filter(enroll => [enroll.enrollment_id, enroll.student_id, enroll.student?.name, enroll.course_id, enroll.course?.course_code, enroll.course?.subject_id, enroll.course?.subject?.name, enroll.course?.teacher_id, enroll.course?.teacher?.name, enroll.createdAt ? new Date(enroll.createdAt).toLocaleDateString("vi-VN") : ""].filter(value => value !== undefined && value !== null).join(" ").toLowerCase().includes(normalizedKeyword)) : semesterEnrollments;
  const filteredCourses = selectedSemesterId ? courses.filter(course => course.semester_id === selectedSemesterId) : courses;
  const totalPages = Math.ceil(filteredEnrollments.length / PAGE_SIZE);
  const paginated = filteredEnrollments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <div className="ministry-enrollments__page-wrapper">
      {/* BREADCRUMB */}
      <div className="ministry-enrollments__breadcrumb">
        <span className="ministry-enrollments__breadcrumb-home">Dashboard</span>
        <span className="ministry-enrollments__breadcrumb-sep">›</span>
        <span className="ministry-enrollments__breadcrumb-current">Quản lý ghi danh</span>
      </div>

      {/* PAGE HEADER */}
      <div className="ministry-enrollments__page-header">
        <h1 className="ministry-enrollments__page-title">DANH SÁCH ĐĂNG KÝ HỌC PHẦN</h1>
        <button onClick={handleClickCreate} className="ministry-enrollments__add-btn">
          <FiPlus size={16} />
          Thêm đăng ký mới
        </button>
      </div>

      {/* STATS BANNER */}
      <div className="ministry-enrollments__stat-banner">
        <div className="ministry-enrollments__stat-banner-inner">
          <div>
            <p className="ministry-enrollments__stat-label">Tổng số lượt đăng ký</p>

            <p className="ministry-enrollments__stat-number">{filteredEnrollments.length}</p>

            <p className="ministry-enrollments__stat-footnote">
              Hệ thống hiện có {students.length} sinh viên và{" "}
              {filteredCourses.length} khóa học trong bộ lọc
            </p>
          </div>

          <div className="ministry-enrollments__banner-icon-bg">
            <FiPlus size={50} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>

      <div className="ministry-enrollments__filter-bar">
        <label className="ministry-enrollments__filter-label">Kỳ học</label>
        <select value={selectedSemesterId} onChange={e => {
        setSelectedSemesterId(e.target.value);
        setPage(1);
        setFormData(current => ({
          ...current,
          course_id: ""
        }));
      }} className="ministry-enrollments__field-input">

          
          <option value="">Tất cả kỳ học</option>
          {semesters.map(semester => <option key={semester.semester_id} value={semester.semester_id}>
              {semester.name} {semester.school_year}
              {semester.is_active ? " - Hiện hành" : ""}
            </option>)}
        </select>
        <div className="ministry-enrollments__search-wrap">
          <FiSearch size={15} color="#94a3b8" />
          <input value={keyword} onChange={e => {
          setKeyword(e.target.value);
          setPage(1);
        }} placeholder="Tim sinh vien, khoa hoc, mon hoc..." className="ministry-enrollments__search-input" />

          
        </div>
      </div>

      {/* MODAL FORM */}
      {showForm && <div className="ministry-enrollments__modal-overlay">
          <div className="ministry-enrollments__modal-box">
            <div className="ministry-enrollments__modal-header">
              <h3 className="ministry-enrollments__form-title">Thêm đăng ký mới</h3>

              <button onClick={() => setShowForm(false)} className="ministry-enrollments__close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ministry-enrollments__form-grid">
                <div className="ministry-enrollments__field-group">
                  <label className="ministry-enrollments__field-label">Sinh viên</label>

                  <select name="student_id" value={formData.student_id} onChange={handleInputChange} required className="ministry-enrollments__field-input">
                  
                    <option value="">-- Chọn sinh viên --</option>

                    {students.map(s => <option key={s.student_id} value={s.student_id}>
                        {s.student_id}
                      </option>)}
                  </select>
                </div>

                <div className="ministry-enrollments__field-group">
                  <label className="ministry-enrollments__field-label">Khóa học</label>

                  <select name="course_id" value={formData.course_id} onChange={handleInputChange} required className="ministry-enrollments__field-input">
                  
                    <option value="">-- Chọn khóa học --</option>

                    {filteredCourses.map(c => <option key={c.course_id} value={c.course_id}>
                        {c.course_code || c.course_id}
                        {c.subject?.name ? ` - ${c.subject.name}` : ""}
                      </option>)}
                  </select>
                </div>
              </div>

              <div className="ministry-enrollments__modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="ministry-enrollments__cancel-modal-btn">

                
                  Hủy
                </button>

                <button type="submit" className="ministry-enrollments__submit-btn">
                  Lưu đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>}

      {/* TABLE */}
      <div className="ministry-enrollments__table-card">
        <div className="ministry-enrollments__inline-306">
          <table className="ministry-enrollments__table">
            <thead>
              <tr className="ministry-enrollments__thead-row">
                <th className="ministry-enrollments__th">STT</th>
                <th className="ministry-enrollments__th">MÃ ĐK</th>
                <th className="ministry-enrollments__th">MÃ SV</th>
                <th className="ministry-enrollments__th">MÃ CODE</th>
                <th className="ministry-enrollments__th">MÃ MÔN HỌC</th>
                <th className="ministry-enrollments__th">NGÀY ĐĂNG KÝ</th>
                <th className="ministry-enrollments__th">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((enroll, index) => <tr key={enroll.enrollment_id} className="ministry-enrollments__tbody-row">
                  <td className="ministry-enrollments__td ministry-enrollments__inline-322">
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                  </td>
                  <td className="ministry-enrollments__td ministry-enrollments__inline-328">
                    {enroll.enrollment_id}
                  </td>
                  <td className="ministry-enrollments__td">{enroll.student_id}</td>
                  <td className="ministry-enrollments__td">
                    {enroll.course?.course_code || enroll.course_id}
                  </td>
                  <td className="ministry-enrollments__td">
                    {enroll.course?.subject_id || enroll.course?.subject?.subject_id || "N/A"}
                  </td>
                  <td className="ministry-enrollments__td">
                    {enroll.createdAt ? new Date(enroll.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                  </td>
                  <td className="ministry-enrollments__td">
                    <button onClick={() => handleDelete(enroll)} className="ministry-enrollments__cancel-btn">

                    
                      Hủy
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="ministry-enrollments__pagination-row">
          <span className="ministry-enrollments__page-info">
            Trang {page} / {totalPages || 1}
          </span>
          <div className="ministry-enrollments__page-controls">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={"ministry-enrollments__page-btn" + (page === 1 ? " ministry-enrollments__page-btn-disabled" : "")}>
              
              Trước
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className={"ministry-enrollments__page-btn ministry-enrollments__page-btn-active" + (page === totalPages || totalPages === 0 ? " ministry-enrollments__page-btn-disabled" : "")}>



              
              Tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>;
};

// ─── STYLES ────────────────────────────────────────────────────────────────────

export default MinistryEnrollments;
