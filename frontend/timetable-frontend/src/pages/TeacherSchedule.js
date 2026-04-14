import React from 'react';

const TeacherSchedule = () => {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📅 LỊCH GIẢNG DẠY CHI TIẾT</h2>
            <table border="1" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <thead style={{ background: '#27ae60', color: 'white' }}>
                <tr>
                    <th style={{ padding: '15px' }}>Tiết</th>
                    {days.map(d => <th key={d}>{d}</th>)}
                </tr>
                </thead>
                <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(slot => (
                    <tr key={slot} style={{ height: '40px' }}>
                        <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Tiết {slot}</td>
                        {days.map((d, i) => <td key={i}>-</td>)}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
export default TeacherSchedule;