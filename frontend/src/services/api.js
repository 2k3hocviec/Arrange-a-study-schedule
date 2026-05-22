import axios from "axios";

// const API_URL = "http://192.168.1.227:8000";
const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    console.error(data);

    console.error(data?.message);

    return Promise.reject(error);
  },
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authAPI = {
  changePassword: (currentPassword, newPassword) =>
    api.patch("/auth/change-password", {
      currentPassword,
      newPassword,
    }),

  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (email, password, name) =>
    api.post("/auth/register", { email, password, name }),
  getProfile: () => api.get("/users/profile"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),
};

export const usersAPI = {
  getAvailableStudents: () => {
    return api.get("/users/available-students");
  },

  getAvailableTeachers: () => {
    return api.get("/users/available-teachers");
  },

  getAll: () => api.get("/users"),
  create: ({ email, password, role, phone, address }) => {
    return api.post("/users", { email, password, role, phone, address });
  },
  delete: (id) => {
    return api.delete(`/users/${id}`);
  },
  update: (id, { email, password, role, phone, address }) =>
    api.patch(`/users/${id}`, { email, password, role, phone, address }),
};

export const teachersAPI = {
  getAllIds: () => {
    return api.get("/teachers/allid");
  },
  getAll: () => api.get("/teachers"),
  getMyInfo: () => api.get("/teachers/me"),
  create: ({ user_id, teacher_id, name, degree, expertise }) => {
    return api.post("/teachers", {
      user_id,
      teacher_id,
      name,
      degree,
      expertise,
    });
  },
  delete: (teacher_id) => {
    return api.delete(`/teachers/${teacher_id}`);
  },
  update: (teacher_id, { user_id, name, degree, expertise }) => {
    return api.patch(`/teachers/${teacher_id}`, {
      user_id,
      name,
      degree,
      expertise,
    });
  },
  getSchedule: (teacher_id) =>
    api.get(`/teachers/teacher/${teacher_id}/courses-details`),
};

export const subjectsAPI = {
  getAllIds: () => api.get("/subjects/allid"),
  getAll: () => api.get("/subjects"),
  create: ({ subject_id, name, credits }) => {
    return api.post("/subjects", {
      subject_id,
      name,
      credits,
    });
  },
  delete: (id) => {
    return api.delete(`/subjects/${id}`);
  },
  update: (id, { name, credits }) => {
    return api.patch(`/subjects/${id}`, {
      name,
      credits,
    });
  },
};

export const roomsAPI = {
  getAll: () => api.get("/classrooms"),
  create: ({ classroom_id, capacity, type, description, status }) => {
    return api.post("classrooms", {
      classroom_id,
      capacity,
      type,
      description,
      status,
    });
  },
  delete: (classroom_id) => {
    return api.delete(`/classrooms/${classroom_id}`);
  },
  update: (classroom_id, { capacity, type, description, status }) => {
    return api.patch(`/classrooms/${classroom_id}`, {
      capacity,
      type,
      description,
      status,
    });
  },
};

export const coursesAPI = {
  getAll: () => api.get("/courses"),
  create: ({ subject_id, teacher_id, capacity }) => {
    return api.post("/courses", {
      subject_id,
      teacher_id,
      capacity,
    });
  },
  delete: (course_id) => {
    return api.delete(`/courses/${course_id}`);
  },
  update: (course_id, { subject_id, teacher_id, capacity }) => {
    return api.patch(`/courses/${course_id}`, {
      subject_id,
      teacher_id,
      capacity,
    });
  },

  getInfoCourse: () => api.get("/courses/student"),
};

export const schedulesAPI = {
  getAll: () => api.get("/schedules"),
  create: ({
    course_id,
    classroom_id,
    dayOfWeek,
    start_slot,
    end_slot,
    start_date,
    end_date,
  }) => {
    return api.post("/schedules", {
      course_id,
      classroom_id,
      dayOfWeek,
      start_slot,
      end_slot,
      start_date,
      end_date,
    });
  },
  delete: (schedule_id) => {
    return api.delete(`/schedules/${schedule_id}`);
  },
  update: (
    schedule_id,
    {
      course_id,
      classroom_id,
      dayOfWeek,
      start_slot,
      end_slot,
      start_date,
      end_date,
    },
  ) => {
    return api.patch(`/schedules/${schedule_id}`, {
      course_id,
      classroom_id,
      dayOfWeek,
      start_slot,
      end_slot,
      start_date,
      end_date,
    });
  },
};

export const studentsAPI = {
  getAll: () => api.get("/students"),
  create: ({ user_id, student_id, name }) => {
    return api.post("/students", {
      student_id,
      name,
      user_id,
    });
  },
  delete: (student_id) => {
    return api.delete(`/students/${student_id}`);
  },
  update: (student_id, { user_id, name }) => {
    return api.patch(`/students/${student_id}`, { user_id, name });
  },

  getByUserId: (user_id) => api.get(`/students/by-user/${user_id}`),

  getMe: () => api.get("/students/me"),
};

export const enrollmentsAPI = {
  getAll: () => {
    return api.get("/enrollments"); // Phù hợp với @Get() của bạn
  },
  create: ({ student_id, course_id }) => {
    return api.post("/enrollments", { student_id, course_id });
  },
  getByStudentId: (student_id) => {
    return api.get(`/enrollments/student/${student_id}`);
  },
  getCoursesWithDetails: (student_id) => {
    return api.get(`/enrollments/student/${student_id}/courses-details`);
  },
  delete: ({ student_id, course_id }) => {
    return api.delete(`/enrollments/del`, { data: { student_id, course_id } });
  },
  // THÊM DÒNG NÀY VÀO ĐÂY:
  getStudentCoursesWithDetails: (student_id) =>
    api.get(`/enrollments/student/${student_id}/courses-details`),
};

export default api;
