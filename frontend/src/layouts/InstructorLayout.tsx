import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { ROUTES } from "../constants/routes";
import {
  DashboardIcon,
  MyCoursesIcon,
  ProfileIcon,
} from "../components/common/NavIcons";

const instructorNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.INSTRUCTOR.DASHBOARD,
    icon: <DashboardIcon />,
    end: true,
  },
  {
    label: "Profile",
    path: ROUTES.INSTRUCTOR.PROFILE,
    icon: <ProfileIcon />,
  },
  {
    label: "My Courses",
    path: ROUTES.INSTRUCTOR.COURSES,
    icon: <MyCoursesIcon />,
  },
];

function InstructorLayout() {
  return (
    <div className="app-shell instructor-shell">
      <Navbar portalName="Instructor Portal" />

      <div className="shell-body">
        <Sidebar items={instructorNavigation} />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default InstructorLayout;
