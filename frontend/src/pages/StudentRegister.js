import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { coursesAPI, enrollmentsAPI, semestersAPI } from "../services/api";

// ─── helpers ───────────────────────────────────────────────────────────────
import "../styles/StudentRegister.css";
const formatDateOnly = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("T")[0].split("-");
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}`;
};
const formatSchedules = (schedules) => {
  if (!Array.isArray(schedules) || schedules.length === 0) return "N/A";
  return schedules
    .map(
      (s) =>
        `${String(s.dayOfWeek) === "8" ? "Chủ nhật" : `Thứ ${s.dayOfWeek}`} (Tiết ${s.start_slot}-${s.end_slot}) [${formatDateOnly(s.start_date)} - ${formatDateOnly(s.end_date)}]`,
    )
    .join(", ");
};
const getRegistrationErrorMessage = (err) => {
  const message = err?.response?.data?.message || err?.message || "";
  if (message.includes("has not yet been scheduled")) {
    return "Không thể đăng ký vì học phần này chưa được xếp lịch.";
  }
  if (
    message.includes("not available for this student major or department") ||
    message.includes("not available for this student department")
  ) {
    return "Không thể đăng ký vì môn học này không phù hợp với chuyên ngành hoặc khoa của bạn.";
  }
  if (message.includes("not in the active semester")) {
    return "Không thể đăng ký vì học phần này không thuộc học kỳ hiện tại.";
  }
  if (message.includes("Registration is closed for this semester")) {
    return "Hiện kỳ học này đã đóng đăng ký.";
  }
  if (message.includes("Conflict with course")) {
    return "Không thể đăng ký vì lịch học của học phần này bị trùng với học phần bạn đã đăng ký.";
  }
  if (message.includes("fully booked")) {
    return "Không thể đăng ký vì lớp học phần đã đủ số lượng sinh viên.";
  }
  if (message.includes("already been registered")) {
    return "Bạn đã đăng ký học phần này trước đó.";
  }
  if (message.includes("subject has been")) {
    return "Bạn đã đăng ký một lớp học phần khác của cùng môn học này.";
  }
  if (message.includes("Over max 18 credit")) {
    return "Không thể đăng ký vì tổng số tín chỉ vượt quá giới hạn 18 tín chỉ.";
  }
  if (message.includes("Student with ID")) {
    return "Không tìm thấy thông tin sinh viên.";
  }
  if (message.includes("Course with ID")) {
    return "Không tìm thấy thông tin lớp học phần.";
  }
  if (message.includes("only access your own enrollment")) {
    return "Bạn chỉ được phép đăng ký học phần cho chính tài khoản sinh viên của mình.";
  }
  return "Đăng ký học phần không thành công. Vui lòng kiểm tra lại các điều kiện đăng ký.";
};

// ─── styles ─────────────────────────────────────────────────────────────────
const S = {
  heroBg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.05) 0%, transparent 40%)",
    pointerEvents: "none",
  },
  capacityFull: {
    fontWeight: 700,
    color: "#ef4444",
  },
  capacityOk: {
    fontWeight: 700,
    color: "#22c55e",
  },
  btnRegister: {
    background: "linear-gradient(135deg,#3a4db7,#6c3fc5)",
    color: "#fff",
    border: "none",
    padding: "7px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    boxShadow: "0 2px 8px rgba(58,77,183,0.25)",
  },
  btnLoading: {
    background: "linear-gradient(135deg,#3a4db7,#6c3fc5)",
    color: "#fff",
    border: "none",
    padding: "7px 16px",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 600,
    fontSize: 13,
    opacity: 0.6,
  },
  pageBtn: (active) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    border: active ? "none" : "1px solid #e0e4ef",
    background: active ? "linear-gradient(135deg,#3a4db7,#6c3fc5)" : "#fff",
    color: active ? "#fff" : "#334",
    cursor: "pointer",
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    margin: "0 2px",
  }),
};
const PAGE_SIZE = 10;

// ─── main component ──────────────────────────────────────────────────────────
const StudentRegister = ({
  registeredIds = [],
  setRegisteredIds,
  studentInfo,
}) => {
  const [keyword, setKeyword] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [page, setPage] = useState(1);
  const isRegistrationOpen = Boolean(
    activeSemester?.is_active && activeSemester?.is_register,
  );

  // filter + pagination
  const filteredCourses = useMemo(() => {
    const kw = keyword.toLowerCase();
    return courses.filter((c) => {
      const matchKw =
        !kw ||
        (c.course_code || "").toLowerCase().includes(kw) ||
        (c.subject?.subject_id || "").toLowerCase().includes(kw) ||
        (c.subject?.name || "").toLowerCase().includes(kw);
      return matchKw;
    });
  }, [courses, keyword]);
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const pagedCourses = filteredCourses.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  // fetch courses
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [semesterRes, courseRes] = await Promise.all([
          semestersAPI.getActive(),
          coursesAPI.getInfoCourse(),
        ]);
        setActiveSemester(semesterRes.data || null);
        const res = courseRes;
        setCourses(res.data);
        setError(null);
      } catch {
        setError("Không thể tải danh sách môn học");
        toast.error("Lỗi: Không thể tải danh sách môn học");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const refreshCourses = async () => {
    try {
      const res = await coursesAPI.getInfoCourse();
      const refreshedCourses = Array.isArray(res.data) ? res.data : [];
      setCourses((prevCourses) => {
        const refreshedById = new Map(
          refreshedCourses.map((course) => [course.course_id, course]),
        );
        const prevIds = new Set(prevCourses.map((course) => course.course_id));
        const updatedCourses = prevCourses.map(
          (course) => refreshedById.get(course.course_id) || course,
        );
        const newCourses = refreshedCourses.filter(
          (course) => !prevIds.has(course.course_id),
        );

        return [...updatedCourses, ...newCourses];
      });
    } catch {}
  };

  // fetch enrollments
  useEffect(() => {
    if (!studentInfo?.student_id) return;
    (async () => {
      try {
        const res = await enrollmentsAPI.getByStudentId(studentInfo.student_id);
        if (Array.isArray(res.data))
          setRegisteredIds(res.data.map((e) => e.course_id));
      } catch {}
    })();
  }, [studentInfo, setRegisteredIds]);
  const registerCourse = async (course) => {
    if (!activeSemester)
      return toast.error("Hiện chưa có kỳ học hiện hành để đăng ký.");
    if (!isRegistrationOpen)
      return toast.error("Hiện kỳ học này đã đóng đăng ký.");
    if (!studentInfo?.student_id)
      return toast.error("Không thể lấy thông tin sinh viên.");
    try {
      setEnrollingCourseId(course.course_id);
      await enrollmentsAPI.create({
        student_id: studentInfo.student_id,
        course_id: course.course_id,
      });
      setRegisteredIds((prev) =>
        prev.includes(course.course_id) ? prev : [...prev, course.course_id],
      );
      toast.success(`Đã đăng ký ${course.subject?.name || "môn học"}`);
      await refreshCourses();
    } catch (err) {
      toast.error(getRegistrationErrorMessage(err));
    } finally {
      setEnrollingCourseId(null);
    }
  };
  const cancelCourse = async (course) => {
    if (!activeSemester)
      return toast.error("Hiện chưa có kỳ học hiện hành để hủy đăng ký.");
    if (!isRegistrationOpen)
      return toast.error("Hiện kỳ học này đã đóng đăng ký.");

    try {
      await enrollmentsAPI.delete({
        student_id: studentInfo.student_id,
        course_id: course.course_id,
      });
      setRegisteredIds((prev) => prev.filter((id) => id !== course.course_id));
      toast.success(`Đã hủy ${course.subject?.name || "môn học"}`);
      await refreshCourses();
    } catch (err) {
      toast.error(getRegistrationErrorMessage(err));
    }
  };

  // stats
  const totalCredits = registeredIds.reduce((sum, id) => {
    const c = courses.find((c) => c.course_id === id);
    return sum + (c?.subject?.credits || 0);
  }, 0);
  const maxCredits = 18;
  const creditPct = Math.min(
    100,
    Math.round((totalCredits / maxCredits) * 100),
  );
  return (
    <div className="student-register__page">
      {/* ── hero banner ── */}
      <div className="student-register__hero">
        <div style={S.heroBg} />
        <div className="student-register__hero-title">
          {activeSemester
            ? `Kỳ đăng ký ${activeSemester.name} ${activeSemester.school_year}`
            : "Chưa có kỳ học hiện hành"}
        </div>
        <div className="student-register__inline-531">
          <span className="student-register__hero-badge">
            <span className="student-register__hero-dot" />
            Trạng thái đăng ký: {isRegistrationOpen ? "Đang mở" : "Đã đóng"}
          </span>
        </div>
      </div>

      {/* ── stats ── */}
      <div className="student-register__stats-row">
        <div className="student-register__stat-card">
          <div className="student-register__stat-label">Tín chỉ đã chọn</div>
          <div className="student-register__stat-value">
            {String(totalCredits).padStart(2, "0")}{" "}
            <span className="student-register__inline-552">/ {maxCredits}</span>
          </div>
          <div className="student-register__progress-bar">
            <div
              style={{
                width: `${creditPct}%`,
              }}
              className="student-register__progress-fill"
            />
          </div>
        </div>
        <div className="student-register__stat-card">
          <div className="student-register__stat-label">Môn học đã đăng ký</div>
          <div className="student-register__stat-value">
            {String(registeredIds.length).padStart(2, "0")}
          </div>
          <div className="student-register__stat-sub">môn</div>
        </div>
      </div>

      {/* ── loading / error ── */}
      {loading && (
        <div className="student-register__inline-571">
          ⏳ Đang tải danh sách môn học...
        </div>
      )}
      {error && <div className="student-register__inline-585">❌ {error}</div>}

      {/* ── table ── */}
      {!loading && !error && (
        <div className="student-register__table-card">
          {/* toolbar */}
          <div className="student-register__table-toolbar">
            <div className="student-register__table-search-wrap">
              <span className="student-register__inline-604">🔍</span>
              <input
                placeholder="Tìm kiếm theo mã hoặc tên môn"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="student-register__table-search-input"
              />
            </div>
          </div>

          {/* table */}
          {filteredCourses.length === 0 ? (
            <div className="student-register__inline-616">
              {keyword
                ? `🔍 Không tìm thấy môn học với từ khóa "${keyword}"`
                : activeSemester
                  ? "Không có môn học trong kỳ hiện hành"
                  : "Chưa có kỳ học hiện hành để đăng ký"}
            </div>
          ) : (
            <table className="student-register__table">
              <thead>
                <tr>
                  {[
                    "STT",
                    "Mã môn",
                    "Tên môn học",
                    "TC",
                    "Thời gian",
                    "Còn lại",
                    "Thao tác",
                  ].map((h) => (
                    <th key={h} className="student-register__th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedCourses.map((course, i) => {
                  const isRegistered = registeredIds.includes(course.course_id);
                  const rem = course.remaining_capacity ?? 0;
                  const cap = course.capacity ?? rem;
                  const isFull = rem <= 0;
                  const isEnrolling = enrollingCourseId === course.course_id;
                  return (
                    <tr
                      key={course.course_id}
                      style={{
                        background: isRegistered ? "#fafbff" : "transparent",
                      }}
                    >
                      <td className="student-register__td">
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </td>
                      <td className="student-register__td">
                        <span
                          style={{
                            opacity: isFull && !isRegistered ? 0.45 : 1,
                          }}
                          className="student-register__course-code"
                        >
                          {course.course_code || course.subject?.subject_id}
                        </span>
                      </td>
                      <td className="student-register__td">
                        <div
                          style={{
                            opacity: isFull && !isRegistered ? 0.45 : 1,
                          }}
                          className="student-register__course-name"
                        >
                          {course.subject?.name}
                        </div>
                        <div className="student-register__teacher-name">
                          Giảng viên: {course.teacher?.name || "—"}
                        </div>
                      </td>
                      <td className="student-register__td">
                        {course.subject?.credits}
                      </td>
                      <td className="student-register__td student-register__inline-687">
                        {formatSchedules(course.schedule)}
                      </td>
                      <td className="student-register__td">
                        <span style={isFull ? S.capacityFull : S.capacityOk}>
                          {rem} / {cap}
                        </span>
                      </td>
                      <td className="student-register__td">
                        {isRegistered && isRegistrationOpen ? (
                          <button
                            onClick={() => cancelCourse(course)}
                            className="student-register__btn-cancel"
                          >
                            Hủy
                          </button>
                        ) : isRegistered ? (
                          <button
                            disabled
                            className="student-register__btn-full"
                          >
                            Đã đóng
                          </button>
                        ) : !isRegistrationOpen ? (
                          <button
                            disabled
                            className="student-register__btn-full"
                          >
                            Đã đóng
                          </button>
                        ) : isFull ? (
                          <button
                            disabled
                            className="student-register__btn-full"
                          >
                            Hết chỗ
                          </button>
                        ) : (
                          <button
                            style={isEnrolling ? S.btnLoading : S.btnRegister}
                            disabled={isEnrolling}
                            onClick={() => registerCourse(course)}
                          >
                            {isEnrolling ? "Đang xử lý..." : "Đăng ký"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* pagination */}
          <div className="student-register__pagination">
            <span>
              Hiển thị {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredCourses.length)} trên{" "}
              {filteredCourses.length} môn học
            </span>
            <div className="student-register__inline-742">
              <button
                style={{
                  ...S.pageBtn(false),
                }}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="student-register__inline-743"
              >
                ‹
              </button>
              {Array.from(
                {
                  length: Math.min(5, totalPages),
                },
                (_, k) => {
                  const p = k + 1;
                  return (
                    <button
                      key={p}
                      style={S.pageBtn(p === page)}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                },
              )}
              <button
                style={{
                  ...S.pageBtn(false),
                }}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="student-register__inline-762"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentRegister;
