import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StudentTimetable from './StudentTimetable';
import StudentRegister from './StudentRegister';
import StudentNotifications from './StudentNotifications';
import StudentDetails from './StudentDetails';

const StudentDashboard = () => {
    const navItemStyle = { padding: '15px 15px', borderBottom: '1px solid #2d3436' };
    const linkStyle = { color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' };

    // Thẻ thống kê với màu Cyan Neon
    const statCard = {
        flex: 1, background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '6px solid #00d2ff'
    };

    const HomeContent = (
        <div>
            <h1 style={{ color: '#2c3e50', fontSize: '28px', marginBottom: '30px' }}>BẢNG ĐIỀU KHIỂN SINH VIÊN</h1>
            <div style={{ display: 'flex', gap: '25px', marginBottom: '40px' }}>
                <div style={statCard}>
                    <h2 style={{ margin: 0, fontSize: '32px', color: '#00d2ff' }}>4</h2>
                    <p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Môn học kỳ này</p>
                </div>
                <div style={statCard}>
                    <h2 style={{ margin: 0, fontSize: '32px', color: '#00d2ff' }}>12</h2>
                    <p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Tín chỉ tích lũy</p>
                </div>
                <div style={statCard}>
                    <h2 style={{ margin: 0, fontSize: '32px', color: '#00d2ff' }}>2</h2>
                    <p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Thông báo mới</p>
                </div>
            </div>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', borderLeft: '8px solid #00d2ff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>📅 Nhắc nhở lịch học</h4>
                <p style={{ margin: 0, color: '#34495e' }}>Hôm nay bạn có lịch học môn <strong>Lập trình Java</strong> lúc 07:00 tại phòng A2-301.</p>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
            {/* Sidebar màu tối Deep Dark */}
            <div style={{ width: '260px', background: '#1a1c23', color: 'white', padding: '20px' }}>
                <h2 style={{ textAlign: 'center', color: '#00d2ff', marginBottom: '30px', textShadow: '0 0 10px rgba(0,210,255,0.3)' }}>SINH VIÊN</h2>
                <hr style={{ borderColor: '#2d3436', marginBottom: '20px' }}/>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={navItemStyle}><Link to="/student/timetable" style={linkStyle}>📅 Thời khóa biểu</Link></li>
                        <li style={navItemStyle}><Link to="/student/register" style={linkStyle}>📝 Đăng ký môn học</Link></li>
                        <li style={navItemStyle}><Link to="/student/details" style={linkStyle}>🔍 Chi tiết môn học</Link></li>
                        <li style={navItemStyle}><Link to="/student/notifications" style={linkStyle}>🔔 Thông báo</Link></li>
                    </ul>
                </nav>
                <button onClick={() => window.location.href='/login'} style={{marginTop: '40px', width: '100%', padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>Đăng xuất</button>
            </div>
            <div style={{ flex: 1, padding: '40px', background: '#f8f9fa', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/" element={HomeContent} /><Route path="dashboard" element={HomeContent} />
                    <Route path="timetable" element={<StudentTimetable />} /><Route path="register" element={<StudentRegister />} />
                    <Route path="details" element={<StudentDetails />} /><Route path="notifications" element={<StudentNotifications />} />
                </Routes>
            </div>
        </div>
    );
};
export default StudentDashboard;