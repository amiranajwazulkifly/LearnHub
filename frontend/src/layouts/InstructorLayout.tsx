import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { ROUTES } from "../constants/routes";

const instructorNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.INSTRUCTOR.DASHBOARD,
    end: true,
  },
  {
    label: "Profile",
    path: ROUTES.INSTRUCTOR.PROFILE,
  },
  {
    label: "My Courses",
    path: ROUTES.INSTRUCTOR.COURSES,
  },
] as const;

function InstructorLayout() {
  return (
    <div className="bg-line-grid min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar portalName="Instructor Portal" />

      <div className="flex flex-col md:flex-row">
        <Sidebar items={instructorNavigation} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default InstructorLayout;
