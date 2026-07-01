import API from "../axios";

export const getCalls = (params) =>
  API.get("/calls", { params });

export const createCall = (data) =>
  API.post("/calls", data);

export const deleteCall = (id) =>
  API.delete(`/calls/${id}`);