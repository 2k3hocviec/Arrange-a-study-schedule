import React from 'react';

const StudentRegister = () => {
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>ĐĂNG KÝ MÔN HỌC</h2>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #3498db', color: '#34495e' }}>
                        <th style={{ padding: '12px' }}>Mã môn</th>
                        <th>Tên môn học</th>
                        <th>Tín chỉ</th>
                        <th>Thời gian</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>BAS1203</td>
                        <td>Lập trình Java</td>
                        <td>3</td>
                        <td>Thứ 2 (Tiết 1-3)</td>
                        <td>
                            <button style={{ background: '#27ae60', color: 'white', border: 'none', padding: '7px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                                Đăng ký
                            </button>
                        </td>
                    </tr>
                    {/* Thêm các dòng khác tương tự ở đây */}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default StudentRegister;