import React from 'react';

const TeacherBusy = () => {
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🚫 KHAI BÁO LỊCH BẬN GIẢNG DẠY</h2>
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <p style={{ marginBottom: '20px' }}>Vui lòng chọn ngày và buổi bạn bận việc riêng để hệ thống tự động tránh sắp xếp lịch dạy:</p>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input type="date" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    <select style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option>Cả ngày</option>
                        <option>Buổi sáng (Tiết 1-5)</option>
                        <option>Buổi chiều (Tiết 6-10)</option>
                    </select>
                    <button style={{ padding: '10px 25px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Gửi yêu cầu</button>
                </div>
            </div>
        </div>
    );
};
export default TeacherBusy;