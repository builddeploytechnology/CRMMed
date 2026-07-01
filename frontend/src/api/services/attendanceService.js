import API from "../axios";

export const getAttendance = () =>
  API.get("/attendance");

export const loginAttendance = () =>
  API.post("/attendance/login");

export const logoutAttendance = () =>
  API.post("/attendance/logout");