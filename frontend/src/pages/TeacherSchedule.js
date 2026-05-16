import React, { useState } from 'react';

const TeacherSchedule = () => {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // State để lưu thông tin môn học đang được click (hiển thị Popup)
    const [selectedClass, setSelectedClass] = useState(null);

    // Dữ liệu mẫu (Mock Data)
    const mockSchedule = [
        { id: 1, day: 'Thứ 2', start_slot: 1, end_slot: 3, subjectName: 'Lập trình Java', room: 'A2-301', courseId: 'INT1337', department: 'Khoa CNTT1', type: 'Lý thuyết' },
        { id: 2, day: 'Thứ 4', start_slot: 7, end_slot: 9, subjectName: 'An toàn bảo mật HTTT', room: 'A3-102', courseId: 'ATBM01', department: 'Khoa An toàn thông tin', type: 'Thực hành' },
        { id: 3, day: 'Thứ 6', start_slot: 1, end_slot: 4, subjectName: 'Cơ sở dữ liệu', room: 'A2-205', courseId: 'INT1306', department: 'Khoa CNTT1', type: 'Lý thuyết' },
        { id: 4, day: 'Thứ 7', start_slot: 6, end_slot: 8, subjectName: 'Kiến trúc máy tính', room: 'A2-401', courseId: 'INT1311', department: 'Khoa Kỹ thuật Điện tử', type: 'Lý thuyết' }
    ];

    // Hàm kiểm tra xem tại (thứ, tiết) có môn học nào không
    const getClassForSlot = (day, slot) => {
        return mockSchedule.find(c => c.day === day && c.start_slot <= slot && c.end_slot >= slot);
    };

    return (
        <div style={{ position: 'relative', minHeight: '100%' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📅 LỊCH GIẢNG DẠY CHI TIẾT</h2>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <table border="1" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#27ae60', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '15px', width: '80px' }}>Tiết</th>
                        {days.map(d => <th key={d} style={{ width: '13%' }}>{d}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {slots.map(slot => (
                        <tr key={slot} style={{ height: '45px' }}>
                            <td style={{ fontWeight: 'bold', background: '#ecf0f1' }}>Tiết {slot}</td>

                            {days.map((day, idx) => {
                                const classItem = getClassForSlot(day, slot);

                                if (classItem) {
                                    // Nếu đây là tiết bắt đầu của môn học -> Hiển thị ô gộp (rowSpan)
                                    if (classItem.start_slot === slot) {
                                        const rowSpanCount = classItem.end_slot - classItem.start_slot + 1;
                                        return (
                                            <td
                                                key={idx}
                                                rowSpan={rowSpanCount}
                                                style={classCardStyle}
                                                onClick={() => setSelectedClass(classItem)} // Click để mở Popup
                                            >
                                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{classItem.subjectName}</div>
                                                <div style={{ fontSize: '13px' }}>Phòng: {classItem.room}</div>
                                            </td>
                                        );
                                    } else {
                                        // Nếu đang nằm trong khoảng tiết của môn học -> Không render td này để nhường chỗ cho rowSpan
                                        return null;
                                    }
                                } else {
                                    // Nếu không có môn học
                                    return <td key={idx} style={{ color: '#bdc3c7' }}>-</td>;
                                }
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Popup (Modal) Hiển thị chi tiết môn học */}
            {selectedClass && (
                <div style={modalOverlayStyle} onClick={() => setSelectedClass(null)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0 }}>Chi tiết lớp học</h3>
                            <button onClick={() => setSelectedClass(null)} style={closeButtonStyle}>✖</button>
                        </div>

                        <div style={modalBodyStyle}>
                            <p><strong>📚 Tên môn học:</strong> <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{selectedClass.subjectName}</span></p>
                            <p><strong>🏷️ Mã lớp ghép (Course ID):</strong> {selectedClass.courseId}</p>
                            <p><strong>⏰ Thời gian:</strong> {selectedClass.day}, Tiết {selectedClass.start_slot} đến tiết {selectedClass.end_slot}</p>
                            <p><strong>🏢 Phòng học:</strong> {selectedClass.room} ({selectedClass.type})</p>
                            <p><strong>🎓 Khoa phụ trách:</strong> {selectedClass.department}</p>
                        </div>

                        <button onClick={() => setSelectedClass(null)} style={modalBtnStyle}>
                            Đóng thông tin
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Styles Toolkit ---
const classCardStyle = {
    background: '#e8f5e9',
    border: '2px solid #2ecc71',
    color: '#27ae60',
    cursor: 'pointer',
    padding: '10px',
    verticalAlign: 'top',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out'
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)'
};

const modalContentStyle = {
    background: 'white',
    padding: '0',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    animation: 'fadeIn 0.3s'
};

const modalHeaderStyle = {
    background: '#27ae60',
    color: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer'
};

const modalBodyStyle = {
    padding: '20px',
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#34495e'
};

const modalBtnStyle = {
    width: 'calc(100% - 40px)',
    margin: '0 20px 20px 20px',
    padding: '12px',
    background: '#ecf0f1',
    color: '#2c3e50',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
};

export default TeacherSchedule;