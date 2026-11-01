import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authStore, curaDocApi } from '../services/curaDocApi';
import {
  ClinicSummary,
  DoctorApplicationItem,
  DoctorApplicationStatus,
  DoctorCard,
  InsuranceProviderItem,
  SpecialtyItem,
  UserRole,
} from '../types/models';

type BackofficeTab = 'applications' | 'specialties' | 'clinics' | 'insurances' | 'doctors';

export const BackofficePage: React.FC = () => {
  const session = authStore.getSession();
  const [activeTab, setActiveTab] = useState<BackofficeTab>('applications');

  const [applications, setApplications] = useState<DoctorApplicationItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<DoctorApplicationItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecDesc, setNewSpecDesc] = useState('');

  const [clinics, setClinics] = useState<ClinicSummary[]>([]);
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicAddress, setNewClinicAddress] = useState('');
  const [newClinicCity, setNewClinicCity] = useState('Chicago');
  const [newClinicState, setNewClinicState] = useState('IL');
  const [newClinicZip, setNewClinicZip] = useState('60611');
  const [newClinicBadge, setNewClinicBadge] = useState('Verified Clinical Center');

  const [insurances, setInsurances] = useState<InsuranceProviderItem[]>([]);
  const [newInsName, setNewInsName] = useState('');
  const [newInsPlan, setNewInsPlan] = useState('');
  const [newInsDiscount, setNewInsDiscount] = useState(165);

  const [doctors, setDoctors] = useState<DoctorCard[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isSuperAdmin = session?.role === UserRole.SuperAdmin;

  const refreshAll = async () => {
    if (!isSuperAdmin) return;
    const [apps, specs, clins, ins, docs] = await Promise.all([
      curaDocApi.backoffice.getApplications(),
      curaDocApi.backoffice.getSpecialties(),
      curaDocApi.backoffice.getClinics(),
      curaDocApi.backoffice.getInsurances(),
      curaDocApi.backoffice.getDoctors(),
    ]);
    setApplications(apps);
    setSpecialties(specs);
    setClinics(clins);
    setInsurances(ins);
    setDoctors(docs);
  };

  useEffect(() => {
    refreshAll().catch(console.error);
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <span className="inline-block bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
            403 RESTRICTED AREA
          </span>
          <h1 className="text-2xl font-bold">SuperAdmin Access Required</h1>
          <p className="text-sm text-slate-600">
            The CuraDoc Backoffice and Doctor Credentialing Portal can only be accessed by authenticated{' '}
            <strong>SuperAdmin</strong> accounts.
          </p>
          <Link
            to="/sign-in"
            className="inline-block bg-emerald-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg"
          >
            Sign In as SuperAdmin →
          </Link>
        </div>
      </div>
    );
  }

  const handleReviewApplication = async (id: string, approve: boolean) => {
    await curaDocApi.backoffice.reviewApplication(id, approve, reviewNotes);
    setStatusMessage(
      approve
        ? 'Doctor application approved and practitioner profile published to live directory!'
        : 'Doctor application marked as rejected.',
    );
    setSelectedApp(null);
    setReviewNotes('');
    await refreshAll();
  };

  const handleAddSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    await curaDocApi.backoffice.createSpecialty({
      name: newSpecName,
      description: newSpecDesc,
      iconCode: 'stethoscope',
      isActive: true,
    });
    setNewSpecName('');
    setNewSpecDesc('');
    await refreshAll();
  };

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    await curaDocApi.backoffice.createClinic({
      name: newClinicName,
      streetAddress: newClinicAddress,
      city: newClinicCity,
      state: newClinicState,
      zipCode: newClinicZip,
      badgeLabel: newClinicBadge,
      averageRating: 4.9,
      availableSlotsToday: 15,
      hasParkingValidation: true,
      isAdaCompliant: true,
    });
    setNewClinicName('');
    setNewClinicAddress('');
    await refreshAll();
  };

  const handleAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    await curaDocApi.backoffice.createInsurance({
      name: newInsName,
      planName: newInsPlan,
      defaultNetworkDiscount: newInsDiscount,
      isActive: true,
    });
    setNewInsName('');
    setNewInsPlan('');
    await refreshAll();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase text-emerald-800">SUPERADMIN GOVERNANCE PORTAL</span>
          <h1 className="text-2xl font-bold">CuraDoc Backoffice &amp; Credential Validation</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {(
            [
              ['applications', `Doctor Applications (${applications.filter((a) => a.status === 1).length} Pending)`],
              ['specialties', `Specialties (${specialties.length})`],
              ['clinics', `Clinics (${clinics.length})`],
              ['insurances', `Insurances (${insurances.length})`],
              ['doctors', `Verified Doctors (${doctors.length})`],
            ] as [BackofficeTab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-lg border ${
                activeTab === tab
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold p-3 rounded-lg flex justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>✕</button>
        </div>
      )}

      {/* TAB 1: DOCTOR SIGN-UP VALIDATION MODULE */}
      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                <tr>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Exequatur &amp; ID</th>
                  <th className="p-3">Specialty</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">
                        {app.fullName}, {app.credentials}
                      </p>
                      <p className="text-slate-500">{app.email}</p>
                    </td>
                    <td className="p-3 font-mono">
                      <div>EXQ: {app.exequaturNumber}</div>
                      <div className="text-slate-500">ID: {app.identityDocumentNumber}</div>
                    </td>
                    <td className="p-3">{app.primarySpecialty}</td>
                    <td className="p-3">
                      {app.status === DoctorApplicationStatus.Pending && (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">Pending</span>
                      )}
                      {app.status === DoctorApplicationStatus.Approved && (
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                          Approved
                        </span>
                      )}
                      {app.status === DoctorApplicationStatus.Rejected && (
                        <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-semibold">Rejected</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewNotes(app.reviewerNotes || '');
                        }}
                        className="text-emerald-800 font-semibold underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4 h-fit">
            {selectedApp ? (
              <>
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase text-emerald-800">Credential Verification Dossier</span>
                  <h3 className="text-lg font-bold">
                    {selectedApp.fullName}, {selectedApp.credentials}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedApp.primarySpecialty} • {selectedApp.preferredClinicName}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 border border-slate-200">
                  <p>
                    <strong>Exequatur License:</strong>{' '}
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded border">{selectedApp.exequaturNumber}</code>
                  </p>
                  <p>
                    <strong>Identity Document:</strong>{' '}
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded border">
                      {selectedApp.identityDocumentNumber}
                    </code>
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedApp.phoneNumber}
                  </p>
                  <p>
                    <strong>Proposed Rates:</strong> ${selectedApp.proposedConsultationRate} Consultation / $
                    {selectedApp.proposedStandardCopay} Co-Pay
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-700">Social Media &amp; Professional Profiles:</p>
                  {selectedApp.linkedInUrl && (
                    <a
                      href={selectedApp.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-emerald-800 underline"
                    >
                      LinkedIn: {selectedApp.linkedInUrl}
                    </a>
                  )}
                  {selectedApp.instagramOrXUrl && (
                    <a
                      href={selectedApp.instagramOrXUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-emerald-800 underline"
                    >
                      Instagram / X: {selectedApp.instagramOrXUrl}
                    </a>
                  )}
                  {selectedApp.websiteOrResearchGateUrl && (
                    <a
                      href={selectedApp.websiteOrResearchGateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-emerald-800 underline"
                    >
                      ResearchGate / Website: {selectedApp.websiteOrResearchGateUrl}
                    </a>
                  )}
                </div>

                <textarea
                  rows={2}
                  placeholder="SuperAdmin verification notes (e.g., Exequatur verified with National Medical Registry)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => handleReviewApplication(selectedApp.id, true)}
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-2 rounded-lg text-xs"
                  >
                    ✓ Approve &amp; Publish Doctor
                  </button>
                  <button
                    onClick={() => handleReviewApplication(selectedApp.id, false)}
                    className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-semibold py-2 rounded-lg text-xs"
                  >
                    ✕ Reject Application
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">
                Select a doctor application from the table to inspect Exequatur, National ID, and social media profiles.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SPECIALTIES CRUD */}
      {activeTab === 'specialties' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddSpecialty}
            className="md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-3 h-fit"
          >
            <h3 className="font-bold text-sm">Add Medical Specialty</h3>
            <input
              required
              placeholder="Specialty Name (e.g., Neurology)"
              value={newSpecName}
              onChange={(e) => setNewSpecName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <input
              placeholder="Clinical Description"
              value={newSpecDesc}
              onChange={(e) => setNewSpecDesc(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <button type="submit" className="w-full bg-emerald-800 text-white font-semibold py-2 rounded-lg text-xs">
              + Create Specialty
            </button>
          </form>

          <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3">Specialty</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {specialties.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold">{s.name}</td>
                    <td className="p-3 text-slate-600">{s.description}</td>
                    <td className="p-3">
                      <button
                        onClick={() => curaDocApi.backoffice.deleteSpecialty(s.id).then(refreshAll)}
                        className="text-rose-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLINICS CRUD */}
      {activeTab === 'clinics' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddClinic}
            className="md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-3 h-fit"
          >
            <h3 className="font-bold text-sm">Add Medical Center / Clinic</h3>
            <input
              required
              placeholder="Clinic Name"
              value={newClinicName}
              onChange={(e) => setNewClinicName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <input
              required
              placeholder="Street Address"
              value={newClinicAddress}
              onChange={(e) => setNewClinicAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                required
                placeholder="City"
                value={newClinicCity}
                onChange={(e) => setNewClinicCity(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
              />
              <input
                required
                placeholder="State"
                value={newClinicState}
                onChange={(e) => setNewClinicState(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
              />
              <input
                required
                placeholder="Zip"
                value={newClinicZip}
                onChange={(e) => setNewClinicZip(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
              />
            </div>
            <input
              placeholder="Accreditation Badge (e.g., Level 1 Trauma Center)"
              value={newClinicBadge}
              onChange={(e) => setNewClinicBadge(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <button type="submit" className="w-full bg-emerald-800 text-white font-semibold py-2 rounded-lg text-xs">
              + Create Clinic
            </button>
          </form>

          <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3">Clinic Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Badge</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clinics.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-bold">{c.name}</td>
                    <td className="p-3 text-slate-600">
                      {c.streetAddress}, {c.city}, {c.state}
                    </td>
                    <td className="p-3">{c.badgeLabel}</td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          curaDocApi.backoffice
                            .deleteClinic(c.id)
                            .then(refreshAll)
                            .catch((err) => setStatusMessage(err.message))
                        }
                        className="text-rose-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INSURANCES CRUD */}
      {activeTab === 'insurances' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddInsurance}
            className="md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-3 h-fit"
          >
            <h3 className="font-bold text-sm">Add Insurance Provider</h3>
            <input
              required
              placeholder="Carrier Name (e.g., Humana)"
              value={newInsName}
              onChange={(e) => setNewInsName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <input
              required
              placeholder="Plan Tier (e.g., PPO Gold)"
              value={newInsPlan}
              onChange={(e) => setNewInsPlan(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <input
              type="number"
              placeholder="Default In-Network Discount ($)"
              value={newInsDiscount}
              onChange={(e) => setNewInsDiscount(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            <button type="submit" className="w-full bg-emerald-800 text-white font-semibold py-2 rounded-lg text-xs">
              + Create Insurance Plan
            </button>
          </form>

          <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3">Insurance Carrier</th>
                  <th className="p-3">Plan Name</th>
                  <th className="p-3">In-Network Discount</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {insurances.map((ins) => (
                  <tr key={ins.id}>
                    <td className="p-3 font-bold">{ins.name}</td>
                    <td className="p-3">{ins.planName}</td>
                    <td className="p-3 text-emerald-800 font-semibold">-${ins.defaultNetworkDiscount.toFixed(2)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => curaDocApi.backoffice.deleteInsurance(ins.id).then(refreshAll)}
                        className="text-rose-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: VERIFIED DOCTORS DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3">Practitioner</th>
                <th className="p-3">Exequatur &amp; ID</th>
                <th className="p-3">Specialty</th>
                <th className="p-3">Clinic</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td className="p-3 font-bold">
                    {d.fullName}, {d.credentials}
                  </td>
                  <td className="p-3 font-mono">
                    {d.exequaturNumber || 'N/A'} • {d.identityDocumentNumber || 'N/A'}
                  </td>
                  <td className="p-3">{d.primarySpecialty}</td>
                  <td className="p-3">{d.clinic.name}</td>
                  <td className="p-3">
                    <button
                      onClick={() => curaDocApi.backoffice.deleteDoctor(d.id).then(refreshAll)}
                      className="text-rose-700 font-semibold"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
