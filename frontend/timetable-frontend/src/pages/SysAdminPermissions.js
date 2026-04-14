import React from 'react';

const SysAdminPermissions = () => {
    const permissions = [
        { id: 'N23DCCN001', role: 'Sinh viên', access: 'Xem thời khóa biểu, Đăng ký môn học' },
        { id: 'GV_001', role: 'Giảng viên', access: 'Quản lý lịch dạy, Khai báo bận' },
        { id: 'QTV_01', role: 'Quản trị viên', access: 'Điều phối lịch học, Quản lý phòng' },
        { id: 'ADMIN_01', role: 'Quản trị hệ thống', access: 'Toàn quyền hệ thống' }
    ];

    return (
        <div>
            <h2 style={{ color: '#c0392b', marginBottom: '20px' }}>🔐 PHÂN QUYỀN TRUY CẬP</h2>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#c0392b', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '12px' }}>Mã người dùng</th>
                        <th>Vai trò</th>
                        <th>Quyền hạn chi tiết</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {permissions.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.id}</td>
                            <td>{p.role}</td>
                            <td style={{ color: '#666' }}>{p.access}</td>
                            <td><button style={{ cursor: 'pointer' }}>Cập nhật</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default SysAdminPermissions;