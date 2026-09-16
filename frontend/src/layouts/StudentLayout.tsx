import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { ROUTES } from "../constants/routes";
import { useAnnouncementStore } from "../store/useAnnouncementStore";
import {
  AnnouncementsIcon,
  AssignmentsIcon,
  BrowseCoursesIcon,
  DashboardIcon,
  MyCoursesIcon,
  ProfileIcon,
  SchedulesIcon,
} from "../components/common/NavIcons";

const studentNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.STUDENT.DASHBOARD,
    icon: <DashboardIcon />,
    end: true,
  },
  {
    label: "Profile",
    path: ROUTES.STUDENT.PROFILE,
    icon: <ProfileIcon />,
  },
  {
    label: "Browse Courses",
    path: ROUTES.STUDENT.COURSES,
    icon: <BrowseCoursesIcon />,
  },
  {
    label: "My Courses",
    path: ROUTES.STUDENT.MY_COURSES,
    icon: <MyCoursesIcon />,
  },
  {
    label: "Tasks",
    path: ROUTES.STUDENT.TASKS,
    icon: <AssignmentsIcon />,
  },
  {
    label: "Timetable",
    path: ROUTES.STUDENT.TIMETABLE,
    icon: <SchedulesIcon />,
  },
  {
    label: "Announcements",
    path: ROUTES.STUDENT.ANNOUNCEMENTS,
    icon: <AnnouncementsIcon />,
  },
];

function StudentLayout() {
  const location = useLocation();
  const unreadAnnouncements = useAnnouncementStore(
    (state) => state.unreadCount,
  );
  const refreshUnread = useAnnouncementStore((state) => state.refreshUnread);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, location.pathname]);

  const navigation = studentNavigation.map((item) =>
    item.path === ROUTES.STUDENT.ANNOUNCEMENTS
      ? { ...item, badge: unreadAnnouncements }
      : item,
  );

  return (
    <div className="app-shell student-shell">
      <Navbar portalName="Student Portal" />

      <div className="shell-body">
        <Sidebar items={navigation} />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
