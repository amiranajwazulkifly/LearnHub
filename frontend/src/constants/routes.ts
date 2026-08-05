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
