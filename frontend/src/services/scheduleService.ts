import api from "./api";
import type { Schedule } from "../types/schedule";

export const getSchedules = async (): Promise<Schedule[]> => {
  const response = await api.get("/schedules");
  return response.data;
};

export const createSchedule = async (schedule: {
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  start_date: string;
  end_date: string;
}) => {
  const response = await api.post("/schedules", schedule);
  return response.data;
};

export const updateSchedule = async (
  id: string,
  schedule: {
    course_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    location: string;
    start_date: string;
    end_date: string;
  },
) => {
  const response = await api.put(`/schedules/${id}`, schedule);
  return response.data;
};

export const deleteSchedule = async (id: string) => {
  const response = await api.delete(`/schedules/${id}`);
  return response.data;
};
