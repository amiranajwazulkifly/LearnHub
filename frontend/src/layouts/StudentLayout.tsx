import { Outlet } from 'react-router-dom';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { ROUTES } from '../constants/routes';
import {
  AnnouncementsIcon,
  AssignmentsIcon,
  BrowseCoursesIcon,
  DashboardIcon,
  MyCoursesIcon,
  ProfileIcon,
  SchedulesIcon,
} from '../components/common/NavIcons';

const studentNavigation = [
  {
    label: 'Dashboard',
    path: ROUTES.STUDENT.DASHBOARD,
    icon: <DashboardIcon />,
    end: true,
  },
  {
    label: 'Profile',
    path: ROUTES.STUDENT.PROFILE,
    icon: <ProfileIcon />,
  },
  {
    label: 'Browse Courses',
    path: ROUTES.STUDENT.COURSES,
    icon: <BrowseCoursesIcon />,
  },
  {
    label: 'My Courses',
    path: ROUTES.STUDENT.MY_COURSES,
    icon: <MyCoursesIcon />,
  },
  {
    label: 'Tasks',
    path: ROUTES.STUDENT.TASKS,
    icon: <AssignmentsIcon />,
  },
  {
    label: 'Timetable',
    path: ROUTES.STUDENT.TIMETABLE,
    icon: <SchedulesIcon />,
  },
  {
    label: 'Announcements',
    path: ROUTES.STUDENT.ANNOUNCEMENTS,
    icon: <AnnouncementsIcon />,
  },
];

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
