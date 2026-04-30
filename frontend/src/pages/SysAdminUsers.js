import React from 'react';

const SysAdminUsers = () => {
    return (
        <div>
            <h2>👤 QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG</h2>
            <button style={{ marginBottom: '20px', padding: '10px', background: '#2ecc71', color: 'white', border: 'none', cursor: 'pointer' }}>+ Thêm người dùng mới</button>
            <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', background: 'white' }}>
                <thead style={{ background: '#34495e', color: 'white' }}>
                <tr>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th>Họ tên</th>
                    <th>Tên đăng nhập</th>
                    <th>Vai trò</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td style={{ padding: '10px' }}>1</td>
                    <td>Nguyễn Văn Sinh Viên</td>
                    <td>sv01</td>
                    <td>Sinh viên</td>
                    <td><button>Sửa</button> <button style={{color:'red'}}>Xóa</button></td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};
export default SysAdminUsers;