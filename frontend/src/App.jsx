import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MyComplaints from './pages/MyComplaints';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import AllComplaints from './pages/AllComplaints';
import Analytics from './pages/Analytics';
import StaffQueue from './pages/StaffQueue';
import ManageUsers from './pages/ManageUsers';
import './index.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/new" element={<NewComplaint />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="all-complaints" element={<AllComplaints />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="queue" element={<StaffQueue />} />
        <Route path="users" element={<ManageUsers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
