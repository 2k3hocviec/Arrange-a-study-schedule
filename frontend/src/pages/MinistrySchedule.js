import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { schedulesAPI, coursesAPI, roomsAPI, semestersAPI } from "../services/api";
import toast from "react-hot-toast";
import { IoCalendar, IoSaveOutline } from "react-icons/io5";
import {
  MdEdit,
  MdDelete,
  MdOutlineCalendarMonth,
  MdMenuBook,
} from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

const PAGE_SIZE = 10;

const DAY_LABEL = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ Nhật",
};

const EMPTY_FORM = {
  course_id: "",
  classroom_id: "",
  dayOfWeek: "",
  start_slot: "",
  end_slot: "",
  start_date: "",
  end_date: "",
};

const getErrorMessage = (err) => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (!message) {
    return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
  }

  if (
    lowerMessage.includes("schedule dates must be within") ||
    lowerMessage.includes("semester date range")
  ) {
    return "Ngày bắt đầu và ngày kết thúc phải nằm trong khoảng thời gian của kỳ học.";
  }

  if (message.includes("Cannot update schedule that has enrollments")) {
    return "Không thể cập nhật lịch vì khóa học đã có sinh viên ghi danh.";
  }

  if (message.includes("Cannot delete schedule that has enrollments")) {
    return "Không thể xóa lịch vì khóa học đã có sinh viên ghi danh.";
  }

  if (message.includes("does not match required room type")) {
    return "Loại phòng không phù hợp với loại phòng yêu cầu của học phần.";
  }

  if (message.includes("is not ready for scheduling")) {
    return "Phòng học đang bảo trì hoặc chưa sẵn sàng để xếp lịch.";
  }

  if (message.includes("Classroom capacity")) {
    return "Sức chứa phòng học nhỏ hơn sĩ số tối đa của học phần.";
  }

  if (message.includes("This course already has a schedule")) {
    return "Khóa học này đã được xếp lịch.";
  }

  if (message.includes("already has schedule")) {
    return "Phòng học đã có lịch ở khoảng thời gian này.";
  }

  if (message.includes("Teacher already has schedule")) {
    return "Giảng viên đã có lịch dạy ở khoảng thời gian này.";
  }

  if (message.includes("Teacher has registered a busy date")) {
    return "Giảng viên đã khai báo bận trong khoảng thời gian này. Vui lòng chọn lịch khác.";
  }

  if (message.includes("approved busy request")) {
    return "Giảng viên đã có lịch bận được duyệt trùng ngày và khoảng tiết này.";
  }

  if (message.includes("Course not exist")) {
    return "Học phần không tồn tại.";
  }

  if (message.includes("Classroom not exist")) {
    return "Phòng học không tồn tại.";
  }

  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
};

const MinistrySchedule = () => {
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [repair, setRepair] = useState(false);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    try {
      const [resSchedules, resCourses, resRooms, resSemesters] = await Promise.all([
        schedulesAPI.getAll(),
        coursesAPI.getAll(),
        roomsAPI.getAll(),
        semestersAPI.getAll(),
      ]);
      setSchedules(resSchedules.data);
      setCourses(resCourses.data);
      setRooms(resRooms.data);
      setSemesters(resSemesters.data);
      const courseIdFromState = location.state?.courseId;
      const semesterIdFromState = location.state?.semesterId;
      setSelectedSemesterId((current) =>
        current ||
        semesterIdFromState ||
        resSemesters.data.find((s) => s.is_active)?.semester_id ||
        "",
      );
      if (courseIdFromState) {
        setFormData((current) => ({
          ...current,
          course_id: courseIdFromState,
        }));
      }
    } catch (e) {
      toast.error("Không thể tải dữ liệu lịch học");
    }
  }, [location.state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenUpdate = (item) => {
    setSelectedSemesterId(
      item.course?.semester_id || item.course?.semester?.semester_id || selectedSemesterId,
    );
    setFormData({
      ...item,
      start_date: item.start_date
        ? new Date(item.start_date).toISOString().slice(0, 10)
        : "",
      end_date: item.end_date
        ? new Date(item.end_date).toISOString().slice(0, 10)
        : "",
    });
    setRepair(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetForm = () => {
    setFormData(EMPTY_FORM);
    setRepair(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (repair) {
        await schedulesAPI.update(formData.schedule_id, formData);
        toast.success("Cập nhật lịch học thành công!");
      } else {
        await schedulesAPI.create(formData);
        toast.success("Sắp xếp lịch học mới thành công!");
      }
      handleResetForm();
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "schedule-error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await schedulesAPI.delete(id);
      fetchData();
      toast.success("Đã hủy lịch học!");
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "schedule-error" });
    }
  };

  const filteredCourses = selectedSemesterId
    ? courses.filter((c) => c.semester_id === selectedSemesterId)
    : courses;
  const filteredSchedules = selectedSemesterId
    ? schedules.filter((s) => s.course?.semester_id === selectedSemesterId)
    : schedules;
  const scheduledCourseIds = new Set(schedules.map((s) => s.course_id));
  const schedulableCourses = filteredCourses.filter(
    (course) =>
      !scheduledCourseIds.has(course.course_id) ||
      (repair && course.course_id === formData.course_id),
  );
  const totalPages = Math.ceil(filteredSchedules.length / PAGE_SIZE);
  const paginated = filteredSchedules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const uniqueCourses = new Set(filteredSchedules.map((s) => s.course_id)).size;

  return (
    <div style={S.page}>
      {/* BREADCRUMB */}
      <div style={S.breadcrumb}>
        <span style={S.breadcrumbHome}>Dashboard Overview</span>
        <span style={S.breadcrumbSep}>/</span>
        <span style={S.breadcrumbCurrent}>Điều phối lịch học</span>
      </div>
      <div style={S.filterBar}>
        <label style={S.label}>Kỳ học</label>
        <select
          value={selectedSemesterId}
          onChange={(e) => {
            setSelectedSemesterId(e.target.value);
            setPage(1);
            setFormData(EMPTY_FORM);
            setRepair(false);
          }}
          style={S.input}
        >
          <option value="">Tất cả kỳ học</option>
          {semesters.map((semester) => (
            <option key={semester.semester_id} value={semester.semester_id}>
              {semester.name} {semester.school_year}
              {semester.is_active ? " - Hiện hành" : ""}
            </option>
          ))}
        </select>
      </div>


      {/* STAT CARDS */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <div style={S.statIconBox("#ede9fe")}>
            <IoCalendar size={22} color="#4338ca" />
          </div>
          <div>
            <div style={S.statLabel}>Tổng số lịch</div>
            <div style={S.statValue}>{filteredSchedules.length}</div>
          </div>
        </div>

        <div style={S.statCard}>
          <div style={S.statIconBox("#dcfce7")}>
            <MdMenuBook size={22} color="#16a34a" />
          </div>
          <div>
            <div style={S.statLabel}>Khóa học</div>
            <div style={{ ...S.statValue, color: "#15803d" }}>
              {uniqueCourses}
            </div>
          </div>
        </div>

        <div style={S.bannerCard}>
          <div>
            <div style={S.bannerTitle}>Hệ thống Điều phối Tự động</div>
            <div style={S.bannerSub}>
              Tối ưu hóa tài nguyên phòng học và thời gian giảng dạy chỉ với một
              click.
            </div>
          </div>
          <MdOutlineCalendarMonth
            size={52}
            color="rgba(255,255,255,0.2)"
            style={{ flexShrink: 0 }}
          />
        </div>
      </div>

      {/* FORM CARD */}
      <div style={S.formCard}>
        <div style={S.formCardHeader}>
          <div style={S.formCardTitle}>
            <div style={S.formIconBox}>
              {repair ? (
                <MdEdit size={17} color="#4338ca" />
              ) : (
                <IoCalendar size={17} color="#4338ca" />
              )}
            </div>
            <span>{repair ? "Cập nhật lịch học" : "Sắp xếp lịch mới"}</span>
          </div>
          {repair && (
            <button onClick={handleResetForm} style={S.resetBtn}>
              <FiRefreshCw size={13} /> Thêm mới
            </button>
          )}
        </div>
        <div style={S.formDivider} />
        <form onSubmit={handleSubmit}>
          <div style={S.formGrid}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Khóa học</label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleInputChange}
                style={S.input}
                required
              >
                <option value="">Chọn khóa học...</option>
                {schedulableCourses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {`${c.course_code || c.course_id} - ${c.subject_id} - ${c.teacher_id}`}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Phòng học</label>
              <select
                name="classroom_id"
                value={formData.classroom_id}
                onChange={handleInputChange}
                style={S.input}
                required
              >
                <option value="">Chọn phòng...</option>
                {rooms.map((r) => (
                  <option key={r.classroom_id} value={r.classroom_id}>
                    {r.classroom_id}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Thứ học</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleInputChange}
                style={S.input}
                required
              >
                <option value="">Chọn thứ...</option>
                {Object.entries(DAY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Tiết bắt đầu</label>
              <select
                name="start_slot"
                value={formData.start_slot}
                onChange={handleInputChange}
                style={S.input}
                required
              >
                <option value="">--</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tiết {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Tiết kết thúc</label>
              <select
                name="end_slot"
                value={formData.end_slot}
                onChange={handleInputChange}
                style={S.input}
                required
              >
                <option value="">--</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tiết {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Ngày bắt đầu</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                style={S.input}
                required
              />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Ngày kết thúc</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                style={S.input}
                required
              />
            </div>
          </div>
          <div style={S.formActions}>
            <button
              type="submit"
              style={{
                ...S.submitBtn,
                background: repair ? "#4f46e5" : "#16a34a",
              }}
            >
              <IoSaveOutline size={15} />
              {repair ? "Xác nhận cập nhật" : "Lưu lịch học"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE CARD */}
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <div style={S.tableCardTitle}>
            <div style={S.formIconBox}>
              <MdOutlineCalendarMonth size={17} color="#4f46e5" />
            </div>
            <span>Danh sách lịch học hiện tại</span>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr style={S.theadRow}>
                <th style={S.th}>MÃ LỊCH HỌC</th>
                <th style={S.th}>MÃ CODE</th>
                <th style={S.th}>PHÒNG</th>
                <th style={S.th}>THỨ HỌC</th>
                <th style={S.th}>TIẾT BẮT ĐẦU</th>
                <th style={S.th}>TIẾT KẾT THÚC</th>
                <th style={S.th}>NGÀY BẮT ĐẦU</th>
                <th style={S.th}>NGÀY KẾT THÚC</th>
                <th style={S.th}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s.schedule_id} style={S.tbodyRow}>
                  <td style={{ ...S.td, color: "#4f46e5", fontWeight: 700 }}>
                    {s.schedule_id} {/* ← Hiển thị đầy đủ */}
                  </td>
                  <td style={{ ...S.td, fontWeight: 600 }}>
                    {s.course?.course_code || s.course_id}
                  </td>
                  <td style={S.td}>
                    <span style={S.roomBadge}>{s.classroom_id}</span>
                  </td>
                  <td style={S.td}>{DAY_LABEL[s.dayOfWeek] || s.dayOfWeek}</td>
                  <td style={{ ...S.td, textAlign: "center" }}>
                    {s.start_slot}
                  </td>
                  <td style={{ ...S.td, textAlign: "center" }}>{s.end_slot}</td>
                  <td style={S.td}>
                    {s.start_date
                      ? new Date(s.start_date).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={S.td}>
                    {s.end_date
                      ? new Date(s.end_date).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={S.td}>
                    <div style={S.actionGroup}>
                      <button
                        style={S.editBtn}
                        onClick={() => handleOpenUpdate(s)}
                      >
                        <MdEdit size={15} />
                      </button>
                      <button
                        style={S.deleteBtn}
                        onClick={() => handleDelete(s.schedule_id)}
                      >
                        <MdDelete size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={S.paginationRow}>
          <span style={S.pageInfo}>
            Hiển thị {(page - 1) * PAGE_SIZE + 1} –{" "}
            {Math.min(page * PAGE_SIZE, filteredSchedules.length)} của{" "}
            {filteredSchedules.length} lịch học
          </span>
          <div style={S.pageControls}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ ...S.pageBtn, ...(page === 1 ? S.pageBtnDisabled : {}) }}
            >
              ‹
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    ...S.pageBtn,
                    ...(page === p ? S.pageBtnActive : {}),
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              style={{
                ...S.pageBtn,
                ...(page === totalPages || totalPages === 0
                  ? S.pageBtnDisabled
                  : {}),
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    padding: "24px 32px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "18px",
    fontSize: "13px",
  },
  breadcrumbHome: { color: "#94a3b8", cursor: "pointer" },
  breadcrumbSep: { color: "#cbd5e1" },
  breadcrumbCurrent: { color: "#4f46e5", fontWeight: 700 },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "120px minmax(220px, 360px)",
    alignItems: "center",
    gap: "12px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px 18px",
    marginBottom: "18px",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 2fr",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  statIconBox: (bg) => ({
    width: 46,
    height: 46,
    borderRadius: "10px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  statLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
  },

  bannerCard: {
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    borderRadius: "12px",
    padding: "22px 26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    color: "white",
    boxShadow: "0 4px 14px rgba(79,70,229,0.25)",
  },
  bannerTitle: { fontSize: "16px", fontWeight: 700, marginBottom: "6px" },
  bannerSub: { fontSize: "13px", opacity: 0.85, lineHeight: 1.5 },

  formCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "20px 24px 24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  formCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  formCardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#1e293b",
  },
  formIconBox: {
    width: 32,
    height: 32,
    borderRadius: "8px",
    background: "#e0e7ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formDivider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "14px 0 18px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
  },
  fieldGroup: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "6px",
  },
  input: {
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  formActions: { marginTop: "18px" },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 24px",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
  },
  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },

  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  tableHeader: {
    padding: "16px 22px 14px",
    borderBottom: "1px solid #f1f5f9",
  },
  tableCardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#1e293b",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { background: "#f8fafc" },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontSize: "11.5px",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  tbodyRow: { borderBottom: "1px solid #f1f5f9" },
  td: {
    padding: "14px 14px",
    fontSize: "14px",
    color: "#334155",
    verticalAlign: "middle",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  roomBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "6px",
    background: "#e0e7ff",
    color: "#4f46e5",
    fontSize: "12.5px",
    fontWeight: 700,
  },
  actionGroup: { display: "flex", alignItems: "center", gap: "6px" },
  editBtn: {
    width: "32px",
    height: "32px",
    background: "#e0e7ff",
    color: "#4f46e5",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: "32px",
    height: "32px",
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 22px",
    borderTop: "1px solid #f1f5f9",
  },
  pageInfo: { fontSize: "13px", color: "#64748b" },
  pageControls: { display: "flex", gap: "4px" },
  pageBtn: {
    minWidth: "32px",
    height: "32px",
    padding: "0 10px",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  pageBtnActive: {
    background: "#4f46e5",
    color: "#fff",
    border: "1px solid #4f46e5",
  },
  pageBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },

  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#94a3b8",
    paddingBottom: "20px",
  },
};

export default MinistrySchedule;
