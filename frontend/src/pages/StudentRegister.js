import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { coursesAPI, enrollmentsAPI, semestersAPI } from "../services/api";
import ChatBox from "../components/ChatBox";

// ─── helpers ───────────────────────────────────────────────────────────────
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

  if (message.includes("not in the active semester")) {
    return "Không thể đăng ký vì học phần này không thuộc học kỳ hiện tại.";
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
  // layout
  page: {
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    background: "#f0f2f7",
    minHeight: "100vh",
    padding: "0",
  },
  // top search bar (replaces bells/cogs)
  topBar: {
    background: "#fff",
    borderBottom: "1px solid #e8ecf4",
    padding: "0 28px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: {
    fontWeight: 700,
    fontSize: 16,
    color: "#3a4db7",
    letterSpacing: "-0.3px",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "#f0f2f7",
    borderRadius: 20,
    padding: "6px 14px",
    gap: 8,
    width: 280,
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 13,
    color: "#333",
    width: "100%",
  },
  // hero banner
  hero: {
    background:
      "linear-gradient(135deg, #3a4db7 0%, #6c3fc5 60%, #8b2fc9 100%)",
    borderRadius: "0 0 24px 24px",
    padding: "32px 28px 28px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    marginBottom: 24,
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.05) 0%, transparent 40%)",
    pointerEvents: "none",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 8,
    letterSpacing: "-0.5px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(6px)",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    marginRight: 12,
    marginBottom: 0,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 6px #4ade80",
    display: "inline-block",
  },
  heroTimer: { fontSize: 13, opacity: 0.85, marginTop: 10 },
  // stats row
  statsRow: {
    display: "flex",
    gap: 16,
    padding: "0 28px",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "18px 22px",
    flex: "1 1 140px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  statLabel: {
    fontSize: 11,
    color: "#8892a4",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1e2a5e",
    marginTop: 2,
    letterSpacing: "-1px",
  },
  statSub: { fontSize: 12, color: "#8892a4", marginTop: 2 },
  progressBar: {
    height: 4,
    borderRadius: 4,
    background: "#e8ecf4",
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    background: "linear-gradient(90deg,#3a4db7,#6c3fc5)",
    transition: "width .4s",
  },
  // main table card
  tableCard: {
    background: "#fff",
    borderRadius: 16,
    margin: "0 28px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  tableToolbar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 20px",
    borderBottom: "1px solid #f0f2f7",
    flexWrap: "wrap",
  },
  tableSearchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "min(420px, 100%)",
    background: "#f7f8fc",
    border: "1px solid #e0e4ef",
    borderRadius: 10,
    padding: "9px 12px",
  },
  tableSearchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: 13,
    color: "#1e2a5e",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 14px",
    color: "#8892a4",
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    textAlign: "left",
    background: "#fafbfd",
    borderBottom: "1px solid #f0f2f7",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #f5f6fb",
    verticalAlign: "top",
  },
  courseCode: { fontWeight: 700, color: "#3a4db7", fontSize: 13 },
  courseName: { fontWeight: 700, color: "#1e2a5e", fontSize: 14 },
  teacherName: { color: "#8892a4", fontSize: 12, marginTop: 2 },
  capacityFull: { fontWeight: 700, color: "#ef4444" },
  capacityOk: { fontWeight: 700, color: "#22c55e" },
  // buttons
  btnCancel: {
    background: "#fff4ed",
    color: "#ea580c",
    border: "1px solid #fed7aa",
    padding: "7px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
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
  btnFull: {
    background: "#f5f6fb",
    color: "#aaa",
    border: "1px solid #e0e4ef",
    padding: "7px 16px",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 600,
    fontSize: 13,
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
  // pagination
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderTop: "1px solid #f0f2f7",
    fontSize: 13,
    color: "#8892a4",
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
  // bottom panels
  bottomRow: {
    display: "flex",
    gap: 16,
    margin: "0 28px 28px",
    flexWrap: "wrap",
  },
  suggestCard: {
    flex: "1 1 260px",
    background: "#fff",
    borderRadius: 16,
    padding: "22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  suggestTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: "#1e2a5e",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  suggestDesc: { color: "#8892a4", fontSize: 13, marginBottom: 16 },
  suggestChip: {
    background: "#f0f2f7",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "border .15s",
  },
  suggestChipTitle: { fontWeight: 700, color: "#1e2a5e", fontSize: 13 },
  suggestChipSub: { color: "#8892a4", fontSize: 12, marginTop: 2 },
  supportCard: {
    flex: "0 0 220px",
    background: "linear-gradient(135deg,#3a4db7,#6c3fc5)",
    borderRadius: 16,
    padding: "22px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  supportTitle: { fontWeight: 700, fontSize: 15 },
  supportDesc: { fontSize: 13, opacity: 0.85 },
  supportBtn: {
    marginTop: "auto",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#fff",
    borderRadius: 10,
    padding: "9px 14px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    textAlign: "center",
  },
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

  const isRegistrationOpen = Boolean(activeSemester);

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
      setCourses(res.data);
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
    if (!isRegistrationOpen)
      return toast.error("Hiện chưa có kỳ học hiện hành để đăng ký.");
    if (!studentInfo?.student_id)
      return toast.error("Không thể lấy thông tin sinh viên.");
    try {
      setEnrollingCourseId(course.course_id);
      await enrollmentsAPI.create({
        student_id: studentInfo.student_id,
        course_id: course.course_id,
      });
      setRegisteredIds([...registeredIds, course.course_id]);
      toast.success(`Đã đăng ký ${course.subject?.name || "môn học"}`);
      await refreshCourses();
    } catch (err) {
      toast.error(getRegistrationErrorMessage(err));
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const cancelCourse = async (course) => {
    try {
      await enrollmentsAPI.delete({
        student_id: studentInfo.student_id,
        course_id: course.course_id,
      });
      setRegisteredIds(registeredIds.filter((id) => id !== course.course_id));
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
    <div style={S.page}>
      {/* ── hero banner ── */}
      <div style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroTitle}>
          {activeSemester
            ? `Kỳ đăng ký ${activeSemester.name} ${activeSemester.school_year}`
            : "Chưa mở kỳ đăng ký"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={S.heroBadge}>
            <span style={S.heroDot} />
            Trạng thái đăng ký: {isRegistrationOpen ? "Đang mở" : "Đã đóng"}
          </span>
        </div>
      </div>

      {/* ── stats ── */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <div style={S.statLabel}>Tín chỉ đã chọn</div>
          <div style={S.statValue}>
            {String(totalCredits).padStart(2, "0")}{" "}
            <span style={{ fontSize: 16, color: "#8892a4", fontWeight: 400 }}>
              / {maxCredits}
            </span>
          </div>
          <div style={S.progressBar}>
            <div style={{ ...S.progressFill, width: `${creditPct}%` }} />
          </div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Môn học đã đăng ký</div>
          <div style={S.statValue}>
            {String(registeredIds.length).padStart(2, "0")}
          </div>
          <div style={S.statSub}>môn</div>
        </div>
      </div>

      {/* ── loading / error ── */}
      {loading && (
        <div
          style={{
            margin: "0 28px 20px",
            background: "#e8f4f8",
            padding: 20,
            borderRadius: 12,
            textAlign: "center",
            color: "#2c3e50",
          }}
        >
          ⏳ Đang tải danh sách môn học...
        </div>
      )}
      {error && (
        <div
          style={{
            margin: "0 28px 20px",
            background: "#ffe0e0",
            padding: 20,
            borderRadius: 12,
            color: "#c0392b",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* ── table ── */}
      {!loading && !error && (
        <div style={S.tableCard}>
          {/* toolbar */}
          <div style={S.tableToolbar}>
            <div style={S.tableSearchWrap}>
              <span style={{ color: "#8892a4", fontSize: 16 }}>🔍</span>
              <input
                style={S.tableSearchInput}
                placeholder="Tìm kiếm theo mã hoặc tên môn"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* table */}
          {filteredCourses.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#8892a4" }}>
              {keyword
                ? `🔍 Không tìm thấy môn học với từ khóa "${keyword}"`
                : activeSemester
                  ? "Không có môn học trong kỳ hiện hành"
                  : "Chưa có kỳ học hiện hành để đăng ký"}
            </div>
          ) : (
            <table style={S.table}>
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
                    <th key={h} style={S.th}>
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
                      <td style={S.td}>
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </td>
                      <td style={S.td}>
                        <span
                          style={{
                            ...S.courseCode,
                            opacity: isFull && !isRegistered ? 0.45 : 1,
                          }}
                        >
                          {course.course_code || course.subject?.subject_id}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div
                          style={{
                            ...S.courseName,
                            opacity: isFull && !isRegistered ? 0.45 : 1,
                          }}
                        >
                          {course.subject?.name}
                        </div>
                        <div style={S.teacherName}>
                          Giảng viên: {course.teacher?.name || "—"}
                        </div>
                      </td>
                      <td style={S.td}>{course.subject?.credits}</td>
                      <td
                        style={{
                          ...S.td,
                          fontSize: 12,
                          color: "#555",
                          maxWidth: 160,
                        }}
                      >
                        {formatSchedules(course.schedule)}
                      </td>
                      <td style={S.td}>
                        <span style={isFull ? S.capacityFull : S.capacityOk}>
                          {rem} / {cap}
                        </span>
                      </td>
                      <td style={S.td}>
                        {isRegistered ? (
                          <button
                            style={S.btnCancel}
                            onClick={() => cancelCourse(course)}
                          >
                            Hủy
                          </button>
                        ) : !isRegistrationOpen ? (
                          <button style={S.btnFull} disabled>
                            Đã đóng
                          </button>
                        ) : isFull ? (
                          <button style={S.btnFull} disabled>
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
          <div style={S.pagination}>
            <span>
              Hiển thị {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredCourses.length)} trên{" "}
              {filteredCourses.length} môn học
            </span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                style={{ ...S.pageBtn(false), marginRight: 4 }}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, k) => {
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
              })}
              <button
                style={{ ...S.pageBtn(false), marginLeft: 4 }}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* chat box */}
      <ChatBox studentInfo={studentInfo} />
    </div>
  );
};

export default StudentRegister;
