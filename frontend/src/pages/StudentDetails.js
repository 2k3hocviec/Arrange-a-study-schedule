
import React, { useEffect, useState } from "react";
import { enrollmentsAPI } from "../services/api";

const StudentDetails = ({ studentInfo }) => {
    const [coursesDetail, setCoursesDetail] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentInfo && studentInfo.student_id) {
            enrollmentsAPI.getStudentCoursesWithDetails(studentInfo.student_id)
                .then(res => {
                    setCoursesDetail(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [studentInfo]);

    // Hàm phụ trợ nối chuỗi thời khóa biểu
    const formatSchedules = (schedules) => {
        if (!schedules || schedules.length === 0) return "Chưa có lịch";
        return schedules.map(s => `${s.dayOfWeek === '8' ? "Chủ nhật" : `Thứ ${s.dayOfWeek}`} (Tiết ${s.start_slot}-${s.end_slot}) - P.${s.classroom_id}`).join(", ");
    };

    return (
        <div>
            <h2 style={{ color: "#2c3e50", marginBottom: "8px" }}>SV_BM 3 - XEM CHI TIẾT MÔN HỌC</h2>
            <p style={{ color: "#7f8c8d", marginBottom: "20px" }}>Chỉ hiển thị chi tiết các môn sinh viên đã đăng ký.</p>

            {loading ? (
                <div style={{ background: "white", padding: "25px", borderRadius: "10px", color: "#7f8c8d" }}>Đang tải dữ liệu...</div>
            ) : coursesDetail.length === 0 ? (
                <div style={{ background: "white", padding: "25px", borderRadius: "10px", color: "#7f8c8d" }}>Bạn chưa đăng ký môn học nào.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "20px" }}>
                    {coursesDetail.map((enrollment, index) => {
                        const course = enrollment.course;
                        return (
                            <div key={enrollment.enrollment_id} style={{ background: "white", padding: "22px", borderRadius: "10px", borderLeft: "5px solid #3498db", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                                <p style={{ marginTop: 0, color: "#7f8c8d" }}>STT: {index + 1}</p>
                                <h3 style={{ margin: "0 0 12px 0", color: "#3498db" }}>{course.subject?.name}</h3>
                                <p><strong>Mã lớp:</strong> {course.course_code || course.course_id}</p>
                                <p><strong>Mã môn học:</strong> {course.subject?.subject_id}</p>
                                <p><strong>Số tín chỉ:</strong> {course.subject?.credits}</p>
                                <p><strong>Thời gian & Phòng:</strong> {formatSchedules(course.schedule)}</p>
                                <p><strong>Giáo viên phụ trách:</strong> {course.teacher_id}</p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentDetails;
