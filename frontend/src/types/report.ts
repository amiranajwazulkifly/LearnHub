// Dzul

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalActiveEnrollments: number;
}

export interface RecentActivityItem {
  id: string;
  studentName: string;
  courseTitle: string;
  status: string;
  enrolledAt: string;
}

export interface EnrollmentTrendPoint {
  date: string;
  count: number;
}

export interface CoursePopularityItem {
  id: string;
  title: string;
  activeEnrollments: number;
  totalEnrollments: number;
}

export interface CompletionRateItem {
  id: string;
  title: string;
  total: number;
  completed: number;
  completionRate: number;
}
