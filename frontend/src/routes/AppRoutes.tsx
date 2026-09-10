import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Pages
import { Login } from '../pages/auth/Login';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Students } from '../pages/students/Students';
import { StudentDetail } from '../pages/students/StudentDetail';
import { FaceEnrollment } from '../pages/students/FaceEnrollment';
import { Teachers } from '../pages/teachers/Teachers';
import { Classes } from '../pages/classes/Classes';
import { ClassDetail } from '../pages/classes/ClassDetail';
import { Attendance } from '../pages/attendance/Attendance';
import { LiveAI } from '../pages/live-ai/LiveAI';
import { Analytics } from '../pages/analytics/Analytics';
import { Reports } from '../pages/reports/Reports';
import { Settings } from '../pages/settings/Settings';
import { AccessDenied } from '../pages/errors/AccessDenied';

// New Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { PrincipalDashboard } from '../pages/principal/PrincipalDashboard';
import { UsersList } from '../pages/admin/Users/UsersList';
import { AuditLogs } from '../pages/admin/AuditLogs/AuditLogs';

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'principal') return <Navigate to="/principal" replace />;
  
  return <Navigate to="/teacher" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RootRedirect />} />
        
        <Route element={<DashboardLayout />}>
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* Principal Routes */}
          <Route element={<RoleRoute allowedRoles={['principal']} />}>
            <Route path="/principal" element={<PrincipalDashboard />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<RoleRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<Dashboard />} />
            <Route path="/teacher/classes" element={<Classes />} />
            <Route path="/teacher/classes/:classId" element={<ClassDetail />} />
            <Route path="/teacher/students" element={<Students />} />
            <Route path="/teacher/students/:studentId" element={<StudentDetail />} />
            <Route path="/teacher/students/:studentId/face-enrollment" element={<FaceEnrollment />} />
            <Route path="/teacher/attendance" element={<Attendance />} />
            <Route path="/teacher/live-ai" element={<LiveAI />} />
            <Route path="/teacher/reports" element={<Reports />} />
            <Route path="/teacher/analytics" element={<Analytics />} />
          </Route>

          {/* Shared Admin & Principal Routes */}
          <Route element={<RoleRoute allowedRoles={['admin', 'principal']} />}>
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:studentId/face-enrollment" element={<FaceEnrollment />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/live-ai" element={<LiveAI />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        <Route path="/unauthorized" element={<AccessDenied />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
