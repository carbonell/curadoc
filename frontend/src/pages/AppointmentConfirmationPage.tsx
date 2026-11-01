import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { curaDocApi } from '../services/curaDocApi';
import { AppointmentConfirmation } from '../types/models';

export const AppointmentConfirmationPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [appointment, setAppointment] = useState<AppointmentConfirmation | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (code) {
      curaDocApi.getAppointmentByCode(code).then(setAppointment).catch(console.error);
    }
  }, [code]);

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    await curaDocApi.submitFeedback(code, rating, comment);
    setFeedbackSent(true);
  };

  if (!appointment) return <div className="p-8 text-center">Loading confirmation receipt...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
            ● DIGITAL CHECK-IN READY
          </span>
          <h1 className="text-3xl font-bold">Appointment Confirmed!</h1>
          <p className="text-sm text-slate-600">
            A confirmation email and SMS receipt have been securely sent to <strong>{appointment.patientEmail}</strong>.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-200 text-sm">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 uppercase">Confirmation Code</p>
              <p className="text-lg font-bold text-emerald-800">{appointment.confirmationCode}</p>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(appointment.confirmationCode)}
              className="text-xs bg-slate-100 px-3 py-1.5 rounded font-semibold"
            >
              Copy
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <span className="text-slate-500">Provider</span>
            <span className="col-span-2 font-semibold">
              {appointment.providerFullName} ({appointment.providerSpecialty})
            </span>

            <span className="text-slate-500">Date &amp; Time</span>
            <span className="col-span-2 font-semibold">
              {new Date(appointment.appointmentDateTime).toLocaleString()}
            </span>

            <span className="text-slate-500">Clinic Address</span>
            <span className="col-span-2">
              <strong>{appointment.clinicName}</strong>
              <br />
              {appointment.clinicAddress}
            </span>

            <span className="text-slate-500">Estimated Co-Pay</span>
            <span className="col-span-2 font-bold text-emerald-800">${appointment.estimatedCopay.toFixed(2)}</span>
          </div>
        </div>

        {!feedbackSent ? (
          <form onSubmit={handleFeedback} className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-200">
            <h3 className="font-bold text-sm">Share Your Initial Experience (Optional)</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-lg ${rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us how we can make booking even easier..."
              className="w-full border border-slate-200 rounded-lg p-2 text-xs"
            />
            <button
              type="submit"
              className="bg-sky-100 text-sky-900 font-semibold text-xs px-4 py-2 rounded-lg"
            >
              Submit Feedback
            </button>
          </form>
        ) : (
          <p className="text-xs text-center text-emerald-700 font-medium">Thank you for your feedback!</p>
        )}

        <div className="text-center">
          <Link to="/" className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-5 py-2.5 rounded-lg">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
