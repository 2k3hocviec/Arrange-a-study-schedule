import React from 'react';

const AdminRooms = () => {
    const rooms = [
        { id: 'A2-301', capacity: 60, type: 'Lý thuyết', status: 'Sẵn sàng', equipment: 'Máy chiếu, Điều hòa' },
        { id: 'A2-502', capacity: 40, type: 'Thực hành', status: 'Đang sử dụng', equipment: '40 Máy tính, Server' },
        { id: 'Hội trường A1', capacity: 200, type: 'Hội thảo', status: 'Sẵn sàng', equipment: 'Âm thanh, Led' }
    ];

    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🏢 QUẢN LÝ PHÒNG HỌC</h2>

            {/* Thống kê nhanh */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={cardStyle}><strong>Tổng số phòng:</strong> 50</div>
                <div style={{ ...cardStyle, borderLeftColor: '#2ecc71' }}><strong>Đang trống:</strong> 12</div>
                <div style={{ ...cardStyle, borderLeftColor: '#e74c3c' }}><strong>Đang bảo trì:</strong> 2</div>
            </div>

            <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <thead style={{ background: '#34495e', color: 'white' }}>
                <tr>
                    <th style={{ padding: '12px' }}>Mã phòng</th>
                    <th>Sức chứa</th>
                    <th>Loại phòng</th>
                    <th>Trang thiết bị</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {rooms.map(room => (
                    <tr key={room.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{room.id}</td>
                        <td>{room.capacity} chỗ</td>
                        <td>{room.type}</td>
                        <td>{room.equipment}</td>
                        <td style={{ color: room.status === 'Sẵn sàng' ? '#27ae60' : '#e67e22', fontWeight: 'bold' }}>
                            {room.status}
                        </td>
                        <td><button>Chi tiết</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

const cardStyle = { flex: 1, background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #3498db', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };

export default AdminRooms;