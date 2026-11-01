import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { authStore } from '../services/curaDocApi';
import { AuthSession, UserRole } from '../types/models';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(authStore.getSession());

  useEffect(() => {
    const sync = () => setSession(authStore.getSession());
    window.addEventListener('curadoc-auth-change', sync);
    return () => window.removeEventListener('curadoc-auth-change', sync);
  }, []);

  const handleSignOut = () => {
    authStore.setSession(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-emerald-900 flex items-center gap-2">
            <span className="inline-block w-6 h-6 rounded bg-emerald-700" />
            CuraDoc
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/doctors" className="text-emerald-900 bg-indigo-50 px-3 py-1.5 rounded-md">
              Find Doctors
            </Link>
            <Link to="/doctors?specialty=Cardiology">Specialties</Link>
            <Link to="/#clinics">Clinics &amp; Centers</Link>
            <Link to="/for-doctors/apply" className="text-emerald-800 font-semibold">
              For Doctors (Apply)
            </Link>
            {session?.role === UserRole.SuperAdmin && (
              <Link to="/backoffice" className="bg-emerald-900 text-white px-3 py-1.5 rounded-md text-xs font-bold">
                SuperAdmin Backoffice
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">
                {session.fullName} ({session.role === UserRole.SuperAdmin ? 'SuperAdmin' : 'Patient'})
              </span>
              <button onClick={handleSignOut} className="text-xs text-rose-700 font-semibold">
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/sign-in" className="text-slate-700 hover:text-emerald-800">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-10 text-sm text-slate-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="font-bold text-slate-900 mb-2">CuraDoc</p>
            <p className="max-w-xs">
              Nationwide medical network simplifying doctor discovery, certified credentials, and instant scheduling.
            </p>
          </div>
          <div className="text-xs text-slate-500 self-end">
            © 2025 CuraDoc Health Technologies Inc. All rights reserved. HIPAA Certified Secure.
          </div>
        </div>
      </footer>
    </div>
  );
};
