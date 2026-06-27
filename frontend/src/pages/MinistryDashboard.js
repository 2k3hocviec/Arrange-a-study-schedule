import React, { useContext, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import MinistrySchedule from "./MinistrySchedule";
import MinistryRooms from "./MinistryRooms";
import MinistryTeachers from "./MinistryTeachers";
import MinistrySubjectsAndCourses from "./MinistrySubjectsAndCourses";
import MinistryStudents from "./MinistryStudent";
import MinistryStudentClasses from "./MinistryStudentClasses";
import MinistryDepartments from "./MinistryDepartments";
import MinistryMajors from "./MinistryMajors";
import MinistryEnrollments from "./MinistryEnrollments";
import MinistrySemesters from "./MinistrySemesters";
import MinistryTeacherBusySchedules from "./MinistryTeacherBusySchedules";
import { PiStudentDuotone } from "react-icons/pi";
import { MdMeetingRoom, MdSubject, MdDashboard } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { GiTeacher } from "react-icons/gi";
import { FiLogOut } from "react-icons/fi";
import { RiLuggageDepositLine } from "react-icons/ri";
import {
  coursesAPI,
  departmentsAPI,
  majorsAPI,
  roomsAPI,
  semestersAPI,
  studentClassesAPI,
  studentsAPI,
  subjectsAPI,
  teachersAPI,
} from "../services/api";
import { GrSchedule } from "react-icons/gr";
import toast from "react-hot-toast";
import { FaLock } from "react-icons/fa";
import ChangePassword from "./ChangePassword";
import { AuthContext } from "../contexts/AuthContext";

// ── inject global CSS once ────────────────────────────────────
import "../styles/MinistryDashboard.css";
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Be Vietnam Pro', sans-serif;
    background: #f4f5f9;
  }

  /* SIDEBAR */
  .edu-sidebar {
    width: 260px;
    min-width: 260px;
    background: #1a1625;
    border-right: 1px solid #2a2438;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    z-index: 200;
    position: relative;
    box-shadow: 4px 0 24px rgba(0,0,0,0.18);
  }

  .edu-sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.55);
    backdrop-filter: blur(2px);
    z-index: 190;
  }

  @media (max-width: 768px) {
    .edu-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      transform: translateX(-100%);
    }

    .edu-sidebar.open {
      transform: translateX(0);
    }

    .edu-sidebar-overlay.open {
      display: block;
    }

    .edu-topbar-hamburger {
      display: flex !important;
    }
  }

  /* NAVIGATION */
  .edu-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border-radius: 12px;
    margin: 4px 14px;
    color: #9fa0a6;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.22s ease;
    cursor: pointer;
  }

  .edu-nav-item svg {
    transition: 0.2s;
  }

  .edu-nav-item:hover {
    background: rgba(255,255,255,0.06);
    color: #ffffff;
    transform: translateX(3px);
  }

  .edu-nav-item.active {
    background: linear-gradient(
      135deg,
      rgba(99,102,241,0.22),
      rgba(139,92,246,0.18)
    );
    color: #a5b4fc;
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(99,102,241,0.15);
  }

  .edu-nav-item.active svg {
    color: #818cf8;
  }

  /* LOGOUT BUTTON */
  .edu-btn-logout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    margin: 10px 14px;
    background: #4c1d24;
    color: #fca5a5;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .edu-btn-logout:hover {
    background: #5f2330;
    color: white;
  }

  /* STAT CARD */
  .edu-stat-card {
    flex: 1;
    min-width: 240px;
    background: #ffffff;
    border: 1px solid #e8eaf0;
    border-radius: 20px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 24px rgba(15,23,42,0.05);
  }

  .edu-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(15,23,42,0.08);
  }

  /* TOPBAR SEARCH */
  .edu-search-input {
    width: 100%;
    background: transparent;
    border: none;
    color: #1e293b;
    font-size: 14px;
    font-family: 'Be Vietnam Pro', sans-serif;
  }

  .edu-search-input::placeholder {
    color: #94a3b8;
  }

  .edu-search-input:focus {
    outline: none;
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 20px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* MOBILE */
  @media (max-width: 480px) {
    .edu-stat-card {
      min-width: 100%;
    }

    .edu-topbar-search {
      display: none !important;
    }
  }
`;
if (
  typeof document !== "undefined" &&
  !document.getElementById("edu-ministry-styles")
) {
  const style = document.createElement("style");
  style.id = "edu-ministry-styles";
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

// ── Thứ tự danh mục quản lý ───────────────────────────────────
const NAV_ITEMS = [
  {
    path: "semesters",
    label: "Kỳ học",
    Icon: GrSchedule,
  },
  {
    path: "departments",
    label: "Khoa",
    Icon: RiLuggageDepositLine,
  },
  {
    path: "majors",
    label: "Chuyên ngành",
    Icon: MdSubject,
  },
  {
    path: "student-classes",
    label: "Lớp học",
    Icon: PiStudentDuotone,
  },
  {
    path: "students",
    label: "Sinh viên",
    Icon: PiStudentDuotone,
  },
  {
    path: "teachers",
    label: "Giảng viên",
    Icon: GiTeacher,
  },
  {
    path: "teacher-busy-schedules",
    label: "Duyệt lịch bận",
    Icon: IoCalendar,
  },
  {
    path: "rooms",
    label: "Phòng học",
    Icon: MdMeetingRoom,
  },
  {
    path: "subjects",
    label: "Môn học & Khóa học",
    Icon: MdSubject,
  },
  {
    path: "schedule",
    label: "Lịch học",
    Icon: IoCalendar,
  },

  {
    path: "enrollments",
    label: "Ghi danh",
    Icon: PiStudentDuotone,
  },
  {
    path: "change-password",
    label: "Đổi mật khẩu",
    Icon: FaLock,
  },
];
const STAT_ICONS = {
  students: {
    color: "#4f46e5",
    bg: "#e0e7ff",
    svg: <PiStudentDuotone size={22} color="#4f46e5" />,
  },
  teachers: {
    color: "#16a34a",
    bg: "#dcfce7",
    svg: <GiTeacher size={22} color="#16a34a" />,
  },
  departments: {
    color: "#9333ea",
    bg: "#f3e8ff",
    svg: <MdDashboard size={22} color="#9333ea" />,
  },
  majors: {
    color: "#7c3aed",
    bg: "#ede9fe",
    svg: <MdSubject size={22} color="#7c3aed" />,
  },
  subjects: {
    color: "#6366f1",
    bg: "#ede9fe",
    svg: <MdSubject size={22} color="#6366f1" />,
  },
  courses: {
    color: "#f97316",
    bg: "#ffedd5",
    svg: <GrSchedule size={22} color="#f97316" />,
  },
  rooms: {
    color: "#0ea5e9",
    bg: "#e0f2fe",
    svg: <MdMeetingRoom size={22} color="#0ea5e9" />,
  },
  studentClasses: {
    color: "#0891b2",
    bg: "#cffafe",
    svg: <PiStudentDuotone size={22} color="#0891b2" />,
  },
  activeSemester: {
    color: "#dc2626",
    bg: "#fee2e2",
    svg: <IoCalendar size={22} color="#dc2626" />,
  },
};
const MinistryDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const fetchDashboardStats = async () => {
    try {
      const [
        studentsRes,
        teachersRes,
        departmentsRes,
        majorsRes,
        subjectsRes,
        coursesRes,
        roomsRes,
        studentClassesRes,
        semestersRes,
      ] = await Promise.all([
        studentsAPI.getAll(),
        teachersAPI.getAll(),
        departmentsAPI.getAll(),
        majorsAPI.getAll(),
        subjectsAPI.getAll(),
        coursesAPI.getAll(),
        roomsAPI.getAll(),
        studentClassesAPI.getAll(),
        semestersAPI.getAll(),
      ]);
      setStudents(studentsRes.data || []);
      setTeachers(teachersRes.data || []);
      setDepartments(departmentsRes.data || []);
      setMajors(majorsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setCourses(coursesRes.data || []);
      setRooms(roomsRes.data || []);
      setStudentClasses(studentClassesRes.data || []);
      setActiveSemester(
        (semestersRes.data || []).find((semester) => semester.is_active) ||
          null,
      );
    } catch {
      toast.error("Không thể tải dữ liệu tổng quan");
    }
  };
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  const isActive = (path) => location.pathname.split("/").includes(path);
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const HomeContent = (
    <div className="ministry-dashboard__inline-359">
      <div className="ministry-dashboard__inline-360">
        <h1 className="ministry-dashboard__inline-361">
          Chào mừng trở lại, Giáo vụ
        </h1>
        <p className="ministry-dashboard__inline-371">
          Dưới đây là tóm tắt các chỉ số cốt lõi của hệ thống.
        </p>
        <p className="ministry-dashboard__inline-374">
          Kỳ học hiện tại:{" "}
          <span className="ministry-dashboard__inline-383">
            {activeSemester
              ? `${activeSemester.name} ${activeSemester.school_year}`
              : "Chưa thiết lập"}
          </span>
        </p>
      </div>

      <div className="ministry-dashboard__inline-391">
        {[
          {
            key: "students",
            label: "SỐ LƯỢNG SINH VIÊN",
            value: students.length,
          },
          {
            key: "teachers",
            label: "SỐ LƯỢNG GIẢNG VIÊN",
            value: teachers.length,
          },
          {
            key: "departments",
            label: "SỐ LƯỢNG KHOA",
            value: departments.length,
          },
          {
            key: "majors",
            label: "SỐ LƯỢNG CHUYÊN NGÀNH",
            value: majors.length,
          },
          {
            key: "subjects",
            label: "SỐ LƯỢNG MÔN HỌC",
            value: subjects.length,
          },
          {
            key: "courses",
            label: "SỐ LƯỢNG KHÓA HỌC",
            value: courses.length,
          },
          {
            key: "rooms",
            label: "SỐ LƯỢNG PHÒNG HỌC",
            value: rooms.length,
          },
          {
            key: "studentClasses",
            label: "SỐ LƯỢNG LỚP SINH VIÊN",
            value: studentClasses.length,
          },
        ].map((stat) => (
          <div className="edu-stat-card" key={stat.key}>
            <div
              style={{
                background: STAT_ICONS[stat.key].bg,
              }}
              className="ministry-dashboard__inline-435"
            >
              {STAT_ICONS[stat.key].svg}
            </div>
            <div>
              <div className="ministry-dashboard__inline-449">{stat.label}</div>
              <div
                style={{
                  fontSize: stat.isText ? 22 : 34,
                }}
                className="ministry-dashboard__inline-461"
              >
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="ministry-dashboard__inline-479">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`edu-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar (Đã chỉnh màu theo ảnh mẫu) ── */}
      <aside className={`edu-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Nav links */}
        <nav className="ministry-dashboard__inline-498">
          <Link
            to="/ministry/dashboard"
            className={`edu-nav-item ${location.pathname === "/ministry" || location.pathname === "/ministry/dashboard" ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <MdDashboard size={18} /> Dashboard
          </Link>

          <div className="ministry-dashboard__inline-507">Truy cập nhanh</div>

          {NAV_ITEMS.map(({ path, label, Icon }) => (
            <Link
              key={path}
              to={`/ministry/${path}`}
              className={`edu-nav-item ${isActive(path) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <div className="ministry-dashboard__inline-535">
        {/* Topbar */}
        <header className="ministry-dashboard__inline-545 ministry-dashboard__inline-502">
          {/* Hamburger (Mobile) */}
          <button
            className="edu-topbar-hamburger ministry-dashboard__inline-560"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="ministry-dashboard__inline-574" />
            ))}
          </button>

          {/* Breadcrumb */}
          <div className="ministry-dashboard__inline-588">
            Dashboard Overview
          </div>
          <div className="ministry-dashboard__inline-598" />

          {/* Logout button góc phải */}
          <div
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fecaca";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fee2e2";
            }}
            className="ministry-dashboard__inline-601"
          >
            <FiLogOut size={16} /> Đăng xuất
          </div>
        </header>

        {/* Main View Router */}
        <main className="ministry-dashboard__inline-628">
          <Routes>
            <Route path="/" element={HomeContent} />
            <Route path="dashboard" element={HomeContent} />
            <Route path="subjects" element={<MinistrySubjectsAndCourses />} />
            <Route path="semesters" element={<MinistrySemesters />} />
            <Route path="schedule" element={<MinistrySchedule />} />
            <Route
              path="teacher-busy-schedules"
              element={<MinistryTeacherBusySchedules />}
            />

            <Route path="rooms" element={<MinistryRooms />} />
            <Route path="teachers" element={<MinistryTeachers />} />
            <Route
              path="student-classes"
              element={<MinistryStudentClasses />}
            />

            <Route path="departments" element={<MinistryDepartments />} />
            <Route path="majors" element={<MinistryMajors />} />
            <Route path="students" element={<MinistryStudents />} />
            <Route path="enrollments" element={<MinistryEnrollments />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
export default MinistryDashboard;
