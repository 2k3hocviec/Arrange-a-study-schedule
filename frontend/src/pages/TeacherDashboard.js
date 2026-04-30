import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TeacherSchedule from './TeacherSchedule';
import TeacherBusy from './TeacherBusy';
import TeacherRegister from './TeacherRegister';

const TeacherDashboard = () => {
    const navItemStyle = { padding: '15px 10px', borderBottom: '1px solid #2d3436' };
    const linkStyle = { color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' };
    const statCard = { flex: 1, background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '6px solid #00ff88' };

    const HomeContent = (
        <div>
            <h1 style={{ color: '#2c3e50', fontSize: '28px', marginBottom: '30px' }}>TỔNG QUAN GIẢNG DẠY</h1>
            <div style={{ display: 'flex', gap: '25px', marginBottom: '40px' }}>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#00ff88' }}>3</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Lớp học đảm nhận</p></div>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#00ff88' }}>15</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Tiết dạy trong tuần</p></div>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#00ff88' }}>0</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Yêu cầu báo bận</p></div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ width: '260px', background: '#16211a', color: 'white', padding: '20px' }}>
                <h2 style={{ textAlign: 'center', color: '#00ff88', marginBottom: '30px' }}>GIẢNG VIÊN</h2>
                <hr style={{ borderColor: '#2d3436' }}/>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={navItemStyle}><Link to="/teacher/schedule" style={linkStyle}>👨‍🏫 Lịch giảng dạy</Link></li>
                    <li style={navItemStyle}><Link to="/teacher/register" style={linkStyle}>✍️ Đăng ký lịch dạy</Link></li>
                    <li style={navItemStyle}><Link to="/teacher/busy" style={linkStyle}>🚫 Khai báo bận</Link></li>
                </ul>
                <button onClick={() => window.location.href='/login'} style={{marginTop: '30px', width: '100%', padding: '10px', background: '#c0392b', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px'}}>Đăng xuất</button>
            </div>
            <div style={{ flex: 1, padding: '40px', background: '#f8f9fa' }}>
                <Routes><Route path="/" element={HomeContent} /><Route path="dashboard" element={HomeContent} />
                    <Route path="schedule" element={<TeacherSchedule />} /><Route path="register" element={<TeacherRegister />} />
                    <Route path="busy" element={<TeacherBusy />} /></Routes>
            </div>
        </div>
    );
};
export default TeacherDashboard;