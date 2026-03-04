import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Import actual pages
// Auth pages
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ProfilePage from './features/auth/ProfilePage';
// Placeholders for pages we haven't implemented yet
const ForgotPassword = () => <div>Forgot Password Page (To be implemented)</div>;
const ResetPassword = () => <div>Reset Password Page (To be implemented)</div>;

// Main pages
import Home from './pages/Home';
import ResourcesPage from './pages/ResourcesPage';
import SearchPage from './pages/SearchPage';
const ResourceDetailsPage = () => <div>Resource Details Page (To be implemented)</div>;

// User pages
const UserResourcesPage = () => <div>User Resources Page (To be implemented)</div>;

// Static pages
const AboutPage = () => <div>About Page (To be implemented)</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;

function App() {
  // Simplified auth handling without session validation
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Main Layout Routes */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourceDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="/my-resources" element={
            <ProtectedRoute>
              <UserResourcesPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
