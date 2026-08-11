import { ROLES, type UserRole } from "./roles";

export const ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  ADMIN: {
    DASHBOARD: "/admin",
    PROFILE: "/admin/profile",
    COURSES: "/admin/courses",
    CATEGORIES: "/admin/categories",
    INSTRUCTORS: "/admin/instructors",
    SCHEDULES: "/admin/schedules",
    STUDENTS: "/admin/students",
    ENROLLMENTS: "/admin/enrollments",
    REPORTS: "/admin/reports",
    ANNOUNCEMENTS: "/admin/announcements",
  },

  STUDENT: {
    DASHBOARD: "/student",
    PROFILE: "/student/profile",
    COURSES: "/student/courses",
    MY_COURSES: "/student/my-courses",
    TIMETABLE: "/student/timetable",
    ANNOUNCEMENTS: "/student/announcements",
    TASKS: "/student/tasks",
  },

  INSTRUCTOR: {
    DASHBOARD: "/instructor",
    PROFILE: "/instructor/profile",
    COURSES: "/instructor/courses",
    ASSIGNMENTS: "/instructor/assignments",
  },
} as const;

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === ROLES.ADMIN) {
    return ROUTES.ADMIN.DASHBOARD;
  }

  if (role === ROLES.STUDENT) {
    return ROUTES.STUDENT.DASHBOARD;
  }

  if (role === ROLES.INSTRUCTOR) {
    return ROUTES.INSTRUCTOR.DASHBOARD;
  }

  return ROUTES.LOGIN;
}
