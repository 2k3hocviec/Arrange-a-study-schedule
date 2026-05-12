import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { REGISTRATION_OPEN } from "./studentData";
import { coursesAPI, enrollmentsAPI } from "../services/api";
import ChatBox from "../components/ChatBox";

// Helper function format schedules array
const formatSchedules = (schedules) => {
  if (!Array.isArray(schedules) || schedules.length === 0) return "N/A";
  return schedules
    .map(
      (s) =>
        `${
          s.dayOfWeek === 8 ? "Chủ nhật" : `Thứ ${s.dayOfWeek}`
        } (${s.start_slot}-${s.end_slot})`,
    )
    .join(", ");
};

const StudentRegister = ({
  registeredIds = [],
  setRegisteredIds,
  studentInfo,
}) => {
  const [keyword, setKeyword] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await coursesAPI.getInfoCourse();
        await setCourses(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Không thể tải danh sách môn học");
        toast.error("Lỗi: Không thể tải danh sách môn học");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch enrolled courses for current student
  useEffect(() => {
    if (!studentInfo || !studentInfo.student_id) return;

    const fetchEnrollments = async () => {
      try {
        const res = await enrollmentsAPI.getByStudentId(studentInfo.student_id);
        if (res.data && Array.isArray(res.data)) {
          const enrolledCourseIds = res.data.map((e) => e.course_id);
          setRegisteredIds(enrolledCourseIds);
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }
    };

    fetchEnrollments();
  }, [studentInfo, setRegisteredIds]);

  const registerCourse = async (course) => {
    if (!REGISTRATION_OPEN)
      return toast.error("Hiện chưa trong thời gian mở đăng ký.");

    try {
      setEnrollingCourseId(course.course_id);

      if (!studentInfo || !studentInfo.student_id) {
        toast.error(
          "Không thể lấy thông tin sinh viên. Vui lòng tải lại trang.",
        );
        return;
      }

      await enrollmentsAPI.create({
        student_id: studentInfo.student_id,
        course_id: course.course_id,
      });

      setRegisteredIds([...registeredIds, course.course_id]);
      toast.success(`Đã đăng ký ${course.name}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const cancelCourse = async (course) => {
    console.log({
      student_id: studentInfo.student_id,
      course_id: course.course_id,
    });

    setRegisteredIds(registeredIds.filter((id) => id !== course.course_id));
    await enrollmentsAPI.delete({
      student_id: studentInfo.student_id,
      course_id: course.course_id,
    });
    toast.success(`Đã hủy ${course.name}`);
  };

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "8px" }}>
        SV_BM 2 - ĐĂNG KÝ MÔN HỌC
      </h2>
      <p style={{ color: "#7f8c8d", marginBottom: "20px" }}>
        · Trạng thái đăng ký:{" "}
        <strong style={{ color: REGISTRATION_OPEN ? "#27ae60" : "#e74c3c" }}>
          {REGISTRATION_OPEN ? "Đang mở" : "Đã đóng"}
        </strong>
      </p>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            background: "#e8f4f8",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "20px",
          }}
        >
          ⏳ Đang tải danh sách môn học...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            background: "#ffe0e0",
            padding: "20px",
            borderRadius: "10px",
            color: "#c0392b",
            marginBottom: "20px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Courses Table */}
      {!loading && !error && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.08)",
          }}
        >
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã môn, tên môn, giảng viên..."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #dfe6e9",
              borderRadius: "8px",
              marginBottom: "16px",
              boxSizing: "border-box",
            }}
          />

          {courses.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#7f8c8d", padding: "20px" }}
            >
              📭 Không tìm thấy môn học phù hợp
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                textAlign: "left",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #3498db",
                    color: "#34495e",
                  }}
                >
                  <th style={{ padding: "12px" }}>STT</th>
                  <th>Mã khóa học</th>
                  <th>Mã môn học</th>
                  <th>Tên môn học</th>
                  <th>Số tín chỉ</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => {
                  const isRegistered = registeredIds.includes(course.course_id);
                  return (
                    <tr
                      key={course.course_id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td>{course.course_id}</td>
                      <td>{course.subject?.subject_id}</td>
                      <td>{course.subject?.name}</td>
                      <td>{course.subject?.credits}</td>
                      <td>{formatSchedules(course.schedule)}</td>
                      <td>
                        {isRegistered ? (
                          <button
                            onClick={() => cancelCourse(course)}
                            style={{
                              background: "#e67e22",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Hủy
                          </button>
                        ) : (
                          <button
                            onClick={() => registerCourse(course)}
                            disabled={enrollingCourseId === course.course_id}
                            style={{
                              background: "red",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "6px",
                              cursor:
                                enrollingCourseId === course.course_id
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                enrollingCourseId === course.course_id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {enrollingCourseId === course.course_id
                              ? "Đang xử lý..."
                              : "Đăng ký"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Chat Box */}
      <ChatBox studentInfo={studentInfo} />
    </div>
  );
};

export default StudentRegister;
