import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { curaDocApi } from '../services/curaDocApi';
import { CareDeliveryMode, DoctorCard } from '../types/models';

const AVAILABLE_TIMES = ['09:00 AM', '09:45 AM', '10:15 AM', '11:30 AM', '01:30 PM', '02:15 PM', '03:00 PM'];

export const BookConsultationPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorCard | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<CareDeliveryMode>(CareDeliveryMode.InPersonVisit);
  const [selectedDate, setSelectedDate] = useState('2024-10-24');
  const [selectedTime, setSelectedTime] = useState('10:15 AM');

  const [patientFullName, setPatientFullName] = useState('Alex Morgan');
  const [patientDob, setPatientDob] = useState('1988-08-14');
  const [patientPhone, setPatientPhone] = useState('+1 (555) 019-2834');
  const [patientEmail, setPatientEmail] = useState('alex.morgan@email.com');
  const [insuranceMemberId, setInsuranceMemberId] = useState('XEJ98234189');
  const [insuranceGroupNumber, setInsuranceGroupNumber] = useState('GRP-4401');
  const [reason, setReason] = useState('Annual cardiac checkup and routine ECG review.');

  useEffect(() => {
    if (doctorId) {
      curaDocApi.getDoctorById(doctorId).then(setDoctor).catch(console.error);
    }
  }, [doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    const confirmation = await curaDocApi.createAppointment({
      doctorId: doctor.id,
      appointmentDateTime: new Date(`${selectedDate}T10:15:00Z`).toISOString(),
      deliveryMode,
      isForSelf: true,
      patientFullName,
      patientDateOfBirth: patientDob,
      patientPhoneNumber: patientPhone,
      patientEmail,
      insuranceMemberId,
      insuranceGroupNumber,
      primaryReasonForVisit: reason,
      smsRemindersOptIn: true,
    });

    navigate(`/appointments/${confirmation.confirmationCode}`);
  };

  if (!doctor) return <div className="p-8 text-center">Loading provider schedule...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Summary Sidebar */}
      <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 space-y-6 h-fit">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase">Board Certified Specialist</span>
          <h2 className="text-xl font-bold">{doctor.fullName}</h2>
          <p className="text-xs text-slate-600">
            {doctor.credentials} • {doctor.primarySpecialty}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDeliveryMode(CareDeliveryMode.InPersonVisit)}
            className={`py-2 rounded-md ${
              deliveryMode === CareDeliveryMode.InPersonVisit ? 'bg-emerald-800 text-white' : 'text-slate-700'
            }`}
          >
            In-Person Visit
          </button>
          <button
            type="button"
            onClick={() => setDeliveryMode(CareDeliveryMode.VirtualVideo)}
            className={`py-2 rounded-md ${
              deliveryMode === CareDeliveryMode.VirtualVideo ? 'bg-emerald-800 text-white' : 'text-slate-700'
            }`}
          >
            Virtual Video
          </button>
        </div>

        <div className="border-t border-slate-200 pt-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Specialist Consultation Rate</span>
            <span className="font-semibold">${doctor.consultationRate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-emerald-800 pt-2">
            <span>Estimated Co-Pay</span>
            <span>${doctor.standardCopay.toFixed(2)}</span>
          </div>
        </div>
      </aside>

      {/* Right 3-Step Booking Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <p className="text-xs font-bold uppercase text-emerald-800">Step 1 &amp; 2 of 3 • Select Date &amp; Time</p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2 pt-2">
            {AVAILABLE_TIMES.map((time) => (
              <button
                type="button"
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                  selectedTime === time
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <p className="text-xs font-bold uppercase text-emerald-800">Step 3 of 3 • Patient Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Full Legal Name"
              value={patientFullName}
              onChange={(e) => setPatientFullName(e.target.value)}
            />
            <input
              required
              type="date"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              value={patientDob}
              onChange={(e) => setPatientDob(e.target.value)}
            />
            <input
              required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Phone Number"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
            />
            <input
              required
              type="email"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Email Address"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
            />
            <input
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Insurance Member ID"
              value={insuranceMemberId}
              onChange={(e) => setInsuranceMemberId(e.target.value)}
            />
            <input
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Group Number"
              value={insuranceGroupNumber}
              onChange={(e) => setInsuranceGroupNumber(e.target.value)}
            />
          </div>
          <textarea
            rows={3}
            className="w-full border border-slate-200 rounded-lg p-3 text-sm"
            placeholder="Primary Reason for Visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-lg text-sm"
          >
            Confirm Appointment • ${doctor.standardCopay.toFixed(2)} Co-Pay
          </button>
        </div>
      </form>
    </div>
  );
};
