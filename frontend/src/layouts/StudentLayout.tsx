import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { ROUTES } from "../constants/routes";

const studentNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.STUDENT.DASHBOARD,
    end: true,
  },
  {
    label: "Profile",
    path: ROUTES.STUDENT.PROFILE,
  },
  {
    label: "Browse Courses",
    path: ROUTES.STUDENT.COURSES,
  },
  {
    label: "My Courses",
    path: ROUTES.STUDENT.MY_COURSES,
  },
  {
    label: "Timetable",
    path: ROUTES.STUDENT.TIMETABLE,
  },
  {
    label: "Announcements",
    path: ROUTES.STUDENT.ANNOUNCEMENTS,
  },
] as const;

function StudentLayout() {
  return (
    <div className="bg-line-grid min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar portalName="Student Portal" />

      <div className="flex flex-col md:flex-row">
        <Sidebar items={studentNavigation} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
