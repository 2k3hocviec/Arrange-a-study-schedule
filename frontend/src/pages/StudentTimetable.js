import React, { useEffect, useState } from "react";
import { enrollmentsAPI } from "../services/api";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaBook, FaIdCard, FaGraduationCap, FaClock, FaDoorOpen, FaUserTie, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ── Tiết → giờ ───────────────────────────────────────────────
import "../styles/StudentTimetable.css";
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
  10: "16:20"
};
const DAY_ENUMS = ["2", "3", "4", "5", "6", "7", "8"];
const DAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SLOT_ROW_HEIGHT = 52;

// màu pastel cho từng môn
const PALETTES = [{
  bg: "#eef2ff",
  border: "#818cf8",
  text: "#3730a3",
  dot: "#6366f1"
}, {
  bg: "#fdf4ff",
  border: "#c084fc",
  text: "#6b21a8",
  dot: "#a855f7"
}, {
  bg: "#fff7ed",
  border: "#fb923c",
  text: "#9a3412",
  dot: "#f97316"
}, {
  bg: "#f0fdf4",
  border: "#4ade80",
  text: "#14532d",
  dot: "#22c55e"
}, {
  bg: "#fef9c3",
  border: "#facc15",
  text: "#713f12",
  dot: "#eab308"
}, {
  bg: "#fff1f2",
  border: "#fb7185",
  text: "#9f1239",
  dot: "#f43f5e"
}, {
  bg: "#f0f9ff",
  border: "#38bdf8",
  text: "#0c4a6e",
  dot: "#0ea5e9"
}];
const pal = i => PALETTES[(i || 0) % PALETTES.length];
const fmtDate = d => d?.toLocaleDateString("vi-VN");

// ── COMPONENT ─────────────────────────────────────────────────
const StudentTimetable = ({
  studentInfo
}) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [weekStart, setWeekStart] = useState(null);
  const getWeekStart = date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const shiftWeek = n => {
    if (!weekStart) return;
    const d = new Date(weekStart);
    d.setDate(d.getDate() + n * 7);
    setWeekStart(d);
  };
  const isInWeek = sch => {
    if (!weekStart || !sch.start_date || !sch.end_date) return true;
    const we = new Date(weekStart);
    we.setDate(we.getDate() + 6);
    return new Date(sch.start_date) <= we && new Date(sch.end_date) >= weekStart;
  };
  useEffect(() => {
    if (!studentInfo?.student_id) return;
    enrollmentsAPI.getStudentCoursesWithDetails(studentInfo.student_id).then(res => {
      const fmt = [];
      res.data.forEach((enroll, ei) => {
        const course = enroll.course;
        if (course?.schedule?.length > 0) {
          course.schedule.forEach(sch => {
            fmt.push({
              id: sch.schedule_id,
              colorIdx: ei,
              day: sch.dayOfWeek,
              start_slot: sch.start_slot,
              end_slot: sch.end_slot,
              start_date: sch.start_date,
              end_date: sch.end_date,
              subjectName: course.subject?.name,
              subjectId: course.subject?.subject_id,
              room: sch.classroom_id,
              teacherId: course.teacher_id,
              courseId: course.course_id,
              courseCode: course.course_code || course.course_id,
              credits: course.subject?.credits
            });
          });
        }
      });
      setScheduleData(fmt);
      setWeekStart(getWeekStart(new Date()));
    }).catch(() => toast.error("Không thể tải thời khóa biểu!"));
  }, [studentInfo]);
  const getClassForSlot = (day, slot) => scheduleData.find(c => c.day === day && c.start_slot <= slot && c.end_slot >= slot && isInWeek(c));
  const weekEnd = weekStart ? new Date(weekStart.getTime() + 6 * 86400000) : null;

  // ── today highlight ─────────────────────────────────────────
  const todayDow = new Date().getDay(); // 0=sun,1=mon…
  const todayEnum = todayDow === 0 ? "8" : String(todayDow + 1);
  return <div className="student-timetable__page">
      {/* ── Header ── */}
      <div className="student-timetable__header">
        <div>
          <h2 className="student-timetable__title">
            <FaCalendarAlt className="student-timetable__inline-145" />
            Thời Khóa Biểu Cá Nhân
          </h2>
          {studentInfo && <p className="student-timetable__subtitle">
              {studentInfo.name} &nbsp;·&nbsp;
              <span className="student-timetable__inline-151">
                {studentInfo.student_id}
              </span>
            </p>}
        </div>
      </div>

      {/* ── Week bar ── */}
      <div className="student-timetable__week-bar">
        <button onClick={() => shiftWeek(-1)} className="student-timetable__nav-btn">
          <FaChevronLeft />
        </button>

        <div className="student-timetable__week-center">
          <span className="student-timetable__week-label">
            {weekStart && weekEnd ? `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}` : "Chọn tuần"}
          </span>
          <input type="date" value={weekStart ? weekStart.toISOString().split("T")[0] : ""} onChange={e => setWeekStart(getWeekStart(new Date(e.target.value)))} className="student-timetable__date-input" />
          
        </div>

        <button onClick={() => shiftWeek(1)} className="student-timetable__nav-btn">
          <FaChevronRight />
        </button>

        <button onClick={() => setWeekStart(getWeekStart(new Date()))} className="student-timetable__today-btn">
          
          Hôm nay
        </button>
      </div>

      {/* ── Table ── */}
      <div className="student-timetable__table-card">
        <div className="student-timetable__inline-195">
          <table className="student-timetable__table">
            <thead>
              <tr>
                <th className="student-timetable__th-slot">TIẾT</th>
                {DAY_ENUMS.map((de, i) => {
                const isToday = de === todayEnum;
                return <th key={de} style={{
                  ...(isToday ? S.thToday : {})
                }} className="student-timetable__th">
                      
                      <div>{DAY_LABELS[i]}</div>
                      {weekStart && <div className="student-timetable__inline-209">






                        
                          {new Date(weekStart.getTime() + i * 86400000).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit"
                    })}
                        </div>}
                    </th>;
              })}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => <tr key={slot} className="student-timetable__tr">
                  <td style={S.tdSlot}>
                    <span className="student-timetable__slot-num">Tiết {slot}</span>
                    <span className="student-timetable__slot-time">{SLOT_TIMES[slot]}</span>
                  </td>
                  {DAY_ENUMS.map((de, idx) => {
                const item = getClassForSlot(de, slot);
                if (item) {
                  if (item.start_slot !== slot) {
                    return <td key={idx} style={S.tdEmpty} />;
                  }
                  const span = item.end_slot - item.start_slot + 1;
                  const c = pal(item.colorIdx);
                  return <td key={idx} style={S.tdClass} onClick={() => setSelectedClass(item)}>
                        
                          <div style={{
                      height: span * SLOT_ROW_HEIGHT - 8,
                      background: c.bg,
                      borderLeft: `3px solid ${c.border}`
                    }} className="student-timetable__class-block">
                          
                            <div style={{
                        background: c.dot
                      }} className="student-timetable__dot" />
                            <div style={{
                        ...S.cName,
                        color: c.text
                      }}>
                              {item.subjectName}
                            </div>
                            <div style={{
                        color: c.text
                      }} className="student-timetable__c-info">
                              <FaDoorOpen size={10} />
                              &nbsp;{item.room}
                            </div>
                          </div>
                        </td>;
                }
                return <td key={idx} style={S.tdEmpty} />;
              })}
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ── */}
      {scheduleData.length > 0 && <div className="student-timetable__legend">
          {[...new Map(scheduleData.map(s => [s.courseId, s])).values()].map(s => {
        const c = pal(s.colorIdx);
        return <div key={s.courseId} className="student-timetable__legend-item">
                  <span style={{
            background: c.dot
          }} className="student-timetable__legend-dot" />
                  <span className="student-timetable__inline-289">
                    {s.subjectName}
                  </span>
                </div>;
      })}
        </div>}

      {scheduleData.length === 0 && <div className="student-timetable__empty">
          <FaCalendarAlt size={40} className="student-timetable__inline-301" />

        
          <p className="student-timetable__inline-305">
            Chưa có lịch học trong tuần này
          </p>
        </div>}

      {/* ── Modal ── */}
      {selectedClass && <div style={S.overlay} onClick={() => setSelectedClass(null)}>
          <div onClick={e => e.stopPropagation()} className="student-timetable__modal">
            <div style={{
          background: pal(selectedClass.colorIdx).border
        }} className="student-timetable__modal-header">
            
              <span className="student-timetable__inline-321">







              
                <FaBook /> Chi tiết môn học
              </span>
              <button onClick={() => setSelectedClass(null)} className="student-timetable__close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="student-timetable__modal-body">
              {[[<FaBook />, "Tên môn học", selectedClass.subjectName, pal(selectedClass.colorIdx).dot], [<FaIdCard />, "Mã lớp học", selectedClass.courseCode], [<FaGraduationCap />, "Mã học phần", selectedClass.subjectId], [<FaIdCard />, "Số tín chỉ", `${selectedClass.credits} tín chỉ`], [<FaClock />, "Thời gian", `${selectedClass.day === "8" ? "Chủ nhật" : "Thứ " + selectedClass.day}, Tiết ${selectedClass.start_slot}–${selectedClass.end_slot}`], [<FaDoorOpen />, "Phòng học", `Phòng ${selectedClass.room}`], [<FaUserTie />, "Giảng viên", selectedClass.teacherId], [<FaCalendarAlt />, "Khoảng thời gian", selectedClass.start_date && selectedClass.end_date ? `${new Date(selectedClass.start_date).toLocaleDateString("vi-VN")} – ${new Date(selectedClass.end_date).toLocaleDateString("vi-VN")}` : "Cả năm"]].map(([icon, label, val, vc], i) => <div key={i} className="student-timetable__m-row">
                  <span className="student-timetable__inline-367">
                    {icon}
                  </span>
                  <span className="student-timetable__inline-370">

                
                    {label}:
                  </span>
                  <span style={{
              color: vc || "#1e293b"
            }} className="student-timetable__inline-375">
                
                    {val}
                  </span>
                </div>)}
            </div>
            <div className="student-timetable__inline-387">
              <button onClick={() => setSelectedClass(null)} className="student-timetable__modal-close-btn">
              
                Đóng
              </button>
            </div>
          </div>
        </div>}
    </div>;
};

// ── Styles ────────────────────────────────────────────────────
const S = {
  thToday: {
    color: "#4f46e5",
    background: "#eef2ff"
  },
  tdSlot: {
    padding: "6px 12px",
    background: "#fafafa",
    borderRight: "1px solid #f1f5f9",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    height: SLOT_ROW_HEIGHT,
    boxSizing: "border-box"
  },
  tdEmpty: {
    border: "1px solid #f8fafc",
    height: SLOT_ROW_HEIGHT,
    boxSizing: "border-box"
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
    overflow: "visible"
  },
  cName: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 2,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)"
  }
};
export default StudentTimetable;
