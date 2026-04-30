import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

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
  // create: ({ email, password, role, phone, address }) => {
  //   api.post("/users", { email, password, role, phone, address });
  // },
  // delete: (id) => {
  //   api.delete(`/users/${id}`);
  // },
  // update: (id, { email, password, role, phone, address }) =>
  //   api.patch(`/users/${id}`, { email, password, role, phone, address }),
};

export default api;
