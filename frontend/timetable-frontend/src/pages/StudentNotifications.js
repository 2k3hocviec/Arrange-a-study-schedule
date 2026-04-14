import React from 'react';

const StudentNotifications = () => {
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>THÔNG BÁO</h2>
            <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderLeft: '5px solid #f1c40f', borderRadius: '4px' }}>
                <strong style={{ display: 'block', marginBottom: '5px' }}>⚠️ Thông báo nghỉ học</strong>
                Môn Lập trình mạng ngày 15/04 nghỉ học do Giảng viên bận họp. Lịch học bù sẽ được thông báo sau.
            </div>
            <div style={{ background: '#e1f5fe', padding: '15px', borderLeft: '5px solid #3498db', borderRadius: '4px' }}>
                <strong style={{ display: 'block', marginBottom: '5px' }}>📅 Lịch đăng ký học kỳ mới</strong>
                Cổng đăng ký môn học cho học kỳ 2 sẽ chính thức mở từ ngày 20/04. Sinh viên lưu ý kiểm tra số dư học phí.
            </div>
        </div>
    );
};
export default StudentNotifications;