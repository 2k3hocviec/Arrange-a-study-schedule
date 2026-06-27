import React, { useEffect, useState } from "react";
import { enrollmentsAPI } from "../services/api";
import "../styles/StudentDetails.css";
const StudentDetails = ({
  studentInfo
}) => {
  const [coursesDetail, setCoursesDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (studentInfo && studentInfo.student_id) {
      enrollmentsAPI.getStudentCoursesWithDetails(studentInfo.student_id).then(res => {
        setCoursesDetail(res.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [studentInfo]);

  // Hàm phụ trợ nối chuỗi thời khóa biểu
  const formatSchedules = schedules => {
    if (!schedules || schedules.length === 0) return "Chưa có lịch";
    return schedules.map(s => `${s.dayOfWeek === '8' ? "Chủ nhật" : `Thứ ${s.dayOfWeek}`} (Tiết ${s.start_slot}-${s.end_slot}) - P.${s.classroom_id}`).join(", ");
  };
  return <div>
            <h2 className="student-details__inline-31">SV_BM 3 - XEM CHI TIẾT MÔN HỌC</h2>
            <p className="student-details__inline-32">Chỉ hiển thị chi tiết các môn sinh viên đã đăng ký.</p>

            {loading ? <div className="student-details__inline-35">Đang tải dữ liệu...</div> : coursesDetail.length === 0 ? <div className="student-details__inline-37">Bạn chưa đăng ký môn học nào.</div> : <div className="student-details__inline-39">
                    {coursesDetail.map((enrollment, index) => {
        const course = enrollment.course;
        return <div key={enrollment.enrollment_id} className="student-details__inline-43">
                                <p className="student-details__inline-44">STT: {index + 1}</p>
                                <h3 className="student-details__inline-45">{course.subject?.name}</h3>
                                <p><strong>Mã lớp:</strong> {course.course_code || course.course_id}</p>
                                <p><strong>Mã môn học:</strong> {course.subject?.subject_id}</p>
                                <p><strong>Số tín chỉ:</strong> {course.subject?.credits}</p>
                                <p><strong>Thời gian & Phòng:</strong> {formatSchedules(course.schedule)}</p>
                                <p><strong>Giáo viên phụ trách:</strong> {course.teacher_id}</p>
                            </div>;
      })}
                </div>}
        </div>;
};
export default StudentDetails;
