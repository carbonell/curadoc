import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore, curaDocApi } from '../services/curaDocApi';
import { UserRole } from '../types/models';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@curadoc.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const session = await curaDocApi.login(email, password);
      authStore.setSession(session);
      if (session.role === UserRole.SuperAdmin) {
        navigate('/backoffice');
      } else {
        navigate('/doctors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 bg-emerald-900 text-white p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-block bg-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
              Accredited Clinical Gateway
            </span>
            <h1 className="text-3xl font-bold">Trusted healthcare, seamlessly connected</h1>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Sign in to manage your appointments, access digital check-in records, or administer credentialing in the
              SuperAdmin Backoffice.
            </p>
          </div>
          <div className="bg-emerald-800/60 p-4 rounded-xl text-xs space-y-2">
            <p className="font-bold text-amber-300">Demo Accounts:</p>
            <p>
              <strong>SuperAdmin:</strong> admin@curadoc.com / Admin123!
            </p>
            <p>
              <strong>Patient:</strong> alex.morgan@email.com / Patient123!
            </p>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="md:col-span-7 p-8 space-y-5">
          <span className="inline-block bg-sky-100 text-sky-900 text-xs font-bold px-3 py-1 rounded-full">
            PATIENT, PRACTITIONER &amp; SUPERADMIN PORTAL
          </span>
          <h2 className="text-2xl font-bold">Sign In to Your Account</h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@curadoc.com');
                setPassword('Admin123!');
              }}
              className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded font-semibold"
            >
              Fill SuperAdmin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('alex.morgan@email.com');
                setPassword('Patient123!');
              }}
              className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded font-semibold"
            >
              Fill Patient
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            Sign In →
          </button>
        </form>
      </div>
    </div>
  );
};
