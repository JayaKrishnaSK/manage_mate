import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut,
  User,
  FileText,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';

// Define the navigation item structure
export interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  roles: ('Admin' | 'User' | 'Manager' | 'BA' | 'Developer' | 'QA' | 'Guest')[];
  children?: NavItem[];
  isThemeToggle?: boolean;
}

// Define navigation items based on roles
export const navigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ['Admin', 'User'],
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <FolderOpen className="h-4 w-4" />,
    roles: ['Admin', 'User'],
  },
  {
    title: 'My Tasks',
    href: '/tasks',
    icon: <FileText className="h-4 w-4" />,
    roles: ['Admin', 'User'],
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: <Calendar className="h-4 w-4" />,
    roles: ['Admin', 'User'],
  },
  {
    title: 'Timesheet',
    href: '/timesheet',
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ['Admin', 'User'],
  },
  {
    title: 'Personal Todos',
    href: '/todos',
    icon: <FileText className="h-4 w-4" />,
    roles: ['Admin', 'User'],
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: <Users className="h-4 w-4" />,
    roles: ['Admin'],
    children: [
      {
        title: 'User Management',
        href: '/admin/users',
        icon: <Users className="h-4 w-4" />,
        roles: ['Admin'],
      },
      {
        title: 'Project Management',
        href: '/admin/projects',
        icon: <FolderOpen className="h-4 w-4" />,
        roles: ['Admin'],
      },
    ],
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: <User className="h-4 w-4" />,
    roles: ['Admin', 'User'],
  },
];
