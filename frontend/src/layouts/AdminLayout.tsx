import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { ROUTES } from "../constants/routes";
import {
  AnnouncementsIcon,
  CategoriesIcon,
  CoursesIcon,
  DashboardIcon,
  EnrollmentsIcon,
  InstructorsIcon,
  ProfileIcon,
  ReportsIcon,
  SchedulesIcon,
  StudentsIcon,
} from "../components/common/NavIcons";

const adminNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.ADMIN.DASHBOARD,
    icon: <DashboardIcon />,
    end: true,
  },
  {
    label: "Profile",
    path: ROUTES.ADMIN.PROFILE,
    icon: <ProfileIcon />,
  },
  {
    label: "Courses",
    path: ROUTES.ADMIN.COURSES,
    icon: <CoursesIcon />,
  },
  {
    label: "Categories",
    path: ROUTES.ADMIN.CATEGORIES,
    icon: <CategoriesIcon />,
  },
  {
    label: "Instructors",
    path: ROUTES.ADMIN.INSTRUCTORS,
    icon: <InstructorsIcon />,
  },
  {
    label: "Schedules",
    path: ROUTES.ADMIN.SCHEDULES,
    icon: <SchedulesIcon />,
  },
  {
    label: "Students",
    path: ROUTES.ADMIN.STUDENTS,
    icon: <StudentsIcon />,
  },
  {
    label: "Enrollments",
    path: ROUTES.ADMIN.ENROLLMENTS,
    icon: <EnrollmentsIcon />,
  },
  {
    label: "Reports",
    path: ROUTES.ADMIN.REPORTS,
    icon: <ReportsIcon />,
  },
  {
    label: "Announcements",
    path: ROUTES.ADMIN.ANNOUNCEMENTS,
    icon: <AnnouncementsIcon />,
  },
];

function AdminLayout() {
  return (
    <div className="bg-line-grid min-h-screen bg-gray-100 dark:bg-gray-950">
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
