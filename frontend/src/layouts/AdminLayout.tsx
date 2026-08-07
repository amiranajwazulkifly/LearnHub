import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { ROUTES } from "../constants/routes";

const adminNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.ADMIN.DASHBOARD,
    end: true,
  },
  {
    label: "Profile",
    path: ROUTES.ADMIN.PROFILE,
  },
  {
    label: "Courses",
    path: ROUTES.ADMIN.COURSES,
  },
  {
    label: "Categories",
    path: ROUTES.ADMIN.CATEGORIES,
  },
  {
    label: "Instructors",
    path: ROUTES.ADMIN.INSTRUCTORS,
  },
  {
    label: "Schedules",
    path: ROUTES.ADMIN.SCHEDULES,
  },
] as const;

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar portalName="Admin Portal" />

      <div className="flex flex-col md:flex-row">
        <Sidebar items={adminNavigation} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
