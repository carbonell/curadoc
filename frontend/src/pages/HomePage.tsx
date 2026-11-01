import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { curaDocApi } from '../services/curaDocApi';
import { ClinicSummary } from '../types/models';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('Chicago, IL');
  const [insurance, setInsurance] = useState('BCBS PPO');
  const [clinics, setClinics] = useState<ClinicSummary[]>([]);

  useEffect(() => {
    curaDocApi.getFeaturedClinics().then(setClinics).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams({ specialty, location, insurance }).toString();
    navigate(`/doctors?${qs}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      <section className="text-center space-y-6">
        <span className="inline-block bg-sky-100 text-emerald-900 text-xs font-semibold px-3 py-1 rounded-full">
          NATIONWIDE NETWORK OF 45,000+ BOARD-CERTIFIED DOCTORS
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Find and book top-rated doctors near you
        </h1>
        <form
          onSubmit={handleSearch}
          className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
        >
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Condition or Specialist (e.g., Cardiology)"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="City or Zip Code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Insurance Coverage"
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
          />
          <button
            type="submit"
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          >
            Search Doctors
          </button>
        </form>
      </section>

      <section id="clinics" className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-800">Accredited Health Networks</p>
          <h2 className="text-2xl font-bold">Featured Medical Centers &amp; Partner Hospitals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {clinics.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
              {c.badgeLabel && (
                <span className="inline-block bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {c.badgeLabel}
                </span>
              )}
              <p className="text-xs text-slate-500">
                {c.city}, {c.state}
              </p>
              <h3 className="font-bold text-slate-900">{c.name}</h3>
              <p className="text-xs text-amber-600 font-semibold">
                ★ {c.averageRating} ({c.reviewCount} reviews)
              </p>
              <p className="text-xs text-emerald-700 font-medium pt-2">
                ● {c.availableSlotsToday} Slots Today
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
