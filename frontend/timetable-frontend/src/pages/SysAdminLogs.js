import React from 'react';

const SysAdminLogs = () => {
    const logs = [
        { time: '2026-04-14 20:10', user: 'admin01', action: 'Đăng nhập hệ thống', status: 'Thành công' },
        { time: '2026-04-14 20:15', user: 'qtv01', action: 'Cập nhật lịch học lớp D21CQCN01', status: 'Thành công' },
        { time: '2026-04-14 20:20', user: 'sv01', action: 'Đăng ký môn Lập trình Java', status: 'Thành công' },
        { time: '2026-04-14 20:25', user: 'unknown', action: 'Thử đăng nhập sai mật khẩu', status: 'Cảnh báo' }
    ];

    return (
        <div>
            <h2 style={{ color: '#c0392b', marginBottom: '20px' }}>📋 NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG</h2>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#34495e', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '12px' }}>Thời gian</th>
                        <th>Người dùng</th>
                        <th>Hành động</th>
                        <th>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map((log, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', color: '#888' }}>{log.time}</td>
                            <td style={{ fontWeight: 'bold' }}>{log.user}</td>
                            <td>{log.action}</td>
                            <td style={{
                                color: log.status === 'Thành công' ? '#27ae60' : '#e74c3c',
                                fontWeight: 'bold'
                            }}>{log.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default SysAdminLogs;