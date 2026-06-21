import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  coursesAPI,
  roomsAPI,
  schedulesAPI,
  semestersAPI,
  teachersAPI,
} from "../services/api";
import toast from "react-hot-toast";
import { IoCalendar, IoSaveOutline } from "react-icons/io5";
import {
  MdClose,
  MdDelete,
  MdEdit,
  MdMenuBook,
  MdOutlineCalendarMonth,
} from "react-icons/md";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import "../styles/MinistrySchedule.css";

const PAGE_SIZE = 10;
const SLOT_ROW_HEIGHT = 58;

const DAY_LABEL = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ Nhật",
};

const DAY_ENUMS = ["2", "3", "4", "5", "6", "7", "8"];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SLOT_TIMES = {
  1: "07:00",
  2: "07:50",
  3: "08:40",
  4: "09:30",
  5: "10:20",
  6: "13:00",
  7: "13:50",
  8: "14:40",
  9: "15:30",
  10: "16:20",
};

const PALETTES = [
  { bg: "#eef2ff", border: "#6366f1", text: "#3730a3", dot: "#4f46e5" },
  { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", dot: "#16a34a" },
  { bg: "#fff7ed", border: "#fb923c", text: "#9a3412", dot: "#f97316" },
  { bg: "#fdf4ff", border: "#c084fc", text: "#6b21a8", dot: "#a855f7" },
  { bg: "#f0f9ff", border: "#38bdf8", text: "#0c4a6e", dot: "#0ea5e9" },
  { bg: "#fff1f2", border: "#fb7185", text: "#9f1239", dot: "#e11d48" },
];

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

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";

const formatRange = (start, end) =>
  start || end ? `${formatDate(start)} - ${formatDate(end)}` : "-";

const inputDate = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const pal = (index) => PALETTES[(index || 0) % PALETTES.length];

const MinistrySchedule = () => {
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [repair, setRepair] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [viewMode, setViewMode] = useState("list");
  const [timetableType, setTimetableType] = useState("room");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [
        resSchedules,
        resCourses,
        resRooms,
        resSemesters,
        resTeachers,
      ] = await Promise.all([
        schedulesAPI.getAll(),
        coursesAPI.getAll(),
        roomsAPI.getAll(),
        semestersAPI.getAll(),
        teachersAPI.getAll(),
      ]);

      const semesterData = resSemesters.data || [];
      setSchedules(resSchedules.data || []);
      setCourses(resCourses.data || []);
      setRooms(resRooms.data || []);
      setSemesters(semesterData);
      setTeachers(resTeachers.data || []);

      const courseIdFromState = location.state?.courseId;
      const semesterIdFromState = location.state?.semesterId;
      setSelectedSemesterId((current) =>
        current ||
        semesterIdFromState ||
        semesterData.find((semester) => semester.is_active)?.semester_id ||
        "",
      );

      if (courseIdFromState) {
        setFormData((current) => ({
          ...current,
          course_id: courseIdFromState,
        }));
      }
    } catch {
      toast.error("Không thể tải dữ liệu lịch học");
    }
  }, [location.state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courseById = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => map.set(course.course_id, course));
    return map;
  }, [courses]);

  const decoratedSchedules = useMemo(
    () =>
      schedules.map((schedule) => ({
        ...schedule,
        displayCourse: courseById.get(schedule.course_id) || schedule.course || {},
      })),
    [courseById, schedules],
  );

  const selectedSemester = useMemo(
    () =>
      semesters.find((semester) => semester.semester_id === selectedSemesterId),
    [selectedSemesterId, semesters],
  );

  const filteredCourses = useMemo(
    () =>
      selectedSemesterId
        ? courses.filter((course) => course.semester_id === selectedSemesterId)
        : courses,
    [courses, selectedSemesterId],
  );

  const semesterSchedules = useMemo(
    () =>
      selectedSemesterId
        ? decoratedSchedules.filter(
            (schedule) =>
              schedule.displayCourse?.semester_id === selectedSemesterId ||
              schedule.displayCourse?.semester?.semester_id === selectedSemesterId,
          )
        : decoratedSchedules,
    [decoratedSchedules, selectedSemesterId],
  );

  const filteredSchedules = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return semesterSchedules;

    return semesterSchedules.filter((schedule) => {
      const course = schedule.displayCourse || {};
      return [
        schedule.schedule_id,
        schedule.course_id,
        course.course_code,
        course.subject_id,
        course.subject?.name,
        course.teacher_id,
        course.teacher?.name,
        schedule.classroom_id,
        DAY_LABEL[schedule.dayOfWeek] || schedule.dayOfWeek,
        schedule.start_slot,
        schedule.end_slot,
        formatDate(schedule.start_date),
        formatDate(schedule.end_date),
      ]
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword);
    });
  }, [keyword, semesterSchedules]);

  const scheduledCourseIds = useMemo(
    () => new Set(schedules.map((schedule) => schedule.course_id)),
    [schedules],
  );

  const schedulableCourses = useMemo(
    () =>
      filteredCourses.filter(
        (course) =>
          !scheduledCourseIds.has(course.course_id) ||
          (repair && course.course_id === formData.course_id),
      ),
    [filteredCourses, formData.course_id, repair, scheduledCourseIds],
  );

  const activeRoomIds = useMemo(
    () => new Set(semesterSchedules.map((schedule) => schedule.classroom_id)),
    [semesterSchedules],
  );

  const activeTeacherIds = useMemo(
    () =>
      new Set(
        semesterSchedules
          .map((schedule) => schedule.displayCourse?.teacher_id)
          .filter(Boolean),
      ),
    [semesterSchedules],
  );

  useEffect(() => {
    if (viewMode !== "timetable" || timetableType !== "room") return;
    if (selectedRoomId && rooms.some((room) => room.classroom_id === selectedRoomId)) {
      return;
    }

    const firstScheduledRoom = semesterSchedules.find(
      (schedule) => schedule.classroom_id,
    )?.classroom_id;
    setSelectedRoomId(firstScheduledRoom || rooms[0]?.classroom_id || "");
  }, [rooms, selectedRoomId, semesterSchedules, timetableType, viewMode]);

  useEffect(() => {
    if (viewMode !== "timetable" || timetableType !== "teacher") return;
    if (
      selectedTeacherId &&
      teachers.some((teacher) => teacher.teacher_id === selectedTeacherId)
    ) {
      return;
    }

    const firstScheduledTeacher = semesterSchedules.find(
      (schedule) => schedule.displayCourse?.teacher_id,
    )?.displayCourse?.teacher_id;
    setSelectedTeacherId(firstScheduledTeacher || teachers[0]?.teacher_id || "");
  }, [selectedTeacherId, semesterSchedules, teachers, timetableType, viewMode]);

  const timetableSchedules = useMemo(() => {
    if (timetableType === "room") {
      return selectedRoomId
        ? semesterSchedules.filter(
            (schedule) => schedule.classroom_id === selectedRoomId,
          )
        : [];
    }

    return selectedTeacherId
      ? semesterSchedules.filter(
          (schedule) => schedule.displayCourse?.teacher_id === selectedTeacherId,
        )
      : [];
  }, [semesterSchedules, selectedRoomId, selectedTeacherId, timetableType]);

  const paletteMap = useMemo(() => {
    const map = {};
    let index = 0;
    timetableSchedules.forEach((schedule) => {
      if (!(schedule.course_id in map)) {
        map[schedule.course_id] = index;
        index += 1;
      }
    });
    return map;
  }, [timetableSchedules]);

  const totalPages = Math.ceil(filteredSchedules.length / PAGE_SIZE);
  const paginated = filteredSchedules.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const uniqueCourses = new Set(filteredSchedules.map((schedule) => schedule.course_id))
    .size;

  const getScheduleForSlot = (day, slot) =>
    timetableSchedules.find(
      (schedule) =>
        String(schedule.dayOfWeek) === day &&
        Number(schedule.start_slot) <= slot &&
        Number(schedule.end_slot) >= slot,
    );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSemesterChange = (e) => {
    setSelectedSemesterId(e.target.value);
    setSelectedRoomId("");
    setSelectedTeacherId("");
    setPage(1);
    setFormData(EMPTY_FORM);
    setRepair(false);
  };

  const handleOpenUpdate = (item) => {
    setSelectedSemesterId(
      item.displayCourse?.semester_id ||
        item.course?.semester_id ||
        item.course?.semester?.semester_id ||
        selectedSemesterId,
    );
    setFormData({
      ...item,
      start_date: inputDate(item.start_date),
      end_date: inputDate(item.end_date),
    });
    setRepair(true);
    setSelectedSchedule(null);
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

  const renderScheduleModal = () => {
    if (!selectedSchedule) return null;
    const course = selectedSchedule.displayCourse || {};
    const semester = course.semester || selectedSemester;

    const rows = [
      ["Mã lịch", selectedSchedule.schedule_id],
      ["Học kỳ", semester ? `${semester.name} ${semester.school_year}` : "-"],
      ["Môn học", course.subject?.name || course.subject_id || "-"],
      ["Mã học phần", course.course_code || selectedSchedule.course_id],
      [
        "Giảng viên",
        course.teacher
          ? `${course.teacher.teacher_id} - ${course.teacher.name}`
          : course.teacher_id || "-",
      ],
      ["Phòng", selectedSchedule.classroom_id],
      [
        "Thời gian",
        `${DAY_LABEL[selectedSchedule.dayOfWeek] || selectedSchedule.dayOfWeek}, tiết ${selectedSchedule.start_slot}-${selectedSchedule.end_slot}`,
      ],
      [
        "Ngày học",
        formatRange(selectedSchedule.start_date, selectedSchedule.end_date),
      ],
    ];

    return (
      <div
        className="ministry-schedule__modal-overlay"
        onClick={() => setSelectedSchedule(null)}
      >
        <div
          className="ministry-schedule__modal"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="ministry-schedule__modal-header">
            <div className="ministry-schedule__modal-title">
              <MdOutlineCalendarMonth size={18} />
              Chi tiết lịch học
            </div>
            <button
              className="ministry-schedule__modal-close"
              onClick={() => setSelectedSchedule(null)}
            >
              <MdClose size={18} />
            </button>
          </div>
          <div className="ministry-schedule__modal-body">
            {rows.map(([label, value]) => (
              <div className="ministry-schedule__modal-row" key={label}>
                <span className="ministry-schedule__modal-label">{label}</span>
                <span className="ministry-schedule__modal-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="ministry-schedule__modal-footer">
            <button
              className="ministry-schedule__modal-action"
              onClick={() => handleOpenUpdate(selectedSchedule)}
            >
              <MdEdit size={15} />
              Sửa lịch này
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ministry-schedule">
      <div className="ministry-schedule__breadcrumb">
        <span className="ministry-schedule__breadcrumb-home">
          Dashboard Overview
        </span>
        <span className="ministry-schedule__breadcrumb-sep">/</span>
        <span className="ministry-schedule__breadcrumb-current">
          Điều phối lịch học
        </span>
      </div>

      <div className="ministry-schedule__filter-bar">
        <div className="ministry-schedule__field-group">
          <label className="ministry-schedule__label">Học kỳ</label>
          <select
            value={selectedSemesterId}
            onChange={handleSemesterChange}
            className="ministry-schedule__input"
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
      </div>

      <div className="ministry-schedule__stats-row">
        <div className="ministry-schedule__stat-card">
          <div className="ministry-schedule__stat-icon ministry-schedule__stat-icon--calendar">
            <IoCalendar size={22} />
          </div>
          <div>
            <div className="ministry-schedule__stat-label">Tổng số lịch</div>
            <div className="ministry-schedule__stat-value">
              {filteredSchedules.length}
            </div>
          </div>
        </div>

        <div className="ministry-schedule__stat-card">
          <div className="ministry-schedule__stat-icon ministry-schedule__stat-icon--course">
            <MdMenuBook size={22} />
          </div>
          <div>
            <div className="ministry-schedule__stat-label">Khóa học</div>
            <div className="ministry-schedule__stat-value ministry-schedule__stat-value--green">
              {uniqueCourses}
            </div>
          </div>
        </div>

        <div className="ministry-schedule__banner-card">
          <div>
            <div className="ministry-schedule__banner-title">
              Hệ thống Điều phối Tự động
            </div>
            <div className="ministry-schedule__banner-sub">
              Tối ưu hóa tài nguyên phòng học và thời gian giảng dạy chỉ với
              một click.
            </div>
          </div>
          <MdOutlineCalendarMonth
            className="ministry-schedule__banner-icon"
            size={52}
          />
        </div>
      </div>

      <div className="ministry-schedule__form-card">
        <div className="ministry-schedule__card-header">
          <div className="ministry-schedule__card-title">
            <div className="ministry-schedule__title-icon">
              {repair ? <MdEdit size={17} /> : <IoCalendar size={17} />}
            </div>
            <span>{repair ? "Cập nhật lịch học" : "Sắp xếp lịch mới"}</span>
          </div>
          {repair && (
            <button
              onClick={handleResetForm}
              className="ministry-schedule__reset-btn"
            >
              <FiRefreshCw size={13} /> Thêm mới
            </button>
          )}
        </div>
        <div className="ministry-schedule__divider" />
        <form onSubmit={handleSubmit}>
          <div className="ministry-schedule__form-grid">
            <div className="ministry-schedule__field-group">
              <label className="ministry-schedule__label">Khóa học</label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleInputChange}
                className="ministry-schedule__input"
                required
              >
                <option value="">Chọn khóa học...</option>
                {schedulableCourses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {`${course.course_code || course.course_id} - ${course.subject_id} - ${course.teacher_id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="ministry-schedule__field-group">
              <label className="ministry-schedule__label">Phòng học</label>
              <select
                name="classroom_id"
                value={formData.classroom_id}
                onChange={handleInputChange}
                className="ministry-schedule__input"
                required
              >
                <option value="">Chọn phòng...</option>
                {rooms.map((room) => (
                  <option key={room.classroom_id} value={room.classroom_id}>
                    {room.classroom_id}
                  </option>
                ))}
              </select>
            </div>
            <div className="ministry-schedule__field-group">
              <label className="ministry-schedule__label">Thứ học</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleInputChange}
                className="ministry-schedule__input"
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
            <div className="ministry-schedule__field-group">
              <label className="ministry-schedule__label">Tiết bắt đầu</label>
              <select
                name="start_slot"
                value={formData.start_slot}
                onChange={handleInputChange}
                className="ministry-schedule__input"
                required
              >
                <option value="">--</option>
                {SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    Tiết {slot}
                  </option>
                ))}
              </select>
            </div>
            <div className="ministry-schedule__field-group">
              <label className="ministry-schedule__label">Tiết kết thúc</label>
              <select
                name="end_slot"
                value={formData.end_slot}
                onChange={handleInputChange}
                className="ministry-schedule__input"
                required
              >
                <option value="">--</option>
                {SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    Tiết {slot}
                  </option>
                ))}
              </select>
            </div>
            <div className="ministry-schedule__field-group">
              <label className="ministry-schedule__label">Ngày bắt đầu</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="ministry-schedule__input"
                required
              />
            </div>
            <div className="ministry-schedule__field-group">
              <label className="ministry-schedule__label">Ngày kết thúc</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="ministry-schedule__input"
                required
              />
            </div>
          </div>
          <div className="ministry-schedule__form-actions">
            <button
              type="submit"
              className={`ministry-schedule__submit-btn ${
                repair
                  ? "ministry-schedule__submit-btn--update"
                  : "ministry-schedule__submit-btn--create"
              }`}
            >
              <IoSaveOutline size={15} />
              {repair ? "Xác nhận cập nhật" : "Lưu lịch học"}
            </button>
          </div>
        </form>
      </div>

      <div className="ministry-schedule__view-tabs">
        <button
          className={`ministry-schedule__view-tab ${
            viewMode === "list" ? "ministry-schedule__view-tab--active" : ""
          }`}
          onClick={() => setViewMode("list")}
        >
          Danh sách
        </button>
        <button
          className={`ministry-schedule__view-tab ${
            viewMode === "timetable"
              ? "ministry-schedule__view-tab--active"
              : ""
          }`}
          onClick={() => setViewMode("timetable")}
        >
          Bảng TKB
        </button>
      </div>

      {viewMode === "timetable" && (
        <div className="ministry-schedule__timetable-card">
          <div className="ministry-schedule__timetable-toolbar">
            <div className="ministry-schedule__card-title">
              <div className="ministry-schedule__title-icon">
                <MdOutlineCalendarMonth size={17} />
              </div>
              <span>Bảng thời khóa biểu trực quan</span>
            </div>
            <div className="ministry-schedule__timetable-filters">
              <div className="ministry-schedule__segmented">
                <button
                  className={`ministry-schedule__segment-btn ${
                    timetableType === "room"
                      ? "ministry-schedule__segment-btn--active"
                      : ""
                  }`}
                  onClick={() => {
                    setTimetableType("room");
                    setSelectedTeacherId("");
                  }}
                >
                  Theo phòng
                </button>
                <button
                  className={`ministry-schedule__segment-btn ${
                    timetableType === "teacher"
                      ? "ministry-schedule__segment-btn--active"
                      : ""
                  }`}
                  onClick={() => {
                    setTimetableType("teacher");
                    setSelectedRoomId("");
                  }}
                >
                  Theo giảng viên
                </button>
              </div>

              {timetableType === "room" ? (
                <select
                  className="ministry-schedule__input ministry-schedule__toolbar-select"
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                >
                  <option value="">Chọn phòng học</option>
                  {rooms.map((room) => (
                    <option key={room.classroom_id} value={room.classroom_id}>
                      {room.classroom_id}
                      {activeRoomIds.has(room.classroom_id) ? "" : " - chưa có lịch"}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="ministry-schedule__input ministry-schedule__toolbar-select"
                  value={selectedTeacherId}
                  onChange={(event) => setSelectedTeacherId(event.target.value)}
                >
                  <option value="">Chọn giảng viên</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.teacher_id} value={teacher.teacher_id}>
                      {teacher.teacher_id} - {teacher.name}
                      {activeTeacherIds.has(teacher.teacher_id)
                        ? ""
                        : " - chưa có lịch"}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="ministry-schedule__timetable-summary">
            <span>
              {selectedSemester
                ? `${selectedSemester.name} ${selectedSemester.school_year}`
                : "Tất cả kỳ học"}
            </span>
            <span>{timetableSchedules.length} lịch học</span>
            <span>
              {timetableType === "room"
                ? `Phòng: ${selectedRoomId || "chưa chọn"}`
                : `Giảng viên: ${selectedTeacherId || "chưa chọn"}`}
            </span>
          </div>

          <div className="ministry-schedule__timetable-scroll">
            <table className="ministry-schedule__timetable">
              <thead>
                <tr>
                  <th className="ministry-schedule__slot-head">Tiết</th>
                  {DAY_ENUMS.map((day) => (
                    <th key={day}>{DAY_LABEL[day]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((slot) => (
                  <tr key={slot}>
                    <td className="ministry-schedule__slot-cell">
                      <span>Tiết {slot}</span>
                      <small>{SLOT_TIMES[slot]}</small>
                    </td>
                    {DAY_ENUMS.map((day) => {
                      const schedule = getScheduleForSlot(day, slot);
                      if (schedule && Number(schedule.start_slot) !== slot) {
                        return (
                          <td
                            key={day}
                            className="ministry-schedule__timetable-empty"
                          />
                        );
                      }

                      if (!schedule) {
                        return (
                          <td
                            key={day}
                            className="ministry-schedule__timetable-empty"
                          />
                        );
                      }

                      const course = schedule.displayCourse || {};
                      const span =
                        Number(schedule.end_slot) - Number(schedule.start_slot) + 1;
                      const color = pal(paletteMap[schedule.course_id]);
                      const secondary =
                        timetableType === "room"
                          ? course.teacher?.name || course.teacher_id || "-"
                          : schedule.classroom_id;

                      return (
                        <td
                          key={day}
                          className="ministry-schedule__timetable-class-cell"
                          onClick={() => setSelectedSchedule(schedule)}
                        >
                          <div
                            className="ministry-schedule__schedule-block"
                            style={{
                              background: color.bg,
                              borderLeftColor: color.border,
                              color: color.text,
                              height: span * SLOT_ROW_HEIGHT - 8,
                            }}
                          >
                            <span
                              className="ministry-schedule__schedule-dot"
                              style={{ background: color.dot }}
                            />
                            <strong>
                              {course.course_code || schedule.course_id}
                            </strong>
                            <span>{course.subject?.name || course.subject_id}</span>
                            <small>
                              {timetableType === "room" ? "GV" : "Phòng"}:{" "}
                              {secondary}
                            </small>
                            <small>
                              Tiết {schedule.start_slot}-{schedule.end_slot}
                            </small>
                            <small>
                              {formatRange(schedule.start_date, schedule.end_date)}
                            </small>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {timetableSchedules.length === 0 && (
            <div className="ministry-schedule__empty-state">
              Chưa có lịch học phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      )}

      {viewMode === "list" && (
        <div className="ministry-schedule__table-card">
          <div className="ministry-schedule__table-header">
            <div className="ministry-schedule__card-title">
              <div className="ministry-schedule__title-icon">
                <MdOutlineCalendarMonth size={17} />
              </div>
              <span>Danh sách lịch học hiện tại</span>
            </div>
            <div className="ministry-schedule__search-wrap">
              <FiSearch size={15} />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm mã lịch, khóa học, phòng, giảng viên..."
                className="ministry-schedule__search-input"
              />
            </div>
          </div>
          <div className="ministry-schedule__table-scroll">
            <table className="ministry-schedule__table">
              <thead>
                <tr>
                  <th>Mã lịch học</th>
                  <th>Mã code</th>
                  <th>Phòng</th>
                  <th>Thứ học</th>
                  <th>Tiết bắt đầu</th>
                  <th>Tiết kết thúc</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td className="ministry-schedule__empty-cell" colSpan={9}>
                      Chưa có lịch học phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginated.map((schedule) => {
                    const course = schedule.displayCourse || {};
                    return (
                      <tr key={schedule.schedule_id}>
                        <td className="ministry-schedule__id-cell">
                          {schedule.schedule_id}
                        </td>
                        <td className="ministry-schedule__strong-cell">
                          {course.course_code || schedule.course_id}
                        </td>
                        <td>
                          <span className="ministry-schedule__room-badge">
                            {schedule.classroom_id}
                          </span>
                        </td>
                        <td>{DAY_LABEL[schedule.dayOfWeek] || schedule.dayOfWeek}</td>
                        <td className="ministry-schedule__center-cell">
                          {schedule.start_slot}
                        </td>
                        <td className="ministry-schedule__center-cell">
                          {schedule.end_slot}
                        </td>
                        <td>{formatDate(schedule.start_date)}</td>
                        <td>{formatDate(schedule.end_date)}</td>
                        <td>
                          <div className="ministry-schedule__action-group">
                            <button
                              className="ministry-schedule__icon-btn ministry-schedule__icon-btn--edit"
                              onClick={() => handleOpenUpdate(schedule)}
                            >
                              <MdEdit size={15} />
                            </button>
                            <button
                              className="ministry-schedule__icon-btn ministry-schedule__icon-btn--delete"
                              onClick={() => handleDelete(schedule.schedule_id)}
                            >
                              <MdDelete size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="ministry-schedule__pagination-row">
            <span className="ministry-schedule__page-info">
              Hiển thị{" "}
              {filteredSchedules.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(page * PAGE_SIZE, filteredSchedules.length)} của{" "}
              {filteredSchedules.length} lịch học
            </span>
            <div className="ministry-schedule__page-controls">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="ministry-schedule__page-btn"
              >
                ‹
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`ministry-schedule__page-btn ${
                      page === pageNumber
                        ? "ministry-schedule__page-btn--active"
                        : ""
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages || totalPages === 0}
                className="ministry-schedule__page-btn"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {renderScheduleModal()}
    </div>
  );
};

export default MinistrySchedule;
