import React, { useEffect, useState } from 'react';
import { curaDocApi } from '../services/curaDocApi';
import { ClinicSummary, DoctorApplicationItem, SpecialtyItem } from '../types/models';

export const DoctorSignUpPage: React.FC = () => {
  const [clinics, setClinics] = useState<ClinicSummary[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [credentials, setCredentials] = useState('MD, FACC');
  const [primarySpecialty, setPrimarySpecialty] = useState('Cardiology');
  const [subSpecialty, setSubSpecialty] = useState('');
  const [gender, setGender] = useState('Female');
  const [exequaturNumber, setExequaturNumber] = useState('');
  const [identityDocumentNumber, setIdentityDocumentNumber] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [instagramOrXUrl, setInstagramOrXUrl] = useState('');
  const [websiteOrResearchGateUrl, setWebsiteOrResearchGateUrl] = useState('');
  const [preferredClinicId, setPreferredClinicId] = useState('');
  const [proposedConsultationRate, setProposedConsultationRate] = useState(220);
  const [proposedStandardCopay, setProposedStandardCopay] = useState(45);

  const [submittedApplication, setSubmittedApplication] = useState<DoctorApplicationItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    curaDocApi.getAllClinics().then((list) => {
      setClinics(list);
      if (list.length > 0) setPreferredClinicId(list[0].id);
    });
    curaDocApi.getActiveSpecialties().then((list) => {
      setSpecialties(list);
      if (list.length > 0) setPrimarySpecialty(list[0].name);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const result = await curaDocApi.submitDoctorApplication({
        fullName,
        email,
        phoneNumber,
        credentials,
        primarySpecialty,
        subSpecialty: subSpecialty || undefined,
        gender,
        exequaturNumber,
        identityDocumentNumber,
        linkedInUrl: linkedInUrl || undefined,
        instagramOrXUrl: instagramOrXUrl || undefined,
        websiteOrResearchGateUrl: websiteOrResearchGateUrl || undefined,
        preferredClinicId,
        proposedConsultationRate,
        proposedStandardCopay,
      });
      setSubmittedApplication(result);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not submit application.');
    }
  };

  if (submittedApplication) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-center">
          <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            ● PENDING MANUAL CREDENTIAL VALIDATION
          </span>
          <h1 className="text-3xl font-bold">Doctor Application Received</h1>
          <p className="text-sm text-slate-600">
            Thank you, <strong>{submittedApplication.fullName}</strong>. Your medical exequatur (
            <code className="bg-slate-100 px-1.5 py-0.5 rounded">{submittedApplication.exequaturNumber}</code>) and
            identity document number (
            <code className="bg-slate-100 px-1.5 py-0.5 rounded">{submittedApplication.identityDocumentNumber}</code>)
            have been queued for manual review by our SuperAdmin Credentialing Board.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
            <p>
              <strong>Application ID:</strong> {submittedApplication.id}
            </p>
            <p>
              <strong>Primary Specialty:</strong> {submittedApplication.primarySpecialty}
            </p>
            <p>
              <strong>Preferred Medical Center:</strong> {submittedApplication.preferredClinicName}
            </p>
            <p>
              <strong>Status:</strong> Pending SuperAdmin Verification
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div>
          <span className="inline-block bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full mb-2">
            PRACTITIONER CREDENTIALING &amp; ONBOARDING
          </span>
          <h1 className="text-3xl font-bold">Join the CuraDoc Medical Network</h1>
          <p className="text-sm text-slate-600 mt-1">
            Submit your medical credentials, Exequatur license, government identity document, and professional profiles.
            All applications are manually validated by our clinical compliance team before your schedule goes live.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-emerald-800 border-b border-slate-200 pb-2">
              1. Personal &amp; Clinical Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Legal Name *</label>
                <input
                  required
                  placeholder="e.g., Dr. Alejandro Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Medical Credentials *</label>
                <input
                  required
                  placeholder="e.g., MD, FACC, PhD"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Institutional Email *</label>
                <input
                  required
                  type="email"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Direct Phone Number *</label>
                <input
                  required
                  placeholder="+1 (312) 555-0190"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-emerald-800 border-b border-slate-200 pb-2">
              2. Mandatory License &amp; Identity Verification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Medical Exequatur Number *</label>
                <input
                  required
                  placeholder="e.g., EXQ-2021-5542"
                  value={exequaturNumber}
                  onChange={(e) => setExequaturNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Identity Document Number (National ID / Passport) *
                </label>
                <input
                  required
                  placeholder="e.g., 001-1928374-5"
                  value={identityDocumentNumber}
                  onChange={(e) => setIdentityDocumentNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-emerald-800 border-b border-slate-200 pb-2">
              3. Specialty &amp; Affiliated Clinic
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Primary Specialty *</label>
                <select
                  value={primarySpecialty}
                  onChange={(e) => setPrimarySpecialty(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Sub-Specialty</label>
                <input
                  placeholder="e.g., Interventional Cardiology"
                  value={subSpecialty}
                  onChange={(e) => setSubSpecialty(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold mb-1">Preferred Medical Center *</label>
                <select
                  required
                  value={preferredClinicId}
                  onChange={(e) => setPreferredClinicId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Consultation Rate ($ USD)</label>
                <input
                  type="number"
                  value={proposedConsultationRate}
                  onChange={(e) => setProposedConsultationRate(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Standard Co-Pay ($ USD)</label>
                <input
                  type="number"
                  value={proposedStandardCopay}
                  onChange={(e) => setProposedStandardCopay(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-emerald-800 border-b border-slate-200 pb-2">
              4. Social Media &amp; Professional Profiles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Professional Instagram / X URL</label>
                <input
                  type="url"
                  placeholder="https://x.com/drprofile"
                  value={instagramOrXUrl}
                  onChange={(e) => setInstagramOrXUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ResearchGate / Clinical Website URL</label>
                <input
                  type="url"
                  placeholder="https://researchgate.net/profile/..."
                  value={websiteOrResearchGateUrl}
                  onChange={(e) => setWebsiteOrResearchGateUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-lg text-sm"
          >
            Submit Practitioner Application for Manual Verification
          </button>
        </form>
      </div>
    </div>
  );
};
