import React, { useState, useEffect } from "react";
import { teachersAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/TeacherSchedule.css";
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
// COMPONENT ─────────────────────────────────────────────────
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
    <div className="teacher-schedule">
      {/* ── Header ── */}
      <div className="teacher-schedule__header">
        <div>
          <h2 className="teacher-schedule__title">
            <FaCalendarAlt className="teacher-schedule__title-icon" />
            Lịch Giảng Dạy Chi Tiết
          </h2>
          {teacherInfo && (
            <p className="teacher-schedule__subtitle">
              {teacherInfo.name}&nbsp;·&nbsp;
              <span className="teacher-schedule__teacher-id">
                {teacherInfo.teacher_id}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Week bar */}
      <div className="teacher-schedule__week-bar">
        <button className="teacher-schedule__nav-btn" onClick={() => shiftWeek(-1)}>
          <FaChevronLeft />
        </button>

        <div className="teacher-schedule__week-center">
          <span className="teacher-schedule__week-label">
            {weekStart && weekEnd
              ? `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`
              : "Chọn tuần"}
          </span>
          <input
            type="date"
            className="teacher-schedule__date-input"
            value={weekStart ? weekStart.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              setWeekStart(getWeekStart(new Date(e.target.value)))
            }
          />
        </div>

        <button className="teacher-schedule__nav-btn" onClick={() => shiftWeek(1)}>
          <FaChevronRight />
        </button>

        <button
          className="teacher-schedule__today-btn"
          onClick={() => setWeekStart(getWeekStart(new Date()))}
        >
          Hôm nay
        </button>
      </div>

      {/* ── Table ── */}
      <div className="teacher-schedule__table-card">
        <div className="teacher-schedule__table-scroll">
          <table className="teacher-schedule__table">
            <thead>
              <tr>
                <th className="teacher-schedule__th-slot">TIẾT</th>
                {DAY_ENUMS.map((de, i) => {
                  const isToday = de === todayEnum;
                  return (
                    <th
                      key={de}
                      className={`teacher-schedule__th${isToday ? " teacher-schedule__th--today" : ""}`}
                    >
                      <div>{DAY_LABELS[i]}</div>
                      {weekStart && (
                        <div className="teacher-schedule__day-date">
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
                <tr key={slot} className="teacher-schedule__tr">
                  <td className="teacher-schedule__td-slot">
                    <span className="teacher-schedule__slot-num">Tiết {slot}</span>
                    <span className="teacher-schedule__slot-time">{SLOT_TIMES[slot]}</span>
                  </td>
                  {DAY_ENUMS.map((de, idx) => {
                    const item = getSlotItem(de, slot);
                    if (item) {
                      if (item.start_slot !== slot) {
                        return <td key={idx} className="teacher-schedule__td-empty" />;
                      }
                      const span = item.end_slot - item.start_slot + 1;
                      const c = pal(paletteMap[item.courseId]);
                      return (
                        <td
                          key={idx}
                          className="teacher-schedule__td-class"
                          onClick={() => setSelectedClass(item)}
                        >
                          <div
                            className="teacher-schedule__class-block"
                            style={{
                              height: span * SLOT_ROW_HEIGHT - 8,
                              background: c.bg,
                              borderLeft: `3px solid ${c.border}`,
                            }}
                          >
                            <div className="teacher-schedule__class-dot" style={{ background: c.dot }} />
                            <div className="teacher-schedule__class-name" style={{ color: c.text }}>
                              {item.subjectName}
                            </div>
                            <div className="teacher-schedule__class-info" style={{ color: c.text }}>
                              <FaDoorOpen size={10} />
                              &nbsp;{item.room}
                            </div>
                          </div>
                        </td>
                      );
                    }
                    return <td key={idx} className="teacher-schedule__td-empty" />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ── */}
      {scheduleData.length > 0 && (
        <div className="teacher-schedule__legend">
          {[...new Map(scheduleData.map((s) => [s.courseId, s])).values()].map(
            (s) => {
              const c = pal(paletteMap[s.courseId]);
              return (
                <div key={s.courseId} className="teacher-schedule__legend-item">
                  <span className="teacher-schedule__legend-dot" style={{ background: c.dot }} />
                  <span className="teacher-schedule__legend-text">
                    {s.subjectName}
                  </span>
                </div>
              );
            },
          )}
        </div>
      )}

      {scheduleData.length === 0 && (
        <div className="teacher-schedule__empty">
          <FaCalendarAlt
            size={40}
            className="teacher-schedule__empty-icon"
          />
          <p className="teacher-schedule__empty-text">
            Chưa có lịch giảng dạy trong tuần này
          </p>
        </div>
      )}

      {/* ── Modal ── */}
      {selectedClass && (
        <div className="teacher-schedule__overlay" onClick={() => setSelectedClass(null)}>
          <div className="teacher-schedule__modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="teacher-schedule__modal-header"
            >
              <span className="teacher-schedule__modal-title">
                <FaBook /> Chi tiết lớp dạy
              </span>
              <button className="teacher-schedule__close-btn" onClick={() => setSelectedClass(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="teacher-schedule__modal-body">
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
                <div key={i} className="teacher-schedule__modal-row">
                  <span className="teacher-schedule__modal-icon">
                    {icon}
                  </span>
                  <span
                    className="teacher-schedule__modal-label"
                  >
                    {label}:
                  </span>
                  <span className="teacher-schedule__modal-value" style={{ color: vc || "#1e293b" }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <div className="teacher-schedule__modal-footer">
              <button
                className="teacher-schedule__modal-close-btn"
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

export default TeacherSchedule;

