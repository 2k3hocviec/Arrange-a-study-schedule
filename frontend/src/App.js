import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import MinistryDashboard from "./pages/MinistryDashboard";
import SysAdminDashboard from "./pages/SysAdminDashboard";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right"></Toaster>
      <BrowserRouter>
        <Routes>
          {/* 1. Trang đăng nhập mặc định */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 2. Các tuyến đường cho từng vai trò (Bắt buộc có /*) */}
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/teacher/*" element={<TeacherDashboard />} />
          <Route path="/ministry/*" element={<MinistryDashboard />} />
          <Route path="/sysadmin/*" element={<SysAdminDashboard />} />

          {/* 3. Điều hướng gốc: Nếu vào localhost:3000 thì nhảy thẳng vào /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 4. Catch-all Route: Nếu gõ sai URL (VD: /abcxyz) thì cũng về /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
