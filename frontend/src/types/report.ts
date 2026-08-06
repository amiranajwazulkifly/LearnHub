// Dzul

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
}

export interface RecentActivityItem {
  id: number;
  enrolled_at: string;
  student_name: string;
  course_title: string;
}

export interface EnrollmentTrendPoint {
  date: string;
  count: number;
}

export interface CoursePopularityItem {
  id: number;
  title: string;
  enrollmentCount: number;
}

export interface CompletionRateItem {
  id: number;
  title: string;
  total: number;
  completed: number;
  completionRate: number;
}
