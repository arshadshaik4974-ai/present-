import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  BookOpen, 
  CalendarCheck, 
  ScanFace, 
  LineChart, 
  FileText, 
  Settings,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
};

const navigation: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['admin'] },
  { name: 'Principal Dashboard', href: '/principal', icon: LayoutDashboard, roles: ['principal'] },
  { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard, roles: ['teacher'] },
  
  { name: 'User Management', href: '/admin/users', icon: ShieldCheck, roles: ['admin'] },
  
  { name: 'Students', href: '/students', icon: Users, roles: ['admin', 'principal'] },
  { name: 'Students', href: '/teacher/students', icon: Users, roles: ['teacher'] },

  { name: 'Teachers', href: '/teachers', icon: UserSquare2, roles: ['admin', 'principal'] },
  
  { name: 'Classes', href: '/classes', icon: BookOpen, roles: ['admin', 'principal'] },
  { name: 'My Classes', href: '/teacher/classes', icon: BookOpen, roles: ['teacher'] },

  { name: 'Attendance', href: '/attendance', icon: CalendarCheck, roles: ['admin', 'principal'] },
  { name: 'Attendance', href: '/teacher/attendance', icon: CalendarCheck, roles: ['teacher'] },

  { name: 'Live AI', href: '/live-ai', icon: ScanFace, roles: ['admin', 'principal'] },
  { name: 'Live AI', href: '/teacher/live-ai', icon: ScanFace, roles: ['teacher'] },
  
  { name: 'Analytics', href: '/analytics', icon: LineChart, roles: ['admin', 'principal'] },
  { name: 'Analytics', href: '/teacher/analytics', icon: LineChart, roles: ['teacher'] },

  { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'principal'] },
  { name: 'Reports', href: '/teacher/reports', icon: FileText, roles: ['teacher'] },
  
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList, roles: ['admin'] },
  
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || '';

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <ScanFace className="h-8 w-8 text-primary" />
        <span className="ml-3 text-lg font-bold text-gray-900 tracking-tight">AI Attendance</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "group flex items-center rounded-md px-2 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 shrink-0",
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
