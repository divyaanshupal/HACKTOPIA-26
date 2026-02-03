import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDigitalDesk from './pages/AdminDigitalDesk';
import AdminInbox from './pages/AdminInbox';
import UserDigitalDesk from './pages/UserDigitalDesk';
import TrackingDesk from './pages/TrackingDesk';
import CreateUserDesk from './pages/CreateUserDesk';
import HandleTransferDesk from './pages/HandleTransferDesk';
import AdminLogDesk from './pages/AdminLogDesk';
import UserLogDesk from './pages/UserLogDesk';
import ApplicantDashboard from './pages/ApplicantDashboard';
import FileDetail from './pages/FileDetail';
import TrackFileDetail from './pages/TrackFileDetail';
import UserManagement from './pages/UserManagement';
import UserAnalytics from './pages/UserAnalytics';
import DepartmentAnalytics from './pages/DepartmentAnalytics';
import TestLogin from './pages/testlogin';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/applicant/files" element={<ApplicantDashboard />} />

          {/* Admin Routes - Protected for Admin, DEPT_HEAD, OP_HEAD only */}
          <Route path="/adminDashboard" element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to="/adminDashboard/inbox" replace />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/inbox" element={
            <ProtectedRoute requiredRole="admin">
              <AdminInbox />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/digitalDesk" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDigitalDesk />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/trackFiles" element={
            <ProtectedRoute requiredRole="admin">
              <TrackingDesk />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/createUser" element={
            <ProtectedRoute requiredRole="admin">
              <CreateUserDesk />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/handleTransfer" element={
            <ProtectedRoute requiredRole="admin">
              <HandleTransferDesk />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/logDesk" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLogDesk />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/userManagement" element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/adminDashboard/analytics" element={
            <ProtectedRoute requiredRole="admin">
              <DepartmentAnalytics />
            </ProtectedRoute>
          } />

          {/* User Routes - Protected for GENERAL users only */}
          <Route path="/userDashboard" element={
            <ProtectedRoute requiredRole="user">
              <Navigate to="/userDashboard/DigitalDesk" replace />
            </ProtectedRoute>
          } />
          <Route path="/userDashboard/DigitalDesk" element={
            <ProtectedRoute requiredRole="user">
              <UserDigitalDesk />
            </ProtectedRoute>
          } />
          <Route path="/userDashboard/logDesk" element={
            <ProtectedRoute requiredRole="user">
              <UserLogDesk />
            </ProtectedRoute>
          } />
          <Route path="/userDashboard/analytics" element={
            <ProtectedRoute requiredRole="user">
              <UserAnalytics />
            </ProtectedRoute>
          } />

          {/* File Detail Routes - Any logged in user */}
          <Route path="/fileDetail/:id" element={
            <ProtectedRoute requiredRole="any">
              <FileDetail />
            </ProtectedRoute>
          } />
          <Route path="/trackfile/:id" element={
            <ProtectedRoute requiredRole="any">
              <TrackFileDetail />
            </ProtectedRoute>
          } />
          <Route path="/myFile/:id" element={
            <ProtectedRoute requiredRole="any">
              <TrackFileDetail />
            </ProtectedRoute>
          } />
          <Route path="/testlogin" element={<TestLogin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
