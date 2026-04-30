import React from 'react';

const TeacherRegister = () => {
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>✍️ ĐĂNG KÝ LỊCH GIẢNG DẠY</h2>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <p>Chọn các học phần bạn muốn đảm nhận giảng dạy trong học kỳ tới:</p>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #27ae60' }}>
                        <th style={{ padding: '10px' }}>Mã môn</th>
                        <th>Tên môn học</th>
                        <th>Số tiết/tuần</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td style={{ padding: '10px' }}>INT1306</td>
                        <td>Cấu trúc dữ liệu</td>
                        <td>3</td>
                        <td><button style={{ background: '#27ae60', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>Đăng ký dạy</button></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default TeacherRegister;