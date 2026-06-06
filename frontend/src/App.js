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
            <Toaster
                position="top-right"
                containerStyle={{ zIndex: 100000 }}
                toastOptions={{
                    style: {
                        zIndex: 100000,
                        background: "#fff",
                        color: "#1e293b",
                        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.22)",
                    },
                }}
            />
            <BrowserRouter>
                <Routes>
                    {/* Auth */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Dashboards theo role */}
                    <Route path="/student/*" element={<StudentDashboard />} />
                    <Route path="/teacher/*" element={<TeacherDashboard />} />
                    <Route path="/ministry/*" element={<MinistryDashboard />} />
                    <Route path="/sysadmin/*" element={<SysAdminDashboard />} />

                    {/* Fallback */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
