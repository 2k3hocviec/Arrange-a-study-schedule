import React, { useState, useEffect } from "react";
import { teachersAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  FaCalendarAlt,
  FaBook,
  FaIdCard,
  FaClock,
  FaDoorOpen,
  FaLayerGroup,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
} from "react-icons/fa";

// ── Tiết → giờ ───────────────────────────────────────────────
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

const DAY_ENUMS = ["2", "3", "4", "5", "6", "7", "8"];
const DAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SLOT_ROW_HEIGHT = 52;

const PALETTES = [
  { bg: "#d1fae5", border: "#34d399", text: "#065f46", dot: "#059669" },
  { bg: "#dbeafe", border: "#60a5fa", text: "#1e3a5f", dot: "#2563eb" },
  { bg: "#ede9fe", border: "#a78bfa", text: "#3b0764", dot: "#7c3aed" },
  { bg: "#fef3c7", border: "#fbbf24", text: "#78350f", dot: "#d97706" },
  { bg: "#fee2e2", border: "#f87171", text: "#7f1d1d", dot: "#dc2626" },
  { bg: "#fdf4ff", border: "#c084fc", text: "#6b21a8", dot: "#a855f7" },
  { bg: "#f0f9ff", border: "#38bdf8", text: "#0c4a6e", dot: "#0ea5e9" },
];
const pal = (i) => PALETTES[(i || 0) % PALETTES.length];

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmtDate = (d) => d?.toLocaleDateString("vi-VN");

// ── COMPONENT ─────────────────────────────────────────────────
const TeacherSchedule = ({ teacherInfo }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [weekStart, setWeekStart] = useState(null);

  const paletteMap = React.useMemo(() => {
    const map = {};
    let idx = 0;
    scheduleData.forEach((s) => {
      if (!(s.courseId in map)) {
        map[s.courseId] = idx++;
      }
    });
    return map;
  }, [scheduleData]);

  const shiftWeek = (n) => {
    if (!weekStart) return;
    const d = new Date(weekStart);
    d.setDate(d.getDate() + n * 7);
    setWeekStart(d);
  };

  const isInWeek = (sch) => {
    if (!weekStart || !sch.start_date || !sch.end_date) return true;
    const we = new Date(weekStart);
    we.setDate(we.getDate() + 6);
    return (
      new Date(sch.start_date) <= we && new Date(sch.end_date) >= weekStart
    );
  };

  useEffect(() => {
    if (!teacherInfo?.teacher_id) return;
    teachersAPI
      .getSchedule(teacherInfo.teacher_id)
      .then((res) => {
        const formatted = [];
        res.data?.course?.forEach((c) => {
          c.schedule?.forEach((sch) => {
            formatted.push({
              id: sch.schedule_id,
              day: sch.dayOfWeek,
              start_slot: sch.start_slot,
              end_slot: sch.end_slot,
              start_date: sch.start_date,
              end_date: sch.end_date,
              subjectName: c.subject?.name,
              room: sch.classroom_id,
              courseId: c.course_id,
              courseCode: c.course_code || c.course_id,
              credits: c.subject?.credits,
            });
          });
        });
        setScheduleData(formatted);
        setWeekStart(getWeekStart(new Date()));
      })
      .catch(() => toast.error("Không thể tải lịch giảng dạy!"));
  }, [teacherInfo]);

  const weekEnd = weekStart
    ? new Date(weekStart.getTime() + 6 * 86400000)
    : null;

  const getSlotItem = (day, slot) =>
    scheduleData.find(
      (c) =>
        c.day === day &&
        c.start_slot <= slot &&
        c.end_slot >= slot &&
        isInWeek(c),
    );

  const todayDow = new Date().getDay();
  const todayEnum = todayDow === 0 ? "8" : String(todayDow + 1);

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <h2 style={S.title}>
            <FaCalendarAlt style={{ color: "#3a4db7", marginRight: 10 }} />
            Lịch Giảng Dạy Chi Tiết
          </h2>
          {teacherInfo && (
            <p style={S.subtitle}>
              {teacherInfo.name}&nbsp;·&nbsp;
              <span style={{ color: "#3a4db7", fontWeight: 700 }}>
                {teacherInfo.teacher_id}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ── Week bar ── */}
      <div style={S.weekBar}>
        <button style={S.navBtn} onClick={() => shiftWeek(-1)}>
          <FaChevronLeft />
        </button>

        <div style={S.weekCenter}>
          <span style={S.weekLabel}>
            {weekStart && weekEnd
              ? `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`
              : "Chọn tuần"}
          </span>
          <input
            type="date"
            style={S.dateInput}
            value={weekStart ? weekStart.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              setWeekStart(getWeekStart(new Date(e.target.value)))
            }
          />
        </div>

        <button style={S.navBtn} onClick={() => shiftWeek(1)}>
          <FaChevronRight />
        </button>

        <button
          style={S.todayBtn}
          onClick={() => setWeekStart(getWeekStart(new Date()))}
        >
          Hôm nay
        </button>
      </div>

      {/* ── Table ── */}
      <div style={S.tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.thSlot}>TIẾT</th>
                {DAY_ENUMS.map((de, i) => {
                  const isToday = de === todayEnum;
                  return (
                    <th
                      key={de}
                      style={{ ...S.th, ...(isToday ? S.thToday : {}) }}
                    >
                      <div>{DAY_LABELS[i]}</div>
                      {weekStart && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 400,
                            opacity: 0.7,
                            marginTop: 2,
                          }}
                        >
                          {new Date(
                            weekStart.getTime() + i * 86400000,
                          ).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot} style={S.tr}>
                  <td style={S.tdSlot}>
                    <span style={S.slotNum}>Tiết {slot}</span>
                    <span style={S.slotTime}>{SLOT_TIMES[slot]}</span>
                  </td>
                  {DAY_ENUMS.map((de, idx) => {
                    const item = getSlotItem(de, slot);
                    if (item) {
                      if (item.start_slot !== slot) {
                        return <td key={idx} style={S.tdEmpty} />;
                      }
                      const span = item.end_slot - item.start_slot + 1;
                      const c = pal(paletteMap[item.courseId]);
                      return (
                        <td
                          key={idx}
                          style={S.tdClass}
                          onClick={() => setSelectedClass(item)}
                        >
                          <div
                            style={{
                              ...S.classBlock,
                              height: span * SLOT_ROW_HEIGHT - 8,
                              background: c.bg,
                              borderLeft: `3px solid ${c.border}`,
                            }}
                          >
                            <div style={{ ...S.dot, background: c.dot }} />
                            <div style={{ ...S.cName, color: c.text }}>
                              {item.subjectName}
                            </div>
                            <div style={{ ...S.cInfo, color: c.text }}>
                              <FaDoorOpen size={10} />
                              &nbsp;{item.room}
                            </div>
                          </div>
                        </td>
                      );
                    }
                    return <td key={idx} style={S.tdEmpty} />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ── */}
      {scheduleData.length > 0 && (
        <div style={S.legend}>
          {[...new Map(scheduleData.map((s) => [s.courseId, s])).values()].map(
            (s) => {
              const c = pal(paletteMap[s.courseId]);
              return (
                <div key={s.courseId} style={S.legendItem}>
                  <span style={{ ...S.legendDot, background: c.dot }} />
                  <span style={{ fontSize: 12, color: "#475569" }}>
                    {s.subjectName}
                  </span>
                </div>
              );
            },
          )}
        </div>
      )}

      {scheduleData.length === 0 && (
        <div style={S.empty}>
          <FaCalendarAlt
            size={40}
            style={{ color: "#c7d2fe", marginBottom: 12 }}
          />
          <p style={{ color: "#94a3b8", margin: 0 }}>
            Chưa có lịch giảng dạy trong tuần này
          </p>
        </div>
      )}

      {/* ── Modal ── */}
      {selectedClass && (
        <div style={S.overlay} onClick={() => setSelectedClass(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                ...S.modalHeader,
                background: `linear-gradient(135deg, #3a4db7, #6c3fc5)`,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                <FaBook /> Chi tiết lớp dạy
              </span>
              <button style={S.closeBtn} onClick={() => setSelectedClass(null)}>
                <FaTimes />
              </button>
            </div>
            <div style={S.modalBody}>
              {[
                [
                  <FaBook />,
                  "Tên môn học",
                  selectedClass.subjectName,
                  "#3a4db7",
                ],
                [<FaIdCard />, "Mã lớp ghép", selectedClass.courseCode, null],
                [
                  <FaClock />,
                  "Thời gian",
                  `${selectedClass.day === "8" ? "Chủ nhật" : "Thứ " + selectedClass.day}, Tiết ${selectedClass.start_slot}–${selectedClass.end_slot}`,
                  null,
                ],
                [
                  <FaCalendarAlt />,
                  "Khoảng TG",
                  selectedClass.start_date && selectedClass.end_date
                    ? `${new Date(selectedClass.start_date).toLocaleDateString("vi-VN")} – ${new Date(selectedClass.end_date).toLocaleDateString("vi-VN")}`
                    : "Cả năm",
                  null,
                ],
                [
                  <FaDoorOpen />,
                  "Phòng học",
                  `Phòng ${selectedClass.room}`,
                  null,
                ],
                [
                  <FaLayerGroup />,
                  "Số tín chỉ",
                  `${selectedClass.credits} tín chỉ`,
                  null,
                ],
              ].map(([icon, label, val, vc], i) => (
                <div key={i} style={S.mRow}>
                  <span style={{ color: "#a5b4fc", width: 16, flexShrink: 0 }}>
                    {icon}
                  </span>
                  <span
                    style={{ color: "#64748b", fontSize: 13, minWidth: 140 }}
                  >
                    {label}:
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: vc || "#1e293b",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 24px 20px" }}>
              <button
                style={S.modalCloseBtn}
                onClick={() => setSelectedClass(null)}
              >
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
    color: "#1e293b",
  },
  header: {
    marginBottom: 12,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  subtitle: { margin: "4px 0 0", fontSize: 12, color: "#64748b" },
  weekBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    flexWrap: "wrap",
  },
  weekCenter: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 180,
  },
  weekLabel: { fontSize: 13, fontWeight: 700, color: "#3a4db7" },
  dateInput: {
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    padding: "4px 8px",
    fontSize: 12,
    color: "#1e293b",
    outline: "none",
    background: "#f8fafc",
    cursor: "pointer",
  },
  navBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: 8,
    padding: "7px 10px",
    cursor: "pointer",
    color: "#475569",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
  },
  todayBtn: {
    background: "#3a4db7",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    overflow: "hidden",
    marginBottom: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 640,
    tableLayout: "fixed",
  },
  th: {
    padding: "8px 6px",
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    background: "#f8fafc",
    borderBottom: "2px solid #e8eaef",
    textAlign: "center",
    letterSpacing: "0.04em",
  },
  thSlot: {
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    background: "#f8fafc",
    borderBottom: "2px solid #e8eaef",
    textAlign: "left",
    width: 90,
    whiteSpace: "nowrap",
  },
  thToday: { color: "#3a4db7", background: "#eef1ff" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  tdSlot: {
    padding: "6px 12px",
    background: "#fafafa",
    borderRight: "1px solid #f1f5f9",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    height: SLOT_ROW_HEIGHT,
    boxSizing: "border-box",
  },
  slotNum: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },
  slotTime: { display: "block", fontSize: 10, color: "#94a3b8", marginTop: 1 },
  tdEmpty: {
    border: "1px solid #f8fafc",
    height: SLOT_ROW_HEIGHT,
    boxSizing: "border-box",
  },
  tdClass: {
    border: "1px solid #f1f5f9",
    padding: 0,
    verticalAlign: "top",
    cursor: "pointer",
    transition: "filter 0.15s",
    position: "relative",
    height: SLOT_ROW_HEIGHT,
    boxSizing: "border-box",
    overflow: "visible",
  },
  classBlock: {
    position: "absolute",
    top: 3,
    left: 0,
    right: 0,
    zIndex: 2,
    padding: "6px 8px",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  dot: { width: 6, height: 6, borderRadius: "50%", marginBottom: 3 },
  cName: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 2,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cInfo: { fontSize: 10, display: "flex", alignItems: "center", opacity: 0.8 },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    background: "#fff",
    borderRadius: 12,
    padding: "12px 18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,15,40,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    width: 460,
    maxWidth: "95vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    color: "#fff",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
  },
  modalBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  mRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 14 },
  modalCloseBtn: {
    width: "100%",
    padding: 11,
    background: "#f1f5f9",
    color: "#1e293b",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};

export default TeacherSchedule;
