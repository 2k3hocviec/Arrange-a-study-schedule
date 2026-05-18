import React from 'react';

const TeacherNotifications = () => {
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔔 THÔNG BÁO CHO GIẢNG VIÊN</h2>

            <div style={{ background: '#e1f5fe', padding: '15px', marginBottom: '15px', borderLeft: '5px solid #3498db', borderRadius: '4px' }}>
                <strong style={{ display: 'block', marginBottom: '5px' }}>📅 Cập nhật lịch thi học kỳ</strong>
                Phòng đào tạo thông báo lịch coi thi học kỳ 2 sẽ được cập nhật trên hệ thống vào ngày 20/05. Kính mong các giảng viên theo dõi.
            </div>

            <div style={{ background: '#fff9c4', padding: '15px', borderLeft: '5px solid #f1c40f', borderRadius: '4px' }}>
                <strong style={{ display: 'block', marginBottom: '5px' }}>⚠️ Thay đổi phòng học môn Java</strong>
                Môn Lập trình Java lớp D21CQCN01 ngày 15/05 sẽ được chuyển từ phòng A2-301 sang A2-502 do sự cố máy chiếu.
            </div>
        </div>
    );
};

export default TeacherNotifications;