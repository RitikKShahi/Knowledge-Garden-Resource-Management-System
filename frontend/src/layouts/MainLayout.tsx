import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold">Knowledge Garden</Link>
            
            <nav className="hidden md:flex space-x-4">
              <Link to="/" className="hover:text-blue-300 transition-colors">Home</Link>
              <Link to="/resources" className="hover:text-blue-300 transition-colors">Resources</Link>
              <Link to="/search" className="hover:text-blue-300 transition-colors">Search</Link>
              {/* {isAuthenticated && (
                <Link to="/dashboard" className="hover:text-blue-300 transition-colors">Dashboard</Link>
              )} */}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <span className="text-sm">Hello, {user?.firstName || 'User'}</span>
                </div>
                <div className="flex space-x-2">
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" /> Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="secondary" 
                    className="bg-slate-700 text-white hover:bg-slate-600" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Knowledge Garden</h3>
              <p className="text-slate-300 text-sm">
                A platform for sharing and discovering knowledge resources.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-slate-300 hover:text-white">Home</Link></li>
                <li><Link to="/resources" className="text-slate-300 hover:text-white">Browse Resources</Link></li>
                <li><Link to="/search" className="text-slate-300 hover:text-white">Search</Link></li>
                <li><Link to="/about" className="text-slate-300 hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Email: info@knowledgegarden.com</li>
                <li>Phone: +1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Knowledge Garden. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
