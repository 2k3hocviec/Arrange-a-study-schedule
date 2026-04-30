import React from 'react';

const AdminSchedule = () => {
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📅 ĐIỀU PHỐI VÀ CẬP NHẬT LỊCH HỌC</h2>

            {/* Form sắp xếp/điều chỉnh */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h4 style={{ marginTop: 0 }}>Cập nhật / Sắp xếp lịch học mới</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <input type="text" placeholder="Mã lớp/Lịch học" style={inputS} />
                    <select style={inputS}><option>Chọn giảng viên</option></select>
                    <select style={inputS}><option>Chọn phòng học</option></select>
                    <input type="date" style={inputS} />
                    <select style={inputS}><option>Chọn ca học (Tiết)</option></select>
                    <button style={{ background: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cập nhật lịch</button>
                </div>
            </div>

            {/* Danh sách lịch hiện tại */}
            <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#34495e', color: 'white' }}>
                <tr>
                    <th style={{ padding: '12px' }}>Lớp</th>
                    <th>Môn học</th>
                    <th>Giảng viên</th>
                    <th>Phòng</th>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                <tr style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>D21CQCN01</td>
                    <td>Lập trình Java</td>
                    <td>Nguyễn Văn A</td>
                    <td>A2-301</td>
                    <td>Thứ 2 (1-3)</td>
                    <td><button style={{ color: 'red' }}>Hủy lịch</button></td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};
const inputS = { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' };
export default AdminSchedule;