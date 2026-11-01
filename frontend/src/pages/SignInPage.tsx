import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex.morgan@email.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/doctors');
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
              Sign in to manage your appointments, access digital check-in records, and share verified reviews of your
              healthcare providers.
            </p>
          </div>
          <div className="bg-emerald-800/60 p-4 rounded-xl text-xs space-y-1">
            <p className="text-amber-400 font-bold">★★★★★ 4.9 / 5.0</p>
            <p>“Over 1.2M verified patient appointments booked nationwide through CuraDoc.”</p>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="md:col-span-7 p-8 space-y-5">
          <span className="inline-block bg-sky-100 text-sky-900 text-xs font-bold px-3 py-1 rounded-full">
            PATIENT &amp; PRACTITIONER PORTAL
          </span>
          <h2 className="text-2xl font-bold">Sign In to Your Account</h2>
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
