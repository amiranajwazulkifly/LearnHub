import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getDefaultRouteForRole, ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";

import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";

import AdminProfilePage from "../pages/admin/AdminProfilePage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import CoursesPage from "../pages/admin/CoursesPage";
import InstructorsPage from "../pages/admin/InstructorsPage";
import SchedulesPage from "../pages/admin/SchedulesPage";
import CourseFormPage from "../pages/admin/CourseFormPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ProfilePage from "../pages/student/ProfilePage";

import { useAuthStore } from "../store/useAuthStore";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <main className="p-6">Loading LearnHub...</main>;
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
              element={<AdminProfilePage />}
            />

            <Route path={ROUTES.ADMIN.PROFILE} element={<AdminProfilePage />} />

            <Route path={ROUTES.ADMIN.COURSES} element={<CoursesPage />} />
            <Route path="/admin/courses/create" element={<CourseFormPage />} />
            <Route
              path={ROUTES.ADMIN.CATEGORIES}
              element={<CategoriesPage />}
            />

            <Route
              path={ROUTES.ADMIN.INSTRUCTORS}
              element={<InstructorsPage />}
            />

            <Route path={ROUTES.ADMIN.SCHEDULES} element={<SchedulesPage />} />
          </Route>
        </Route>

        {/* Student */}
        <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route element={<StudentLayout />}>
            <Route path={ROUTES.STUDENT.DASHBOARD} element={<ProfilePage />} />

            <Route path={ROUTES.STUDENT.PROFILE} element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default AppRoutes;
