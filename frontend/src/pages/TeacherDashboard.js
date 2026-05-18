import React, { useEffect, useState, useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import TeacherSchedule from './TeacherSchedule';
import TeacherNotifications from './TeacherNotifications';
import { AuthContext } from '../contexts/AuthContext';
import { teachersAPI } from '../services/api';

const TeacherDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const navigate = useNavigate();

    const navItemStyle = { padding: '15px 10px', borderBottom: '1px solid #2d3436' };
    const linkStyle = { color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' };
    const statCard = { flex: 1, background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '6px solid #00ff88' };

    // Lấy thông tin Giảng viên đang đăng nhập (Xử lý thay thế API /me)
    useEffect(() => {
        if (user) {
            teachersAPI.getAll().then(res => {
                const currentTeacher = res.data.find(t => t.user_id === user.id);
                setTeacherInfo(currentTeacher);
            }).catch(err => console.error(err));
        }
    }, [user]);

    const HomeContent = (
        <div>
            <h1 style={{ color: '#2c3e50', fontSize: '28px', marginBottom: '30px' }}>TỔNG QUAN GIẢNG DẠY</h1>
            <div style={{ display: 'flex', gap: '25px', marginBottom: '40px' }}>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#00ff88' }}>3</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Lớp học đảm nhận</p></div>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#00ff88' }}>15</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Tiết dạy trong tuần</p></div>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#00ff88' }}>2</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Thông báo mới</p></div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
            {/* Sidebar bên trái */}
            <div style={{ width: '260px', background: '#16211a', color: 'white', padding: '20px' }}>
                <h2 style={{ textAlign: 'center', color: '#00ff88', marginBottom: '10px' }}>GIẢNG VIÊN</h2>
                <p style={{ textAlign: 'center', color: '#bdc3c7', marginTop: 0, fontSize: '14px' }}>
                    {teacherInfo ? teacherInfo.name : 'Đang tải...'}
                </p>
                <hr style={{ borderColor: '#2d3436' }}/>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={navItemStyle}>
                        <Link to="/teacher/schedule" style={linkStyle}> 👨‍🏫 Lịch giảng dạy</Link>
                    </li>
                    <li style={navItemStyle}>
                        <Link to="/teacher/notifications" style={linkStyle}> 🔔 Thông báo</Link>
                    </li>
                </ul>
                <button onClick={() => { logout(); navigate("/login"); }} style={{marginTop: '30px', width: '100%', padding: '10px', background: '#c0392b', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px'}}>
                    Đăng xuất
                </button>
            </div>
            {/* Nội dung bên phải */}
            <div style={{ flex: 1, padding: '40px', background: '#f8f9fa' }}>
                <Routes>
                    <Route path="/" element={HomeContent} />
                    <Route path="dashboard" element={HomeContent} />
                    {/* TRUYỀN DATA VÀO ĐÂY */}
                    <Route path="schedule" element={<TeacherSchedule teacherInfo={teacherInfo} />} />
                    <Route path="notifications" element={<TeacherNotifications />} />
                </Routes>
            </div>
        </div>
    );
};
export default TeacherDashboard;