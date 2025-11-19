import axios from "axios";

const API_BASE_URL = "https://expensesapi-8mfd.onrender.com/api";
const CATEGORYAPI_BASE_URL = "https://expensesapi-8mfd.onrender.com/api";

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

export const expenseApi = {
  getAll: () => expenseapi.get("/expenses"),
  create: (data: any) => expenseapi.post("/expenses", data),
  delete: (id: number) => expenseapi.delete(`/expenses/${id}`),
  update: (id: number, data: any) => expenseapi.put(`/expenses/${id}`, data),
};

export const categoryApi = {
  getAll: () => categoryapi.get("/categories"),
  create: (data: any) => categoryapi.post("/categories", data),
  delete: (id: number) => categoryapi.delete(`/categories/${id}`),
  update: (id: number, data: any) => categoryapi.put(`/categories/${id}`, data),
};
