import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ← Bắt buộc để cookie refresh_token được gửi kèm
});

// ─── Biến theo dõi trạng thái đang refresh ───
// Tránh trường hợp nhiều request cùng lúc đều gọi /auth/refresh
let isRefreshing = false;
let pendingQueue = []; // Các request đang chờ access token mới

const processPendingQueue = (error, token = null) => {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  pendingQueue = [];
};

// ─── REQUEST INTERCEPTOR: gắn access token vào mọi request ───
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── RESPONSE INTERCEPTOR: tự động refresh khi 401 ───
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Nếu lỗi 401 và chưa thử retry lần nào
      if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          // Không retry cho chính endpoint login/refresh để tránh vòng lặp vô hạn
          !originalRequest.url.includes("/auth/login") &&
          !originalRequest.url.includes("/auth/refresh")
      ) {
        if (isRefreshing) {
          // Đã có request đang refresh → đưa vào hàng chờ
          return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Gọi /auth/refresh — cookie refresh_token tự động gửi kèm
          const res = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { withCredentials: true }
          );
          const newAccessToken = res.data.access_token;

          // Lưu access token mới
          localStorage.setItem("access_token", newAccessToken);

          // Thông báo cho tất cả request đang chờ
          processPendingQueue(null, newAccessToken);

          // Thực hiện lại request gốc với token mới
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token cũng hết hạn (sau 7 ngày) → logout
          processPendingQueue(refreshError, null);
          localStorage.removeItem("access_token");
          // Chuyển về login
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Các lỗi khác (400, 403, 404...) → log và reject bình thường
      const data = error.response?.data;
      console.error(data);
      console.error(data?.message);
      return Promise.reject(error);
    }
);

// ─── AUTH API ───
export const authAPI = {
  changePassword: (currentPassword, newPassword) =>
    api.patch("/auth/change-password", {
      currentPassword,
      newPassword,
    }),

  login: (email, password) => api.post("/auth/login", { email, password }),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/users/profile"),

  // OTP Forgot Password
  sendOtp: (email) => api.post("/auth/send-otp", { email }),
  verifyOtp: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  resetPasswordWithToken: (reset_token, newPassword) =>
      api.post("/auth/reset-password", { reset_token, newPassword }),
};

// ─── USERS API ───
export const usersAPI = {
  getAvailableStudents: () => {
    return api.get("/users/available-students");
  },

  getAvailableTeachers: () => {
    return api.get("/users/available-teachers");
  },

  getAll: () => api.get("/users"),
  create: ({ email, password, role, phone, address }) =>
      api.post("/users", { email, password, role, phone, address }),
  delete: (id) => api.delete(`/users/${id}`),
  update: (id, { email, password, role, phone, address }) =>
      api.patch(`/users/${id}`, { email, password, role, phone, address }),
};

export const teachersAPI = {
  getAllIds: () => {
    return api.get("/teachers/allid");
  },
  getAll: () => api.get("/teachers"),
  getMyInfo: () => api.get("/teachers/me"),
  create: ({ user_id, teacher_id, name, degree, expertise }) =>
      api.post("/teachers", { user_id, teacher_id, name, degree, expertise }),
  delete: (teacher_id) => api.delete(`/teachers/${teacher_id}`),
  update: (teacher_id, { user_id, name, degree, expertise }) =>
      api.patch(`/teachers/${teacher_id}`, { user_id, name, degree, expertise }),
  getSchedule: (teacher_id) =>
      api.get(`/teachers/teacher/${teacher_id}/courses-details`),
};

export const subjectsAPI = {
  getAllIds: () => api.get("/subjects/allid"),
  getAll: () => api.get("/subjects"),
  create: ({ subject_id, name, credits }) =>
      api.post("/subjects", { subject_id, name, credits }),
  delete: (id) => api.delete(`/subjects/${id}`),
  update: (id, { name, credits }) => api.patch(`/subjects/${id}`, { name, credits }),
};

export const roomsAPI = {
  getAll: () => api.get("/classrooms"),
  create: ({ classroom_id, capacity, type, description, status }) =>
      api.post("classrooms", { classroom_id, capacity, type, description, status }),
  delete: (classroom_id) => api.delete(`/classrooms/${classroom_id}`),
  update: (classroom_id, { capacity, type, description, status }) =>
      api.patch(`/classrooms/${classroom_id}`, { capacity, type, description, status }),
};

export const coursesAPI = {
  getAll: () => api.get("/courses"),
  create: ({ course_code, subject_id, teacher_id, capacity, required_room_type }) =>
      api.post("/courses", { course_code, subject_id, teacher_id, capacity, required_room_type }),
  delete: (course_id) => api.delete(`/courses/${course_id}`),
  update: (course_id, { course_code, subject_id, teacher_id, capacity, required_room_type }) =>
      api.patch(`/courses/${course_id}`, { course_code, subject_id, teacher_id, capacity, required_room_type }),
  getInfoCourse: () => api.get("/courses/student"),
};

export const schedulesAPI = {
  getAll: () => api.get("/schedules"),
  create: ({ course_id, classroom_id, dayOfWeek, start_slot, end_slot, start_date, end_date }) =>
      api.post("/schedules", { course_id, classroom_id, dayOfWeek, start_slot, end_slot, start_date, end_date }),
  delete: (schedule_id) => api.delete(`/schedules/${schedule_id}`),
  update: (schedule_id, { course_id, classroom_id, dayOfWeek, start_slot, end_slot, start_date, end_date }) =>
      api.patch(`/schedules/${schedule_id}`, { course_id, classroom_id, dayOfWeek, start_slot, end_slot, start_date, end_date }),
};

export const studentsAPI = {
  getAll: () => api.get("/students"),
  create: ({ user_id, student_id, name }) =>
      api.post("/students", { student_id, name, user_id }),
  delete: (student_id) => api.delete(`/students/${student_id}`),
  update: (student_id, { user_id, name }) =>
      api.patch(`/students/${student_id}`, { user_id, name }),
  getByUserId: (user_id) => api.get(`/students/by-user/${user_id}`),
  getMe: () => api.get("/students/me"),
};

export const enrollmentsAPI = {
  getAll: () => api.get("/enrollments"),
  create: ({ student_id, course_id }) =>
      api.post("/enrollments", { student_id, course_id }),
  getByStudentId: (student_id) =>
      api.get(`/enrollments/student/${student_id}`),
  getCoursesWithDetails: (student_id) =>
      api.get(`/enrollments/student/${student_id}/courses-details`),
  delete: ({ student_id, course_id }) =>
      api.delete(`/enrollments/del`, { data: { student_id, course_id } }),
  getStudentCoursesWithDetails: (student_id) =>
      api.get(`/enrollments/student/${student_id}/courses-details`),
};

export default api;
