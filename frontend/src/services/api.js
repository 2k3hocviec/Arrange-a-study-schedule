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
    console.log(teacher_id);

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
  create: ({ subject_id, name, credits }) => {
    return api.post("classrooms", {
      subject_id,
      name,
      credits,
    });
  },
  delete: (id) => {
    return api.delete(`/classrooms/${id}`);
  },
  update: (id, { subject_code, subject_name, credits }) => {
    return api.patch(`/classrooms/${id}`, {
      subject_code,
      subject_name,
      credits,
    });
  },
};

export default api;
