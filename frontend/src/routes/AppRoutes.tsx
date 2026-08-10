import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getDefaultRouteForRole, ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";

import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import InstructorLayout from "../layouts/InstructorLayout";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import CoursesPage from "../pages/admin/CoursesPage";
import InstructorsPage from "../pages/admin/InstructorsPage";
import SchedulesPage from "../pages/admin/SchedulesPage";
import CourseFormPage from "../pages/admin/CourseFormPage";
import StudentsPage from "../pages/admin/StudentsPage";
import StudentDetailsPage from "../pages/admin/StudentDetailsPage";
import EnrollmentsPage from "../pages/admin/EnrollmentsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import AnnouncementsPage from "../pages/admin/AnnouncementsPage";
import AnnouncementFormPage from "../pages/admin/AnnouncementFormPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import BrowseCoursesPage from "../pages/student/BrowseCoursesPage";
import CourseDetailsPage from "../pages/student/CourseDetailsPage";
import MyCoursesPage from "../pages/student/MyCoursesPage";
import ProfilePage from "../pages/student/ProfilePage";
import TimetablePage from "../pages/student/TimetablePage";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentAnnouncementsPage from "../pages/student/StudentAnnouncementsPage";

import InstructorDashboardPage from "../pages/instructor/InstructorDashboardPage";
import InstructorCoursesPage from "../pages/instructor/InstructorCoursesPage";
import InstructorCourseStudentsPage from "../pages/instructor/InstructorCourseStudentsPage";
import InstructorProfilePage from "../pages/instructor/InstructorProfilePage";

import { useAuthStore } from "../store/useAuthStore";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <div>Loading LearnHub...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}

function AppRoutes() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return (
    <Routes>
      {/* Home */}
      <Route path={ROUTES.HOME} element={<RootRedirect />} />

      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Admin */}
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route
              path={ROUTES.ADMIN.DASHBOARD}
              element={<AdminDashboardPage />}
            />

            <Route path={ROUTES.ADMIN.PROFILE} element={<AdminProfilePage />} />

            <Route path={ROUTES.ADMIN.COURSES} element={<CoursesPage />} />
            <Route path="/admin/courses/create" element={<CourseFormPage />} />
            <Route path="/admin/courses/:id/edit" element={<CourseFormPage />} />
            <Route
              path={ROUTES.ADMIN.CATEGORIES}
              element={<CategoriesPage />}
            />

            <Route
              path={ROUTES.ADMIN.INSTRUCTORS}
              element={<InstructorsPage />}
            />

            <Route path={ROUTES.ADMIN.SCHEDULES} element={<SchedulesPage />} />

            <Route path={ROUTES.ADMIN.STUDENTS} element={<StudentsPage />} />
            <Route
              path={`${ROUTES.ADMIN.STUDENTS}/:id`}
              element={<StudentDetailsPage />}
            />

            <Route
              path={ROUTES.ADMIN.ENROLLMENTS}
              element={<EnrollmentsPage />}
            />

            <Route path={ROUTES.ADMIN.REPORTS} element={<ReportsPage />} />

            <Route
              path={ROUTES.ADMIN.ANNOUNCEMENTS}
              element={<AnnouncementsPage />}
            />
            <Route
              path={`${ROUTES.ADMIN.ANNOUNCEMENTS}/new`}
              element={<AnnouncementFormPage />}
            />
            <Route
              path={`${ROUTES.ADMIN.ANNOUNCEMENTS}/:id/edit`}
              element={<AnnouncementFormPage />}
            />
          </Route>
        </Route>

        {/* Student */}
        <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route element={<StudentLayout />}>
            <Route
              path={ROUTES.STUDENT.DASHBOARD}
              element={<StudentDashboardPage />}
            />

            <Route path={ROUTES.STUDENT.PROFILE} element={<ProfilePage />} />

            <Route
              path={ROUTES.STUDENT.COURSES}
              element={<BrowseCoursesPage />}
            />

            <Route
              path={`${ROUTES.STUDENT.COURSES}/:id`}
              element={<CourseDetailsPage />}
            />

            <Route
              path={ROUTES.STUDENT.MY_COURSES}
              element={<MyCoursesPage />}
            />

            <Route
              path={ROUTES.STUDENT.TIMETABLE}
              element={<TimetablePage />}
            />

            <Route
              path={ROUTES.STUDENT.ANNOUNCEMENTS}
              element={<StudentAnnouncementsPage />}
            />
          </Route>
        </Route>

        {/* Instructor */}
        <Route element={<RoleRoute allowedRoles={[ROLES.INSTRUCTOR]} />}>
          <Route element={<InstructorLayout />}>
            <Route
              path={ROUTES.INSTRUCTOR.DASHBOARD}
              element={<InstructorDashboardPage />}
            />

            <Route
              path={ROUTES.INSTRUCTOR.PROFILE}
              element={<InstructorProfilePage />}
            />

            <Route
              path={ROUTES.INSTRUCTOR.COURSES}
              element={<InstructorCoursesPage />}
            />

            <Route
              path={`${ROUTES.INSTRUCTOR.COURSES}/:courseId/students`}
              element={<InstructorCourseStudentsPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default AppRoutes;
