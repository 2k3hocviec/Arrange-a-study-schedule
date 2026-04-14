import React from 'react';

const AdminSubjects = () => {
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📚 QUẢN LÝ DANH MỤC MÔN HỌC</h2>
            <button style={{ marginBottom: '20px', padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Thêm môn học mới</button>

            <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <thead style={{ background: '#8e44ad', color: 'white' }}>
                <tr>
                    <th style={{ padding: '12px' }}>Mã môn</th>
                    <th>Tên môn học</th>
                    <th>Số tín chỉ</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <td style={{ padding: '12px' }}>INT1306</td>
                    <td>Cấu trúc dữ liệu và giải thuật</td>
                    <td>3</td>
                    <td>
                        <button style={{ marginRight: '5px' }}>Sửa</button>
                        <button style={{ color: 'red' }}>Xóa</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};
export default AdminSubjects;