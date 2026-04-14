import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SysAdminDashboard from './pages/SysAdminDashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Trang đăng nhập mặc định */}
                <Route path="/login" element={<Login />} />

                {/* 2. Các tuyến đường cho từng vai trò (Bắt buộc có /*) */}
                <Route path="/student/*" element={<StudentDashboard />} />
                <Route path="/teacher/*" element={<TeacherDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/sysadmin/*" element={<SysAdminDashboard />} />

                {/* 3. Điều hướng gốc: Nếu vào localhost:3000 thì nhảy thẳng vào /login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* 4. Catch-all Route: Nếu gõ sai URL (VD: /abcxyz) thì cũng về /login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;