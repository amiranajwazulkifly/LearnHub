import { ROLES, type UserRole } from "./roles";

export const ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",

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
    TIMETABLE: "/student/timetable",
    ANNOUNCEMENTS: "/student/announcements",
  },
} as const;

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === ROLES.ADMIN) {
    return ROUTES.ADMIN.DASHBOARD;
  }

  if (role === ROLES.STUDENT) {
    return ROUTES.STUDENT.DASHBOARD;
  }

  return ROUTES.LOGIN;
}
