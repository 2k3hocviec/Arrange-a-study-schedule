import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { coursesAPI, subjectsAPI, teachersAPI, semestersAPI, schedulesAPI } from "../services/api";
import toast from "react-hot-toast";
import { MdMenuBook } from "react-icons/md";
import { FiCalendar, FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import "../styles/MinistryCourses.css";
const PAGE_SIZE = 10;
const getCourseErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate") || lowerMessage.includes("p2002") || lowerMessage.includes("course_code")) {
    return "Mã lớp học phần đã tồn tại. Vui lòng kiểm tra lại mã khóa học.";
  }
  if (lowerMessage.includes("required room type")) {
    return "Vui lòng chọn loại phòng yêu cầu.";
  }
  if (lowerMessage.includes("not teacher") || lowerMessage.includes("not subject") || lowerMessage.includes("not semester")) {
    return "Giáo viên, môn học hoặc kỳ học không tồn tại. Vui lòng kiểm tra lại.";
  }
  if (lowerMessage.includes("teacher department does not match subject major department")) {
    return "Giáo viên không thuộc khoa của chuyên ngành môn học. Vui lòng chọn giáo viên phù hợp.";
  }
  if (lowerMessage.includes("capacity must be at least")) {
    return "Sĩ số tối đa không được nhỏ hơn số sinh viên đã đăng ký.";
  }
  if (lowerMessage.includes("cannot update course that has schedule")) {
    return "Không thể cập nhật vì khóa học đã được xếp lịch.";
  }
  if (lowerMessage.includes("cannot move course to this semester") || lowerMessage.includes("outside the semester date range")) {
    return "Không thể chuyển khóa học sang kỳ này vì đã có lịch học nằm ngoài khoảng thời gian của kỳ mới.";
  }
  if (lowerMessage.includes("cannot delete course that has schedules")) {
    return "Không thể xóa khóa học vì đã có lịch học.";
  }
  if (lowerMessage.includes("cannot delete course that has enrollments")) {
    return "Không thể xóa khóa học vì đã có sinh viên đăng ký.";
  }
  if (action === "delete") {
    return "Không thể xóa khóa học.";
  }
  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
};
const MinistryCourses = ({
  subjectsRefreshKey = 0,
  onCoursesChanged = () => {},
}) => {
  const navigate = useNavigate();
  const roomTypeOptions = [{
    value: "Theory",
    label: "Lý thuyết"
  }, {
    value: "Practice",
    label: "Thực hành"
  }];
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [formData, setFormData] = useState({
    subject_id: "",
    teacher_id: "",
    semester_id: "",
    capacity: "",
    required_room_type: "Theory"
  });
  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
      setPage(1);
    } catch (e) {
      toast.error("Không thể tải dữ liệu khóa học");
    }
  };
  const fetchSchedules = async () => {
    try {
      const response = await schedulesAPI.getAll();
      setSchedules(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu lịch học");
    }
  };
  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAllIds();
      setTeachers(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách giáo viên");
    }
  };
  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAllIds();
      setSubjects(response.data);
    } catch (e) {
      toast.error("Không thể tải danh sách môn học");
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
    fetchCourses();
    fetchTeachers();
    fetchSubjects();
    fetchSemesters();
    fetchSchedules();
  }, []);
  useEffect(() => {
    if (subjectsRefreshKey === 0) return;
    fetchSubjects();
    fetchCourses();
  }, [subjectsRefreshKey]);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? value ? Number(value) : "" : value
    });
  };
  const handleClickCreateCourse = () => {
    setFormData({
      subject_id: "",
      teacher_id: "",
      semester_id: semesters.find(s => s.is_active)?.semester_id || "",
      capacity: "",
      required_room_type: "Theory"
    });
    setRepair(false);
    setShowForm(!showForm);
  };
  const handleOpenFormUpdate = course => {
    setFormData({
      ...course,
      subject_id: course.subject_id || course.subject?.subject_id || "",
      teacher_id: course.teacher_id || course.teacher?.teacher_id || "",
      semester_id: course.semester_id || course.semester?.semester_id || "",
      required_room_type: course.required_room_type || "Theory"
    });
    setRepair(true);
    setShowForm(true);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (repair && scheduledCourseIds.has(formData.course_id)) {
      toast.error("Không thể cập nhật vì khóa học đã được xếp lịch.");
      return;
    }
    try {
      if (repair) {
        await coursesAPI.update(formData.course_id, formData);
        toast.success("Cập nhật khóa học thành công!");
      } else {
        await coursesAPI.create(formData);
        toast.success("Thêm khóa học thành công!");
      }
      setShowForm(false);
      await fetchCourses();
      await fetchSchedules();
      onCoursesChanged();
    } catch (err) {
      toast.error(getCourseErrorMessage(err));
    }
  };
  const handleDeleteCourse = async course => {
    if (!window.confirm(`Bạn có chắc muốn xóa khóa học ${course.course_code || course.course_id}?`)) {
      return;
    }
    try {
      await coursesAPI.delete(course.course_id);
      toast.success("Xóa khóa học thành công!");
      await fetchCourses();
      await fetchSchedules();
      onCoursesChanged();
    } catch (err) {
      toast.error(getCourseErrorMessage(err, "delete"));
    }
  };
  const scheduledCourseIds = new Set(schedules.map(s => s.course_id));
  const isScheduledRepair = repair && scheduledCourseIds.has(formData.course_id);
  const selectedSubject = subjects.find(subject => subject.subject_id === formData.subject_id);
  const selectedSubjectDepartmentId = selectedSubject?.major?.department_id;
  const availableTeachers = selectedSubject ? teachers.filter(teacher => teacher.department_id === selectedSubjectDepartmentId) : teachers;
  const filteredCourses = courses.filter(course => selectedSemesterId ? course.semester_id === selectedSemesterId : true).filter(course => {
    const hasSchedule = scheduledCourseIds.has(course.course_id);
    if (scheduleFilter === "scheduled") return hasSchedule;
    if (scheduleFilter === "unscheduled") return !hasSchedule;
    if (scheduleFilter === "available") return (course.remaining_capacity ?? 0) > 0;
    if (scheduleFilter === "full") return (course.remaining_capacity ?? 0) <= 0;
    return true;
  }).filter(course => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return true;
    return [course.course_code, course.course_id, course.subject_id, course.subject?.name, course.teacher_id, course.teacher?.name, course.semester?.name, course.semester?.school_year].filter(Boolean).some(value => String(value).toLowerCase().includes(normalizedKeyword));
  }).sort((a, b) => {
    const aScheduled = scheduledCourseIds.has(a.course_id);
    const bScheduled = scheduledCourseIds.has(b.course_id);
    if (aScheduled !== bScheduled) return aScheduled ? 1 : -1;
    const aActive = a.semester?.is_active ? 0 : 1;
    const bActive = b.semester?.is_active ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return String(a.course_code || a.course_id).localeCompare(String(b.course_code || b.course_id));
  });
  const scheduledCount = courses.filter(c => scheduledCourseIds.has(c.course_id)).length;
  const unscheduledCount = Math.max(0, courses.length - scheduledCount);
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCourses = filteredCourses.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  return <div className="ministry-courses__page-wrapper">
      {/* BREADCRUMB */}
      <div className="ministry-courses__breadcrumb">
        <span className="ministry-courses__breadcrumb-home">Dashboard</span>
        <span className="ministry-courses__breadcrumb-sep">/</span>
        <span className="ministry-courses__breadcrumb-current">Quản lý khóa học</span>
      </div>

      {/* PAGE HEADER */}
      <div className="ministry-courses__page-header">
        <div className="ministry-courses__page-header-left">
          <div>
            <h1 className="ministry-courses__page-title">QUẢN LÝ KHÓA HỌC</h1>
          </div>
        </div>
        <button onClick={handleClickCreateCourse} className="ministry-courses__add-btn">
          <FiPlus size={16} />
          {showForm ? "Đóng Form" : "Thêm khóa học mới"}
        </button>
      </div>

      {/* STAT BANNER */}
      <div className="ministry-courses__stat-banner">
        <div className="ministry-courses__stat-banner-inner">
          <div>
            <p className="ministry-courses__stat-label">Tổng số khóa học</p>
            <p className="ministry-courses__stat-number">{courses.length}</p>
            <div className="ministry-courses__mini-stat-row">
              <span className="ministry-courses__mini-stat">
                <span style={miniStatDot("#22c55e")} />
                <span className="ministry-courses__mini-stat-text">
                  {scheduledCount} đã xếp lịch
                </span>
              </span>
              <span className="ministry-courses__mini-stat">
                <span style={miniStatDot("#f97316")} />
                <span className="ministry-courses__mini-stat-text">
                  {unscheduledCount} chưa xếp lịch
                </span>
              </span>
            </div>
          </div>
          <div className="ministry-courses__banner-icon-bg">
            <MdMenuBook size={48} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && <div className="ministry-courses__modal-overlay">
          <div className="ministry-courses__form-card">
            {/* HEADER */}
            <div className="ministry-courses__modal-header">
              <h3 className="ministry-courses__form-title">
                {repair ? "Cập nhật khóa học" : "Thêm khóa học mới"}
              </h3>

              <button onClick={() => setShowForm(false)} className="ministry-courses__close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ministry-courses__form-grid">
                <div className="ministry-courses__field-group">
                  <label className="ministry-courses__field-label">Mã môn học</label>

                  <select name="subject_id" value={formData.subject_id} onChange={handleInputChange} disabled={isScheduledRepair} className={`ministry-courses__field-input ${isScheduledRepair ? "ministry-courses__field-input--disabled" : ""}`} required>
                  
                    <option value="">-- Chọn môn học --</option>

                    {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_id}
                      </option>)}
                  </select>
                </div>

                <div className="ministry-courses__field-group">
                  <label className="ministry-courses__field-label">Mã giáo viên</label>

                  <select name="teacher_id" value={formData.teacher_id} onChange={handleInputChange} disabled={isScheduledRepair} className={`ministry-courses__field-input ${isScheduledRepair ? "ministry-courses__field-input--disabled" : ""}`} required>
                  
                    <option value="">-- Chọn giáo viên --</option>

                    {availableTeachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>
                        {t.teacher_id}
                      </option>)}
                  </select>
                </div>

                <div className="ministry-courses__field-group">
                  <label className="ministry-courses__field-label">Kỳ học</label>

                  <select name="semester_id" value={formData.semester_id} onChange={handleInputChange} disabled={isScheduledRepair} className={`ministry-courses__field-input ${isScheduledRepair ? "ministry-courses__field-input--disabled" : ""}`} required>
                  
                    <option value="">-- Chọn kỳ học --</option>

                    {semesters.map(semester => <option key={semester.semester_id} value={semester.semester_id}>
                    
                        {semester.name} {semester.school_year}
                        {semester.is_active ? " - Hiện hành" : ""}
                      </option>)}
                  </select>
                </div>

                <div className="ministry-courses__field-group">
                  <label className="ministry-courses__field-label">Số chỗ tối đa</label>

                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} disabled={isScheduledRepair} className={`ministry-courses__field-input ${isScheduledRepair ? "ministry-courses__field-input--disabled" : ""}`} placeholder="Nhập số lượng sinh viên tối đa" min="1" required />
                
                </div>

                <div className="ministry-courses__field-group">
                  <label className="ministry-courses__field-label">Loại phòng yêu cầu</label>

                  <select name="required_room_type" value={formData.required_room_type} onChange={handleInputChange} disabled={isScheduledRepair} className={`ministry-courses__field-input ${isScheduledRepair ? "ministry-courses__field-input--disabled" : ""}`} required>
                  
                    {roomTypeOptions.map(type => <option key={type.value} value={type.value}>
                        {type.label}
                      </option>)}
                  </select>
                </div>

                <div className="ministry-courses__field-group">
                  <label className="ministry-courses__field-label">Chỗ còn lại</label>

                  <input type="text" value={repair ? formData.remaining_capacity !== undefined ? formData.remaining_capacity : formData.capacity || 0 : formData.capacity || 0} disabled className="ministry-courses__field-input ministry-courses__inline-486" />






                
                </div>
              </div>

              {isScheduledRepair && <div className="ministry-courses__locked-notice">
                  Khóa học đã được xếp lịch nên không thể chỉnh sửa thông tin.
                </div>}

              {/* FOOTER */}
              <div className="ministry-courses__modal-footer">
                <button type="button" onClick={() => setShowForm(false)} className="ministry-courses__cancel-btn">

                
                  Hủy
                </button>

                <button type="submit" disabled={isScheduledRepair} style={{
              background: repair ? "#4f46e5" : "#16a34a"
            }} className={"ministry-courses__submit-btn" + (isScheduledRepair ? " ministry-courses__disabled-submit-btn" : "")}>
                
                  {repair ? "Cập nhật dữ liệu" : "Lưu khóa học"}
                </button>
              </div>
            </form>
          </div>
        </div>}

      {/* TABLE SECTION */}
      <div className="ministry-courses__table-card">
        <div className="ministry-courses__table-header">
          <h3 className="ministry-courses__table-title">Danh sách khóa học hiện tại</h3>
          <div className="ministry-courses__filter-bar">
            <div className="ministry-courses__search-wrap">
              <FiSearch size={15} color="#94a3b8" />
              <input value={keyword} onChange={e => {
              setKeyword(e.target.value);
              setPage(1);
            }} placeholder="Tìm mã lớp, môn học, giảng viên..." className="ministry-courses__search-input" />

              
            </div>
            <select value={selectedSemesterId} onChange={e => {
            setSelectedSemesterId(e.target.value);
            setPage(1);
          }} className="ministry-courses__filter-select">

              
              <option value="">Tất cả kỳ học</option>
              {semesters.map(semester => <option key={semester.semester_id} value={semester.semester_id}>
                  {semester.name} {semester.school_year}
                  {semester.is_active ? " - Hiện hành" : ""}
                </option>)}
            </select>
            <select value={scheduleFilter} onChange={e => {
            setScheduleFilter(e.target.value);
            setPage(1);
          }} className="ministry-courses__filter-select">

              
              <option value="all">Tất cả trạng thái</option>
              <option value="unscheduled">Chưa xếp lịch</option>
              <option value="scheduled">Đã xếp lịch</option>
              <option value="available">Còn chỗ</option>
              <option value="full">Hết chỗ</option>
            </select>
          </div>
        </div>

        <div className="ministry-courses__inline-589">
          <table className="ministry-courses__table">
            <thead>
              <tr className="ministry-courses__thead-row">
                <th className="ministry-courses__th">STT</th>
                <th className="ministry-courses__th">LOẠI PHÒNG</th>
                <th className="ministry-courses__th">MÃ CODE</th>
                <th className="ministry-courses__th">TÊN MÔN HỌC</th>
                <th className="ministry-courses__th">KỲ HỌC</th>
                <th className="ministry-courses__th">LỊCH</th>
                <th className="ministry-courses__th">GIÁO VIÊN</th>
                <th className="ministry-courses__th">TỐI ĐA</th>
                <th className="ministry-courses__th">CÒN LẠI</th>
                <th className="ministry-courses__th">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {pagedCourses.length === 0 && <tr>
                  <td colSpan={10} className="ministry-courses__empty-cell">
                    Không có khóa học phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>}
              {pagedCourses.map((course, index) => {
              const capacity = course.capacity || 0;
              const remainingCapacity = course.remaining_capacity !== undefined ? course.remaining_capacity : capacity;
              const roomType = course.required_room_type || "Theory";
              const roomTypeLabel = roomTypeOptions.find(type => type.value === roomType)?.label || roomType;
              const hasSchedule = scheduledCourseIds.has(course.course_id);
              return <tr key={course.course_id} className="ministry-courses__tbody-row">
                    <td className="ministry-courses__td ministry-courses__inline-627">
                      {String((safePage - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                    </td>
                    <td className="ministry-courses__td">
                      <span style={{
                    background: roomType === "Practice" ? "#e0f2fe" : "#ede9fe",
                    color: roomType === "Practice" ? "#0369a1" : "#4f46e5"
                  }} className="ministry-courses__room-type-badge">
                        
                        {roomTypeLabel}
                      </span>
                    </td>
                    <td className="ministry-courses__td ministry-courses__inline-646">
                      {course.course_code || course.course_id}
                    </td>
                    <td className="ministry-courses__td">
                      {course.subject?.name || course.subject_id}
                    </td>
                    <td className="ministry-courses__td">
                      {course.semester ? `${course.semester.name} ${course.semester.school_year}` : course.semester_id || "-"}
                    </td>
                    <td className="ministry-courses__td">
                      <span style={{
                    background: hasSchedule ? "#dcfce7" : "#fff7ed",
                    color: hasSchedule ? "#15803d" : "#c2410c"
                  }} className="ministry-courses__schedule-badge">
                        
                        {hasSchedule ? "Đã xếp lịch" : "Chưa xếp lịch"}
                      </span>
                    </td>
                    <td className="ministry-courses__td">
                      {course.teacher?.name || course.teacher_id}
                    </td>
                    <td className="ministry-courses__td">
                      <span className="ministry-courses__capacity-badge">{capacity}</span>
                    </td>
                    <td className="ministry-courses__td">
                      <span style={{
                    background: remainingCapacity === 0 ? "#fee2e2" : "#dcfce7",
                    color: remainingCapacity === 0 ? "#ef4444" : "#16a34a"
                  }} className="ministry-courses__capacity-badge">
                        
                        {remainingCapacity}
                      </span>
                    </td>
                    <td className="ministry-courses__td ministry-courses__inline-689">
                      {!hasSchedule && <button onClick={() => navigate("/ministry/schedule", {
                    state: {
                      courseId: course.course_id,
                      semesterId: course.semester_id
                    }
                  })} className="ministry-courses__schedule-btn">

                        
                          <FiCalendar size={13} /> Xếp lịch
                        </button>}
                      <button onClick={() => handleOpenFormUpdate(course)} className="ministry-courses__edit-btn">

                        
                        <FiEdit2 size={13} /> Sửa
                      </button>
                      <button onClick={() => handleDeleteCourse(course)} className="ministry-courses__delete-btn">

                        
                        <FiTrash2 size={13} /> Xóa
                      </button>
                    </td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>

        {filteredCourses.length > 0 && <div className="ministry-courses__table-footer">
            <span className="ministry-courses__inline-727">
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}-
              {Math.min(safePage * PAGE_SIZE, filteredCourses.length)} trên{" "}
              {filteredCourses.length} khóa học
            </span>
            <div className="ministry-courses__pagination-controls">
              <button disabled={safePage === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={"ministry-courses__page-btn" + (safePage === 1 ? " ministry-courses__page-btn-disabled" : "")}>
              
                ‹
              </button>
              {Array.from({
            length: totalPages
          }, (_, index) => {
            const pageNumber = index + 1;
            return <button key={pageNumber} onClick={() => setPage(pageNumber)} className={"ministry-courses__page-btn" + (safePage === pageNumber ? " ministry-courses__page-btn-active" : "")}>
                  
                    {pageNumber}
                  </button>;
          })}
              <button disabled={safePage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={"ministry-courses__page-btn" + (safePage === totalPages ? " ministry-courses__page-btn-disabled" : "")}>
              
                ›
              </button>
            </div>
          </div>}

        {false && courses.length > 0 && <div className="ministry-courses__table-footer">
            <span className="ministry-courses__inline-774">
              Hiển thị 1-{courses.length} trên {courses.length} khóa học
            </span>
          </div>}
      </div>
    </div>;
};

// STYLES

// Stat banner

const miniStatDot = color => ({
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: color
});

// Form

export default MinistryCourses;
