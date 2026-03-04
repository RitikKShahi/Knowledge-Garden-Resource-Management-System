import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Simple Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link to="/" className="text-xl font-bold">Knowledge Garden</Link>
        </div>
      </header>

      {/* Auth Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-900 text-white py-3">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Knowledge Garden. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
