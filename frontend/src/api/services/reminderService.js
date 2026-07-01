import API from "../axios";

export const getReminders = () =>
  API.get("/reminders");

export const markDone = (id) =>
  API.post(`/reminders/${id}/done`);