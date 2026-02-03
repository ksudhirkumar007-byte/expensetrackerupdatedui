import axios from "axios";
import { authStorage } from "./auth";

const API_BASE_URL = "http://xpenss.in/api";
const CATEGORYAPI_BASE_URL = "http://xpenss.in/api";
const AUTH_BASE_URL = "http://xpenss.in/auth";

export const authapi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const expenseapi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const categoryapi = axios.create({
  baseURL: CATEGORYAPI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptors
[expenseapi, categoryapi].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

export const authApi = {
  login: (email: string, passwordHash: string) => authapi.post("/login", { email, passwordHash }),
  refresh: (refreshToken: string) => authapi.post("/refresh", { refreshToken }),
  // Register a new user. Accepts an object with at least `email` and `password`.
  // Backend may accept additional fields like `name` — pass them through.
  signup: (data: { email: string; password: string; name?: string }) => authapi.post("/register", data),
};

export const expenseApi = {
  getAll: (month?: string) => {
    return month ? expenseapi.get(`/expenses/month/${month}`) : expenseapi.get("/expenses");
  },
  create: (data: any) => expenseapi.post("/expenses", data),
  delete: (id: number) => expenseapi.delete(`/expenses/${id}`),
  update: (id: number, data: any) => expenseapi.put(`/expenses/${id}`, data),
};

export const categoryApi = {
  getAll: () => categoryapi.get("/categories/"),
  create: (data: any) => categoryapi.post("/categories/", data),
  delete: (id: number) => categoryapi.delete(`/categories/${id}`),
  update: (id: number, data: any) => categoryapi.put(`/categories/${id}`, data),
  bulkUpdateMonth: (month: string) => categoryapi.put("/categories/bulk-update-month", { month }),
  summariseMonth: (month: string) => categoryapi.post("/categories/summarise-categories", { month }),
  summarisedRecords: (month: string) => categoryapi.get(`/categories/summarisedcategories/month/${month}`),
  summarisedCategories: (category: string) => categoryapi.get(`/categories/summarisedcategories/category/${category}`)
};
