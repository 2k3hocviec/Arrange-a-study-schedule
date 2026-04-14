import React from 'react';

const AdminAdjust = () => {
    return (
        <div>
            <h2>🛠️ ĐIỀU CHỈNH LỊCH HỌC (MẪU BMCL)</h2>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input type="text" placeholder="Mã lớp học" style={inputStyle} />
                    <input type="text" placeholder="Giảng viên thay thế" style={inputStyle} />
                    <input type="text" placeholder="Phòng học mới" style={inputStyle} />
                    <input type="date" placeholder="Ngày học mới" style={inputStyle} />
                </div>
                <button style={{ marginTop: '20px', padding: '10px 20px', background: '#8e44ad', color: 'white', border: 'none' }}>Cập nhật lịch học</button>
            </div>
        </div>
    );
};
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' };
export default AdminAdjust;