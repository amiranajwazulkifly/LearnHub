import axiosInstance from "../api/axiosInstance";

export interface TimetableSession {
  course_id: string;
  code: string;
  title: string;
  instructor_name: string;
  schedule_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  start_date: string;
  end_date: string;
}

interface TimetableResponse {
  success: boolean;
  count: number;
  data: TimetableSession[];
}

export async function getMyTimetable(): Promise<TimetableResponse> {
  const response = await axiosInstance.get("/enrollments/timetable");

  return response.data;
}
