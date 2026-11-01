import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { curaDocApi } from '../services/curaDocApi';
import { DoctorCard } from '../types/models';

export const DoctorSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<DoctorCard[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorCard | null>(null);

  useEffect(() => {
    const specialty = searchParams.get('specialty') || undefined;
    const location = searchParams.get('location') || undefined;
    curaDocApi.searchDoctors({ specialty, location }).then((list) => {
      setDoctors(list);
      if (list.length > 0) setSelectedDoctor(list[0]);
    });
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-4">
        <p className="text-sm font-medium text-slate-600">
          {doctors.length} board-certified specialists found in your area
        </p>
        {doctors.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoctor(doc)}
            className={`bg-white rounded-xl p-5 border cursor-pointer transition ${
              selectedDoctor?.id === doc.id ? 'border-emerald-700 ring-1 ring-emerald-700' : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  {doc.fullName}, {doc.credentials}
                </h3>
                <p className="text-sm text-slate-600">{doc.subSpecialty || doc.primarySpecialty}</p>
                <p className="text-xs font-semibold text-amber-600 mt-1">
                  ★ {doc.averageRating} ({doc.verifiedReviewCount} verified reviews)
                </p>
              </div>
              {doc.isTopRated && (
                <span className="bg-sky-100 text-sky-900 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Top Rated
                </span>
              )}
            </div>

            <div className="mt-4 bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 text-slate-700">
              <p className="font-medium">{doc.clinic.name}</p>
              <p className="text-emerald-700 font-semibold">
                Next available: {doc.nextAvailableSlot ? new Date(doc.nextAvailableSlot).toLocaleString() : 'Tomorrow'}
              </p>
              <p>
                <strong>${doc.standardCopay} Copay</strong> (with BCBS) • ${doc.selfPayRate} Self-pay
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                to={`/book/${doc.id}`}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white text-center py-2 rounded-lg text-sm font-semibold"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-7 bg-sky-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-end min-h-[500px]">
        {selectedDoctor && (
          <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 max-w-md ml-auto space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold">
                {selectedDoctor.fullName}, {selectedDoctor.credentials}
              </h4>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                98% Match
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {selectedDoctor.clinic.streetAddress}, {selectedDoctor.clinic.city}, {selectedDoctor.clinic.state}{' '}
              {selectedDoctor.clinic.zipCode}
            </p>
            <Link
              to={`/book/${selectedDoctor.id}`}
              className="block w-full bg-emerald-800 text-white text-center py-2.5 rounded-lg text-sm font-semibold"
            >
              Select &amp; Schedule at This Location
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
