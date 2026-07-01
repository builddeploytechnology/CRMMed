import api from "../axios";

// ================= GET STOCKS =================
export const getStocks = () => {
  return api.get("/stocks");
};

// ================= GET SINGLE STOCK =================
export const getStock = (id) => {
  return api.get(`/stocks/${id}`);
};

// ================= CREATE STOCK =================
export const createStock = (data) => {
  return api.post("/stocks", data);
};

// ================= UPDATE STOCK =================
export const updateStock = (id, data) => {
  return api.put(`/stocks/${id}`, data);
};

// ================= DELETE STOCK =================
export const deleteStock = (id) => {
  return api.delete(`/stocks/${id}`);
};