export interface Schedule {
  id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  start_date: string;
  end_date: string;

  course_title?: string;
  course_code?: string;

  created_at?: string;
  updated_at?: string;
}
