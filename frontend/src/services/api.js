import axios from "axios";

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
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (email, password, name) =>
    api.post("/auth/register", { email, password, name }),
  getProfile: () => api.get("/users/profile"),
};

export const usersAPI = {
  getAll: () => api.get("/users"),
  create: ({ email, password, role, phone, address }) => {
    api.post("/users", { email, password, role, phone, address });
  },
  delete: (id) => {
    api.delete(`/users/${id}`);
  },
  update: (id, { email, password, role, phone, address }) =>
    api.patch(`/users/${id}`, { email, password, role, phone, address }),
};

export const teachersAPI = {
  getAll: () => api.get("/teachers"),
  create: ({ user_id, teacher_id, name, degree, expertise }) => {
    api.post("/teachers", {
      user_id,
      teacher_id,
      name,
      degree,
      expertise,
    });
  },
  delete: (teacher_id) => {
    api.delete(`/teachers/${teacher_id}`);
  },
  update: (teacher_id, { user_id, name, degree, expertise }) => {
    api.patch(`/teachers/${teacher_id}`, { user_id, name, degree, expertise });
  },
};

export const subjectsAPI = {
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
  create: ({ subject_id, teacher_id }) => {
    return api.post("/courses", {
      subject_id,
      teacher_id,
    });
  },
  delete: (course_id) => {
    return api.delete(`/courses/${course_id}`);
  },
  update: (course_id, { subject_id, teacher_id }) => {
    return api.patch(`/courses/${course_id}`, { subject_id, teacher_id });
  },
};

export const schedulesAPI = {
  getAll: () => api.get("/schedules"),
  create: ({ course_id, room_id, dayOfWeek, start_slot, end_slot }) => {
    return api.post("/schedules", {
      course_id,
      room_id,
      dayOfWeek,
      start_slot,
      end_slot,
    });
  },
  delete: (schedule_id) => {
    return api.delete(`/schedules/${schedule_id}`);
  },
  update: (
    schedule_id,
    { course_id, room_id, dayOfWeek, start_slot, end_slot },
  ) => {
    return api.patch(`/schedules/${schedule_id}`, {
      course_id,
      room_id,
      dayOfWeek,
      start_slot,
      end_slot,
    });
  },
};

export default api;
