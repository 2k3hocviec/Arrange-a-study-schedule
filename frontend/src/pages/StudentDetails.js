import React from 'react';

const StudentDetails = () => {
    const courses = [
        { id: 'BAS1203', name: 'Lập trình Java', teacher: 'Nguyễn Văn A', room: 'A2-301', time: 'Thứ 2 (1-3)' },
        { id: 'INT1306', name: 'Cấu trúc dữ liệu', teacher: 'Trần Thị B', room: 'A2-502', time: 'Thứ 4 (6-8)' }
    ];

    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>CHI TIẾT MÔN HỌC ĐÃ ĐĂNG KÝ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {courses.map(course => (
                    <div key={course.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #3498db', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#3498db' }}>{course.name}</h3>
                        <p><strong>Mã môn:</strong> {course.id}</p>
                        <p><strong>Giảng viên:</strong> {course.teacher}</p>
                        <p><strong>Phòng học:</strong> {course.room}</p>
                        <p><strong>Lịch học:</strong> {course.time}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default StudentDetails;