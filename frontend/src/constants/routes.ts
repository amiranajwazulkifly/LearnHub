import {
  ROLES,
  type UserRole,
} from './roles';

export const ROUTES = {
  HOME: '/',

  LOGIN: '/login',
  REGISTER: '/register',

  ADMIN: {
    DASHBOARD: '/admin',
    PROFILE: '/admin/profile',
  },

  STUDENT: {
    DASHBOARD: '/student',
    PROFILE: '/student/profile',
    COURSES: '/student/courses',
    TIMETABLE: '/student/timetable',
  },
} as const;

export function getDefaultRouteForRole(
  role: UserRole
): string {
  if (role === ROLES.ADMIN) {
    return ROUTES.ADMIN.DASHBOARD;
  }

  if (role === ROLES.STUDENT) {
    return ROUTES.STUDENT.DASHBOARD;
  }

  return ROUTES.LOGIN;
}
