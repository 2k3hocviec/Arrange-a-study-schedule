import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SysAdminUsers from './SysAdminUsers';
import SysAdminPermissions from './SysAdminPermissions';
import SysAdminLogs from './SysAdminLogs';

const SysAdminDashboard = () => {
    const navItemStyle = { padding: '15px 10px', borderBottom: '1px solid #2d3436' };
    const linkStyle = { color: 'white', textDecoration: 'none', display: 'block', width: '100%' };
    const statCard = { flex: 1, background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '6px solid #ff4757' };

    const HomeContent = (
        <div>
            <h1 style={{ color: '#2c3e50', fontSize: '28px', marginBottom: '30px' }}>QUẢN TRỊ TỐI CAO</h1>
            <div style={{ display: 'flex', gap: '25px', marginTop: '30px' }}>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#ff4757' }}>1,250</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>User trực tuyến</p></div>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#ff4757' }}>99.9%</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Server Status</p></div>
                <div style={statCard}><h2 style={{ margin: 0, fontSize: '32px', color: '#ff4757' }}>0</h2><p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Cảnh báo</p></div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ width: '260px', background: '#1a0f0f', color: 'white', padding: '20px' }}>
                <h2 style={{ textAlign: 'center', color: '#ff4757', marginBottom: '30px' }}>QT HỆ THỐNG</h2>
                <hr style={{ borderColor: '#2d3436' }}/>
                <nav><ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={navItemStyle}><Link to="/sysadmin/users" style={linkStyle}>👤 Quản lý người dùng</Link></li>
                    <li style={navItemStyle}><Link to="/sysadmin/permissions" style={linkStyle}>🔐 Phân quyền</Link></li>
                    <li style={navItemStyle}><Link to="/sysadmin/logs" style={linkStyle}>📋 Nhật ký</Link></li>
                </ul></nav>
                <button onClick={() => window.location.href='/login'} style={{marginTop: '40px', width: '100%', padding: '12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold'}}>Đăng xuất</button>
            </div>
            <div style={{ flex: 1, padding: '40px', background: '#f8f9fa' }}>
                <Routes><Route path="/" element={HomeContent} /><Route path="dashboard" element={HomeContent} />
                    <Route path="users" element={<SysAdminUsers />} /><Route path="permissions" element={<SysAdminPermissions />} />
                    <Route path="logs" element={<SysAdminLogs />} /></Routes>
            </div>
        </div>
    );
};
export default SysAdminDashboard;