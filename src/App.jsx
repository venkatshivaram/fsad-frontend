import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PrivateRoute, PublicRoute, HomeRoute } from './components/PrivateRoute';
import Toast from './components/Toast';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Courses from './pages/student/Courses';
import Schedule from './pages/student/Schedule';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCourses from './pages/admin/ManageCourses';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute allowedRole="student">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <PrivateRoute allowedRole="student">
                <Courses />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/schedule"
            element={
              <PrivateRoute allowedRole="student">
                <Schedule />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <PrivateRoute allowedRole="student">
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/manage-courses"
            element={
              <PrivateRoute allowedRole="admin">
                <ManageCourses />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<HomeRoute />} />

          {/* 404 - Redirect to login */}
          <Route path="*" element={<HomeRoute />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toast />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
