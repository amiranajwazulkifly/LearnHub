// Dzul

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalActiveEnrollments: number;
}

export type ActivityKind = 'enrollment' | 'assignment' | 'announcement';

export interface RecentActivityItem {
  id: string;
  kind: ActivityKind;
  /** enrolled | cancelled | posted | published */
  action: string;
  occurredAt: string;
  /** Who did it — the student, instructor or administrator. */
  actor: string;
  /** Null for announcements, which aren't tied to a course. */
  courseCode: string | null;
  /** The course title, assignment title or announcement title. */
  subject: string;
}

export interface CourseCapacityItem {
  id: string;
  code: string;
  title: string;
  capacity: number;
  enrolled: number;
  seatsRemaining: number;
  isFull: boolean;
  percentFull: number;
}

export interface EnrollmentTrendPoint {
  date: string;
  count: number;
}

export interface EnrollmentTrendRange {
  days: number;
  from: string | null;
  to: string | null;
}

export interface EnrollmentTrend {
  trend: EnrollmentTrendPoint[];
  range: EnrollmentTrendRange;
}

export interface CoursePopularityItem {
  id: string;
  code: string;
  title: string;
  activeEnrollments: number;
  totalEnrollments: number;
}

export interface CompletionRateItem {
  id: string;
  code: string;
  title: string;
  total: number;
  active: number;
  completed: number;
  completionRate: number;
}

/** The CSV exports the reports API offers. */
export type ExportType =
  | 'students'
  | 'courses'
  | 'enrollments'
  | 'completion-rates'
  | 'instructor-allocation'
  | 'enrollment-trend';
