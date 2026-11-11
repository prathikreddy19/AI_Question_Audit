import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuditProvider } from './contexts/AuditContext';

import { AuthLayout } from './layouts/AuthLayout';
import { FacultyLayout } from './layouts/FacultyLayout';
import { StudentLayout } from './layouts/StudentLayout';

import { LoginPage } from './pages/LoginPage';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { ReviewQueuePage } from './pages/faculty/ReviewQueuePage';
import { ReviewConsolePage } from './pages/faculty/ReviewConsolePage';
import { AuditLogsPage } from './pages/faculty/AuditLogsPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentQuestionDetails } from './pages/student/StudentQuestionDetails';

function AuthLoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600" role="status">
      Restoring your session…
    </main>
  );
}

function RoleHome() {
  const { loading, isAuthenticated, role } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'faculty' ? '/faculty' : '/student'} replace />;
}

function PublicOnlyRoute() {
  const { loading, isAuthenticated, role } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (isAuthenticated) {
    return <Navigate to={role === 'faculty' ? '/faculty' : '/student'} replace />;
  }
  return <Outlet />;
}

function RoleGuard({ allowedRole }) {
  const { loading, isAuthenticated, role } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== allowedRole) {
    return <Navigate to={role === 'faculty' ? '/faculty' : '/student'} replace />;
  }
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RoleHome />} />

      {/* Auth routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>

      {/* Faculty Console routes */}
      <Route element={<RoleGuard allowedRole="faculty" />}>
        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<FacultyDashboard />} />
          <Route path="queue" element={<ReviewQueuePage />} />
          <Route path="queue/:reportId" element={<ReviewConsolePage />} />
          <Route path="audit" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* Student Portal routes */}
      <Route element={<RoleGuard allowedRole="student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="question/:id" element={<StudentQuestionDetails />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<RoleHome />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuditProvider>
    </AuthProvider>
  );
}

export default App;
