import React, { useState, useEffect } from "react";
import { teachersAPI } from "../services/api";
import toast from "react-hot-toast";
// Import thư viện react-icons chuẩn form
import {
  FaCalendarAlt,
  FaBook,
  FaIdCard,
  FaClock,
  FaDoorOpen,
  FaBuilding,
  FaTimes,
} from "react-icons/fa";

const TeacherSchedule = ({ teacherInfo }) => {
  // Backend lưu ngày Chủ Nhật là 8
  const daysEnum = ["2", "3", "4", "5", "6", "7", "8"];
  const displayDays = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "CN",
  ];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const [selectedClass, setSelectedClass] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [weekStart, setWeekStart] = useState(null);

  // Lấy ngày đầu tuần (thứ 2) từ một ngày bất kỳ
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh để thứ 2 là đầu tuần
    return new Date(d.setDate(diff));
  };

  // Kiểm tra schedule có nằm trong tuần được chọn không
  const isScheduleInWeek = (schedule) => {
    console.log(schedule);

    if (!weekStart || !schedule.start_date || !schedule.end_date) {
      return true; // Nếu không chọn tuần hoặc schedule không có ngày, hiển thị tất cả
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const scheduleStart = new Date(schedule.start_date);
    const scheduleEnd = new Date(schedule.end_date);

    // Kiểm tra overlap: schedule overlap với tuần nếu
    // schedule.start_date <= weekEnd AND schedule.end_date >= weekStart
    return scheduleStart <= weekEnd && scheduleEnd >= weekStart;
  };

  useEffect(() => {
    if (teacherInfo && teacherInfo.teacher_id) {
      teachersAPI
        .getSchedule(teacherInfo.teacher_id)
        .then((res) => {
          const formatted = [];
          // Bóc tách API: res.data.course chứa mảy khóa học giảng viên dạy
          if (res.data && res.data.course) {
            res.data.course.forEach((c) => {
              if (c.schedule && c.schedule.length > 0) {
                c.schedule.forEach((sch) => {
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
                    department: c.subject?.credits + " Tín chỉ",
                    type: "Lớp Học Phần",
                  });
                });
              }
            });
          }
          setScheduleData(formatted);
          // Set weekStart mặc định là tuần hiện tại
          setWeekStart(getWeekStart(new Date()));
        })
        .catch((err) => toast.error("Không thể tải lịch giảng dạy!"));
    }
  }, [teacherInfo]);

  const getClassForSlot = (day, slot) => {
    return scheduleData.find(
      (c) =>
        c.day === day &&
        c.start_slot <= slot &&
        c.end_slot >= slot &&
        isScheduleInWeek(c),
    );
  };

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <h2
        style={{
          color: "#2c3e50",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <FaCalendarAlt style={{ color: "#27ae60" }} /> LỊCH GIẢNG DẠY CHI TIẾT
      </h2>

      {/* Chọn tuần */}
      <div
        style={{
          background: "#ecf0f1",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <label style={{ fontWeight: "bold", color: "#2c3e50" }}>
          Chọn tuần:
        </label>
        <input
          type="date"
          value={
            weekStart
              ? weekStart.toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
          onChange={(e) => {
            const selectedDate = new Date(e.target.value);
            setWeekStart(getWeekStart(selectedDate));
          }}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #bdc3c7",
            fontSize: "14px",
            cursor: "pointer",
          }}
        />
        {weekStart && (
          <span style={{ color: "#27ae60", fontWeight: "bold" }}>
            Tuần: {weekStart.toLocaleDateString("vi-VN")} -{" "}
            {new Date(
              weekStart.getTime() + 6 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString("vi-VN")}
          </span>
        )}
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <table
          border="1"
          style={{
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
          }}
        >
          <thead style={{ background: "#27ae60", color: "white" }}>
            <tr>
              <th style={{ padding: "15px", width: "80px" }}>Tiết</th>
              {displayDays.map((d) => (
                <th key={d} style={{ width: "13%" }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot} style={{ height: "45px" }}>
                <td
                  style={{
                    fontWeight: "bold",
                    background: "#ecf0f1",
                    color: "#34495e",
                  }}
                >
                  Tiết {slot}
                </td>
                {daysEnum.map((dayEnum, idx) => {
                  const classItem = getClassForSlot(dayEnum, slot);
                  if (classItem) {
                    if (classItem.start_slot === slot) {
                      const rowSpanCount =
                        classItem.end_slot - classItem.start_slot + 1;
                      return (
                        <td
                          key={idx}
                          rowSpan={rowSpanCount}
                          style={classCardStyle}
                          onClick={() => setSelectedClass(classItem)}
                        >
                          <div
                            style={{ fontWeight: "bold", marginBottom: "5px" }}
                          >
                            {classItem.subjectName}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            <FaDoorOpen /> P. {classItem.room}
                          </div>
                        </td>
                      );
                    } else {
                      return null;
                    }
                  } else {
                    return (
                      <td
                        key={idx}
                        style={{ color: "#bdc3c7", border: "1px solid #ddd" }}
                      ></td>
                    );
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Modal chuẩn form với sinh viên */}
      {selectedClass && (
        <div style={modalOverlayStyle} onClick={() => setSelectedClass(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaBook /> Chi tiết lớp dạy
              </h3>
              <button
                onClick={() => setSelectedClass(null)}
                style={closeButtonStyle}
              >
                {" "}
                <FaTimes />{" "}
              </button>
            </div>
            <div style={modalBodyStyle}>
              <p style={itemStyle}>
                <FaBook style={iconStyle} />
                <strong>Tên môn:</strong>{" "}
                <span
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    marginLeft: "5px",
                  }}
                >
                  {selectedClass.subjectName}
                </span>
              </p>
              <p style={itemStyle}>
                <FaIdCard style={iconStyle} />
                <strong>Mã lớp ghép:</strong>{" "}
                <span style={{ marginLeft: "5px" }}>
                  {selectedClass.courseId}
                </span>
              </p>
              <p style={itemStyle}>
                <FaClock style={iconStyle} />
                <strong>Thời gian:</strong>{" "}
                <span style={{ marginLeft: "5px" }}>
                  {selectedClass.day === "8"
                    ? "Chủ nhật"
                    : "Thứ " + selectedClass.day}
                  , Tiết {selectedClass.start_slot} đến {selectedClass.end_slot}
                </span>
              </p>
              <p style={itemStyle}>
                <FaCalendarAlt style={iconStyle} />
                <strong>Khoảng thời gian:</strong>{" "}
                <span style={{ marginLeft: "5px" }}>
                  {selectedClass.start_date && selectedClass.end_date
                    ? `Từ ${new Date(selectedClass.start_date).toLocaleDateString("vi-VN")} đến ${new Date(selectedClass.end_date).toLocaleDateString("vi-VN")}`
                    : "Cả năm (không giới hạn)"}
                </span>
              </p>
              <p style={itemStyle}>
                <FaDoorOpen style={iconStyle} />
                <strong>Phòng học:</strong>{" "}
                <span style={{ marginLeft: "5px" }}>
                  Phòng {selectedClass.room}
                </span>
              </p>
              <p style={itemStyle}>
                <FaBuilding style={iconStyle} />
                <strong>Khối lượng:</strong>{" "}
                <span style={{ marginLeft: "5px" }}>
                  {selectedClass.department}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedClass(null)}
              style={modalBtnStyle}
            >
              Đóng thông tin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CSS Styles ---
const classCardStyle = {
  background: "#e8f5e9",
  border: "2px solid #2ecc71",
  color: "#27ae60",
  cursor: "pointer",
  padding: "10px",
  verticalAlign: "top",
  borderRadius: "4px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease-in-out",
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(3px)",
};
const modalContentStyle = {
  background: "white",
  padding: "0",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "460px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  overflow: "hidden",
  animation: "fadeIn 0.3s",
};
const modalHeaderStyle = {
  background: "#27ae60",
  color: "white",
  padding: "15px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const closeButtonStyle = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};
const modalBodyStyle = {
  padding: "20px 25px",
  fontSize: "15px",
  color: "#34495e",
};
const itemStyle = {
  display: "flex",
  alignItems: "center",
  margin: "10px 0",
  lineHeight: "1.5",
};
const iconStyle = { color: "#7f8c8d", marginRight: "10px", width: "16px" };
const modalBtnStyle = {
  width: "calc(100% - 50px)",
  margin: "0 25px 20px 25px",
  padding: "12px",
  background: "#ecf0f1",
  color: "#2c3e50",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default TeacherSchedule;
