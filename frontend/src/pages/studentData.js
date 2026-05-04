export const STUDENT_ID = "N23DCCN001";
export const MAX_CREDITS = 18;
export const REGISTRATION_OPEN = true;

export const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
export const slots = ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5", "Tiết 6", "Tiết 7", "Tiết 8", "Tiết 9", "Tiết 10"];

export const availableCourses = [
  {
    id: "BAS1203",
    name: "Lập trình Java",
    credits: 3,
    teacher: "Nguyễn Văn A",
    room: "A2-301",
    day: "Thứ 2",
    startSlot: 1,
    endSlot: 3,
    capacity: 60,
    registered: 42,
    semester: "HK2 2025-2026",
  },
  {
    id: "INT1306",
    name: "Cấu trúc dữ liệu và giải thuật",
    credits: 3,
    teacher: "Trần Thị B",
    room: "A2-502",
    day: "Thứ 4",
    startSlot: 6,
    endSlot: 8,
    capacity: 55,
    registered: 51,
    semester: "HK2 2025-2026",
  },
  {
    id: "INT1414",
    name: "Cơ sở dữ liệu",
    credits: 3,
    teacher: "Lê Minh C",
    room: "A3-205",
    day: "Thứ 3",
    startSlot: 1,
    endSlot: 3,
    capacity: 50,
    registered: 50,
    semester: "HK2 2025-2026",
  },
  {
    id: "INT1434",
    name: "Mạng máy tính",
    credits: 3,
    teacher: "Phạm Quốc D",
    room: "A2-401",
    day: "Thứ 2",
    startSlot: 2,
    endSlot: 4,
    capacity: 45,
    registered: 32,
    semester: "HK2 2025-2026",
  },
  {
    id: "SKD1101",
    name: "Kỹ năng mềm",
    credits: 2,
    teacher: "Hoàng Thị E",
    room: "B1-102",
    day: "Thứ 6",
    startSlot: 7,
    endSlot: 8,
    capacity: 80,
    registered: 36,
    semester: "HK2 2025-2026",
  },
];

export const defaultRegisteredIds = ["BAS1203", "INT1306"];

export const notifications = [
  {
    id: 1,
    title: "Thông báo mở đăng ký học phần",
    description: "Sinh viên được đăng ký môn học trong thời gian hệ thống mở. Vui lòng kiểm tra trùng lịch trước khi xác nhận.",
    time: "04/05/2026 08:00",
    type: "system",
  },
  {
    id: 2,
    title: "Thay đổi phòng học môn Lập trình Java",
    description: "Môn Lập trình Java chuyển sang phòng A2-301 từ tuần này.",
    time: "03/05/2026 15:30",
    type: "course",
    courseId: "BAS1203",
  },
  {
    id: 3,
    title: "Nhắc lịch học",
    description: "Bạn có lịch học Cấu trúc dữ liệu và giải thuật vào Thứ 4, tiết 6-8.",
    time: "02/05/2026 19:00",
    type: "course",
    courseId: "INT1306",
  },
];

export const formatTime = (course) => `${course.day} (Tiết ${course.startSlot}-${course.endSlot})`;

export const hasTimeConflict = (course, registeredCourses) =>
  registeredCourses.some(
    (item) =>
      item.day === course.day &&
      Math.max(item.startSlot, course.startSlot) <= Math.min(item.endSlot, course.endSlot),
  );
