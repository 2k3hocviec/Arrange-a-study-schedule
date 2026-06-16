import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { coursesAPI, subjectsAPI, teachersAPI, semestersAPI, schedulesAPI } from "../services/api";
import toast from "react-hot-toast";
import { MdMenuBook } from "react-icons/md";
import { FiCalendar, FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";

const PAGE_SIZE = 10;

const getCourseErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("unique") ||
    lowerMessage.includes("duplicate") ||
    lowerMessage.includes("p2002") ||
    lowerMessage.includes("course_code")
  ) {
    return "Mã lớp học phần đã tồn tại. Vui lòng kiểm tra lại mã khóa học.";
  }

  if (lowerMessage.includes("required room type")) {
    return "Vui lòng chọn loại phòng yêu cầu.";
  }

  if (
    lowerMessage.includes("not teacher") ||
    lowerMessage.includes("not subject") ||
    lowerMessage.includes("not semester")
  ) {
    return "Giáo viên, môn học hoặc kỳ học không tồn tại. Vui lòng kiểm tra lại.";
  }

  if (lowerMessage.includes("capacity must be at least")) {
    return "Sĩ số tối đa không được nhỏ hơn số sinh viên đã đăng ký.";
  }

  if (lowerMessage.includes("cannot update course that has schedule")) {
    return "Không thể cập nhật vì khóa học đã được xếp lịch.";
  }

  if (
    lowerMessage.includes("cannot move course to this semester") ||
    lowerMessage.includes("outside the semester date range")
  ) {
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

const MinistryCourses = () => {
  const navigate = useNavigate();
  const roomTypeOptions = [
    { value: "Theory", label: "Lý thuyết" },
    { value: "Practice", label: "Thực hành" },
  ];

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
    required_room_type: "Theory",
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
      setSelectedSemesterId((current) =>
        current || response.data.find((s) => s.is_active)?.semester_id || "",
      );
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? (value ? Number(value) : "") : value,
    });
  };

  const handleClickCreateCourse = () => {
    setFormData({
      subject_id: "",
      teacher_id: "",
      semester_id: semesters.find((s) => s.is_active)?.semester_id || "",
      capacity: "",
      required_room_type: "Theory",
    });
    setRepair(false);
    setShowForm(!showForm);
  };

  const handleOpenFormUpdate = (course) => {
    setFormData({
      ...course,
      subject_id: course.subject_id || course.subject?.subject_id || "",
      teacher_id: course.teacher_id || course.teacher?.teacher_id || "",
      semester_id: course.semester_id || course.semester?.semester_id || "",
      required_room_type: course.required_room_type || "Theory",
    });
    setRepair(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
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
      fetchCourses();
      fetchSchedules();
    } catch (err) {
      toast.error(getCourseErrorMessage(err));
    }
  };

  const handleDeleteCourse = async (course) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa khóa học ${course.course_code || course.course_id}?`,
      )
    ) {
      return;
    }

    try {
      await coursesAPI.delete(course.course_id);
      toast.success("Xóa khóa học thành công!");
      fetchCourses();
      fetchSchedules();
    } catch (err) {
      toast.error(getCourseErrorMessage(err, "delete"));
    }
  };

  const scheduledCourseIds = new Set(schedules.map((s) => s.course_id));
  const isScheduledRepair = repair && scheduledCourseIds.has(formData.course_id);
  const filteredCourses = courses
    .filter((course) =>
      selectedSemesterId ? course.semester_id === selectedSemesterId : true,
    )
    .filter((course) => {
      const hasSchedule = scheduledCourseIds.has(course.course_id);
      if (scheduleFilter === "scheduled") return hasSchedule;
      if (scheduleFilter === "unscheduled") return !hasSchedule;
      if (scheduleFilter === "available") return (course.remaining_capacity ?? 0) > 0;
      if (scheduleFilter === "full") return (course.remaining_capacity ?? 0) <= 0;
      return true;
    })
    .filter((course) => {
      const normalizedKeyword = keyword.trim().toLowerCase();
      if (!normalizedKeyword) return true;
      return [
        course.course_code,
        course.course_id,
        course.subject_id,
        course.subject?.name,
        course.teacher_id,
        course.teacher?.name,
        course.semester?.name,
        course.semester?.school_year,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
    })
    .sort((a, b) => {
      const aScheduled = scheduledCourseIds.has(a.course_id);
      const bScheduled = scheduledCourseIds.has(b.course_id);
      if (aScheduled !== bScheduled) return aScheduled ? 1 : -1;
      const aActive = a.semester?.is_active ? 0 : 1;
      const bActive = b.semester?.is_active ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return String(a.course_code || a.course_id).localeCompare(
        String(b.course_code || b.course_id),
      );
    });
  const scheduledCount = courses.filter((c) => scheduledCourseIds.has(c.course_id)).length;
  const unscheduledCount = Math.max(0, courses.length - scheduledCount);
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCourses = filteredCourses.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div style={pageWrapper}>
      {/* BREADCRUMB */}
      <div style={breadcrumb}>
        <span style={breadcrumbHome}>Dashboard</span>
        <span style={breadcrumbSep}>›</span>
        <span style={breadcrumbCurrent}>Quản lý khóa học</span>
      </div>

      {/* PAGE HEADER */}
      <div style={pageHeader}>
        <div style={pageHeaderLeft}>
          <div>
            <h1 style={pageTitle}>QUẢN LÝ KHÓA HỌC</h1>
          </div>
        </div>
        <button onClick={handleClickCreateCourse} style={addBtn}>
          <FiPlus size={16} />
          {showForm ? "Đóng Form" : "Thêm khóa học mới"}
        </button>
      </div>

      {/* STAT BANNER */}
      <div style={statBanner}>
        <div style={statBannerInner}>
          <div>
            <p style={statLabel}>Tổng số khóa học</p>
            <p style={statNumber}>{courses.length}</p>
            <div style={miniStatRow}>
              <span style={miniStat}>
                <span style={miniStatDot("#22c55e")} />
                <span style={miniStatText}>{scheduledCount} đã xếp lịch</span>
              </span>
              <span style={miniStat}>
                <span style={miniStatDot("#f97316")} />
                <span style={miniStatText}>{unscheduledCount} chưa xếp lịch</span>
              </span>
            </div>
          </div>
          <div style={bannerIconBg}>
            <MdMenuBook size={48} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={modalOverlay}>
          <div style={formCard}>
            {/* HEADER */}
            <div style={modalHeader}>
              <h3 style={formTitle}>
                {repair ? "Cập nhật khóa học" : "Thêm khóa học mới"}
              </h3>

              <button onClick={() => setShowForm(false)} style={closeBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={formGrid}>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Mã môn học</label>

                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={isScheduledRepair ? disabledFieldInput : fieldInput}
                    required
                  >
                    <option value="">-- Chọn môn học --</option>

                    {subjects.map((s) => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Mã giáo viên</label>

                  <select
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={isScheduledRepair ? disabledFieldInput : fieldInput}
                    required
                  >
                    <option value="">-- Chọn giáo viên --</option>

                    {teachers.map((t) => (
                      <option key={t.teacher_id} value={t.teacher_id}>
                        {t.teacher_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Kỳ học</label>

                  <select
                    name="semester_id"
                    value={formData.semester_id}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={isScheduledRepair ? disabledFieldInput : fieldInput}
                    required
                  >
                    <option value="">-- Chọn kỳ học --</option>

                    {semesters.map((semester) => (
                      <option key={semester.semester_id} value={semester.semester_id}>
                        {semester.name} {semester.school_year}
                        {semester.is_active ? " - Hiện hành" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Số chỗ tối đa</label>

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={isScheduledRepair ? disabledFieldInput : fieldInput}
                    placeholder="Nhập số lượng sinh viên tối đa"
                    min="1"
                    required
                  />
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Loại phòng yêu cầu</label>

                  <select
                    name="required_room_type"
                    value={formData.required_room_type}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={isScheduledRepair ? disabledFieldInput : fieldInput}
                    required
                  >
                    {roomTypeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Chỗ còn lại</label>

                  <input
                    type="text"
                    value={
                      repair
                        ? formData.remaining_capacity !== undefined
                          ? formData.remaining_capacity
                          : formData.capacity || 0
                        : formData.capacity || 0
                    }
                    disabled
                    style={{
                      ...fieldInput,
                      background: "#f1f5f9",
                      cursor: "not-allowed",
                      color: "#94a3b8",
                    }}
                  />
                </div>
              </div>

              {isScheduledRepair && (
                <div style={lockedNotice}>
                  Khóa học đã được xếp lịch nên không thể chỉnh sửa thông tin.
                </div>
              )}

              {/* FOOTER */}
              <div style={modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={cancelBtn}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isScheduledRepair}
                  style={{
                    ...submitBtn,
                    background: repair ? "#4f46e5" : "#16a34a",
                    ...(isScheduledRepair ? disabledSubmitBtn : {}),
                  }}
                >
                  {repair ? "Cập nhật dữ liệu" : "Lưu khóa học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div style={tableCard}>
        <div style={tableHeader}>
          <h3 style={tableTitle}>Danh sách khóa học hiện tại</h3>
          <div style={filterBar}>
            <div style={searchWrap}>
              <FiSearch size={15} color="#94a3b8" />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm mã lớp, môn học, giảng viên..."
                style={searchInput}
              />
            </div>
            <select
              value={selectedSemesterId}
              onChange={(e) => {
                setSelectedSemesterId(e.target.value);
                setPage(1);
              }}
              style={filterSelect}
            >
              <option value="">Tất cả kỳ học</option>
              {semesters.map((semester) => (
                <option key={semester.semester_id} value={semester.semester_id}>
                  {semester.name} {semester.school_year}
                  {semester.is_active ? " - Hiện hành" : ""}
                </option>
              ))}
            </select>
            <select
              value={scheduleFilter}
              onChange={(e) => {
                setScheduleFilter(e.target.value);
                setPage(1);
              }}
              style={filterSelect}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unscheduled">Chưa xếp lịch</option>
              <option value="scheduled">Đã xếp lịch</option>
              <option value="available">Còn chỗ</option>
              <option value="full">Hết chỗ</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>STT</th>
                <th style={th}>LOẠI PHÒNG</th>
                <th style={th}>MÃ CODE</th>
                <th style={th}>TÊN MÔN HỌC</th>
                <th style={th}>KỲ HỌC</th>
                <th style={th}>LỊCH</th>
                <th style={th}>GIÁO VIÊN</th>
                <th style={th}>TỐI ĐA</th>
                <th style={th}>CÒN LẠI</th>
                <th style={th}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {pagedCourses.length === 0 && (
                <tr>
                  <td colSpan={10} style={emptyCell}>
                    Không có khóa học phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
              {pagedCourses.map((course, index) => {
                const capacity = course.capacity || 0;
                const remainingCapacity =
                  course.remaining_capacity !== undefined
                    ? course.remaining_capacity
                    : capacity;
                const roomType = course.required_room_type || "Theory";
                const roomTypeLabel =
                  roomTypeOptions.find((type) => type.value === roomType)
                    ?.label || roomType;
                const hasSchedule = scheduledCourseIds.has(course.course_id);

                return (
                  <tr key={course.course_id} style={tbodyRow}>
                    <td style={{ ...td, color: "#94a3b8" }}>
                      {String((safePage - 1) * PAGE_SIZE + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          ...roomTypeBadge,
                          background:
                            roomType === "Practice" ? "#e0f2fe" : "#ede9fe",
                          color:
                            roomType === "Practice" ? "#0369a1" : "#4f46e5",
                        }}
                      >
                        {roomTypeLabel}
                      </span>
                    </td>
                    <td style={{ ...td, fontWeight: 600, color: "#4f46e5" }}>
                      {course.course_code || course.course_id}
                    </td>
                    <td style={td}>
                      {course.subject?.name || course.subject_id}
                    </td>
                    <td style={td}>
                      {course.semester
                        ? `${course.semester.name} ${course.semester.school_year}`
                        : course.semester_id || "-"}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          ...scheduleBadge,
                          background: hasSchedule ? "#dcfce7" : "#fff7ed",
                          color: hasSchedule ? "#15803d" : "#c2410c",
                        }}
                      >
                        {hasSchedule ? "Đã xếp lịch" : "Chưa xếp lịch"}
                      </span>
                    </td>
                    <td style={td}>
                      {course.teacher?.name || course.teacher_id}
                    </td>
                    <td style={td}>
                      <span style={capacityBadge}>{capacity}</span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          ...capacityBadge,
                          background:
                            remainingCapacity === 0 ? "#fee2e2" : "#dcfce7",
                          color:
                            remainingCapacity === 0 ? "#ef4444" : "#16a34a",
                        }}
                      >
                        {remainingCapacity}
                      </span>
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      {!hasSchedule && (
                        <button
                          onClick={() =>
                            navigate("/ministry/schedule", {
                              state: {
                                courseId: course.course_id,
                                semesterId: course.semester_id,
                              },
                            })
                          }
                          style={scheduleBtn}
                        >
                          <FiCalendar size={13} /> Xếp lịch
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenFormUpdate(course)}
                        style={editBtn}
                      >
                        <FiEdit2 size={13} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        style={deleteBtn}
                      >
                        <FiTrash2 size={13} /> Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCourses.length > 0 && (
          <div style={tableFooter}>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}-
              {Math.min(safePage * PAGE_SIZE, filteredCourses.length)} trên{" "}
              {filteredCourses.length} khóa học
            </span>
            <div style={paginationControls}>
              <button
                style={{
                  ...pageBtn,
                  ...(safePage === 1 ? pageBtnDisabled : {}),
                }}
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    style={{
                      ...pageBtn,
                      ...(safePage === pageNumber ? pageBtnActive : {}),
                    }}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                style={{
                  ...pageBtn,
                  ...(safePage === totalPages ? pageBtnDisabled : {}),
                }}
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ›
              </button>
            </div>
          </div>
        )}

        {false && courses.length > 0 && (
          <div style={tableFooter}>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              Hiển thị 1–{courses.length} trên {courses.length} khóa học
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────────

const pageWrapper = {
  padding: "28px 32px",
  fontFamily: "'Segoe UI', sans-serif",
  background: "#f8fafc",
  minHeight: "100vh",
};

const breadcrumb = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginBottom: "20px",
  fontSize: "13px",
};
const breadcrumbHome = { color: "#94a3b8", cursor: "pointer" };
const breadcrumbSep = { color: "#cbd5e1" };
const breadcrumbCurrent = { color: "#4f46e5", fontWeight: 600 };

const pageHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
  flexWrap: "wrap",
  gap: "12px",
};
const pageHeaderLeft = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};
const headerIconWrap = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  background: "#ede9fe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const pageTitle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 800,
  color: "#1e293b",
  letterSpacing: "0.3px",
};
const pageSubtitle = {
  margin: "2px 0 0",
  fontSize: "13px",
  color: "#94a3b8",
};

const addBtn = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "10px 20px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

// Stat banner
const statBanner = {
  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
  borderRadius: "14px",
  padding: "24px 28px",
  marginBottom: "24px",
  color: "white",
  position: "relative",
  overflow: "hidden",
};
const statBannerInner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};
const statLabel = { margin: 0, fontSize: "13px", opacity: 0.85 };
const statNumber = {
  margin: "4px 0",
  fontSize: "42px",
  fontWeight: 700,
  lineHeight: 1.1,
};
const statFootnote = { margin: 0, fontSize: "13px", opacity: 0.75 };
const statArrow = { marginRight: "4px" };
const bannerIconBg = {
  position: "absolute",
  right: "28px",
  top: "50%",
  transform: "translateY(-50%)",
};
const miniStatRow = { display: "flex", gap: "24px" };
const miniStat = { display: "flex", alignItems: "center", gap: "8px" };
const miniStatDot = (color) => ({
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: color,
});
const miniStatText = { fontSize: "13px", opacity: 0.9 };

// Form
const formTitle = {
  margin: "0 0 20px",
  fontSize: "16px",
  fontWeight: 700,
  color: "#1e293b",
};
const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "8px",
};
const fieldGroup = { display: "flex", flexDirection: "column" };
const fieldLabel = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "6px",
};
const fieldInput = {
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "7px",
  fontSize: "14px",
  color: "#1e293b",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const disabledFieldInput = {
  ...fieldInput,
  background: "#f1f5f9",
  cursor: "not-allowed",
  color: "#94a3b8",
};
const lockedNotice = {
  marginTop: "14px",
  padding: "10px 12px",
  border: "1px solid #fde68a",
  borderRadius: "8px",
  background: "#fffbeb",
  color: "#92400e",
  fontSize: "13px",
  fontWeight: 600,
};
const submitBtn = {
  marginTop: "16px",
  padding: "10px 24px",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};
const disabledSubmitBtn = {
  background: "#cbd5e1",
  cursor: "not-allowed",
  opacity: 0.75,
};

// Table
const tableCard = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
};
const tableHeader = {
  padding: "18px 24px 14px",
  borderBottom: "1px solid #f1f5f9",
};
const tableTitle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: 700,
  color: "#1e293b",
};
const filterBar = {
  display: "grid",
  gridTemplateColumns: "minmax(260px, 1fr) minmax(200px, 260px) minmax(180px, 220px)",
  gap: "12px",
  marginTop: "14px",
};
const searchWrap = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  background: "#f8fafc",
};
const searchInput = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#1e293b",
  fontSize: "14px",
};
const filterSelect = {
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  background: "#fff",
  color: "#1e293b",
  fontSize: "14px",
  outline: "none",
};
const table = {
  width: "100%",
  borderCollapse: "collapse",
};
const theadRow = {
  background: "#f8fafc",
};
const th = {
  padding: "11px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.6px",
  borderBottom: "1px solid #e2e8f0",
};
const tbodyRow = {
  borderBottom: "1px solid #f1f5f9",
  transition: "background 0.15s",
};
const td = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#334155",
};
const capacityBadge = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: 600,
  background: "#ede9fe",
  color: "#4f46e5",
};
const roomTypeBadge = {
  display: "inline-block",
  minWidth: "72px",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 700,
  textAlign: "center",
};
const scheduleBadge = {
  display: "inline-block",
  minWidth: "92px",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 700,
  textAlign: "center",
};
const scheduleBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  marginRight: "6px",
  padding: "5px 12px",
  background: "#dcfce7",
  color: "#15803d",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
};
const editBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  marginRight: "6px",
  padding: "5px 12px",
  background: "#ede9fe",
  color: "#4f46e5",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};
const emptyCell = {
  padding: "36px 16px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "14px",
};
const deleteBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "5px 12px",
  background: "#fee2e2",
  color: "#ef4444",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};
const tableFooter = {
  padding: "14px 24px",
  borderTop: "1px solid #f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};
const paginationControls = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
};
const pageBtn = {
  minWidth: "32px",
  height: "32px",
  padding: "0 10px",
  border: "1px solid #e2e8f0",
  borderRadius: "7px",
  background: "#fff",
  color: "#334155",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
};
const pageBtnActive = {
  background: "#4f46e5",
  color: "#fff",
  border: "1px solid #4f46e5",
};
const pageBtnDisabled = {
  opacity: 0.45,
  cursor: "not-allowed",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "20px",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
};

const closeBtn = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  border: "none",
  background: "#f1f5f9",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "700",
  color: "#64748b",
};

const cancelBtn = {
  padding: "10px 18px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#475569",
  cursor: "pointer",
  fontWeight: "600",
};

const formCard = {
  background: "white",
  borderRadius: "16px",
  padding: "24px",
  width: "100%",
  maxWidth: "850px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  border: "1px solid #e2e8f0",
};

export default MinistryCourses;
