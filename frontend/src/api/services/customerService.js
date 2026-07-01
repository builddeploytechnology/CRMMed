import API from "../axios";

export const getCustomers = (params) =>
  API.get("/customers", { params });

export const createCustomer = (data) =>
  API.post("/customers", data);

export const deleteCustomer = (id) =>
  API.delete(`/customers/${id}`);