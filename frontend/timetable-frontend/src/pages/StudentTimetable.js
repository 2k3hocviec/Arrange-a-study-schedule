import React from 'react';

const StudentTimetable = () => {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    const slots = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5', 'Tiết 6', 'Tiết 7', 'Tiết 8', 'Tiết 9', 'Tiết 10'];

    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>THỜI KHÓA BIỂU CÁ NHÂN</h2>
            <table border="1" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', background: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <thead>
                <tr style={{ background: '#3498db', color: 'white' }}>
                    <th style={{ padding: '15px' }}>TIẾT</th>
                    {days.map(day => <th key={day}>{day}</th>)}
                </tr>
                </thead>
                <tbody>
                {slots.map(slot => (
                    <tr key={slot}>
                        <td style={{ padding: '10px', fontWeight: 'bold', background: '#ecf0f1' }}>{slot}</td>
                        {days.map((day, idx) => (
                            <td key={idx} style={{ height: '45px' }}></td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
export default StudentTimetable;