import {
  AppointmentConfirmation,
  AuthSession,
  ClinicSummary,
  CreateAppointmentPayload,
  CreateDoctorApplicationPayload,
  DoctorApplicationItem,
  DoctorApplicationStatus,
  DoctorCard,
  DoctorSearchFilter,
  InsuranceProviderItem,
  ScheduleSlot,
  SpecialtyItem,
} from '../types/models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'curadoc_auth_session';

export const authStore = {
  getSession(): AuthSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },
  setSession(session: AuthSession | null) {
    if (!session) localStorage.removeItem(AUTH_STORAGE_KEY);
    else localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('curadoc-auth-change'));
  },
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const session = authStore.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const curaDocApi = {
  // Authentication
  login: (email: string, password: string) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Public Catalog & Clinics
  getAllClinics: () => request<ClinicSummary[]>('/clinics'),
  getFeaturedClinics: () => request<ClinicSummary[]>('/clinics/featured'),
  getActiveSpecialties: () => request<SpecialtyItem[]>('/catalog/specialties'),
  getActiveInsurances: () => request<InsuranceProviderItem[]>('/catalog/insurances'),

  // Public Doctor Search & Booking
  searchDoctors: (filter: DoctorSearchFilter) => {
    const params = new URLSearchParams();
    if (filter.specialty) params.set('specialty', filter.specialty);
    if (filter.location) params.set('location', filter.location);
    if (filter.insurance) params.set('insurance', filter.insurance);
    if (filter.gender) params.set('gender', filter.gender);
    if (filter.minRating) params.set('minRating', String(filter.minRating));
    if (filter.sortBy) params.set('sortBy', filter.sortBy);
    const qs = params.toString();
    return request<DoctorCard[]>(`/doctors${qs ? `?${qs}` : ''}`);
  },

  getDoctorById: (id: string) => request<DoctorCard>(`/doctors/${id}`),

  getDoctorSlots: (doctorId: string, date?: string) =>
    request<ScheduleSlot[]>(`/doctors/${doctorId}/slots${date ? `?date=${date}` : ''}`),

  createAppointment: (payload: CreateAppointmentPayload) =>
    request<AppointmentConfirmation>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAppointmentByCode: (code: string) =>
    request<AppointmentConfirmation>(`/appointments/${encodeURIComponent(code)}`),

  submitFeedback: (code: string, rating: number, comment?: string) =>
    request<void>(`/appointments/${encodeURIComponent(code)}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),

  // Doctor Registration Application (Public submission, manually validated by SuperAdmin)
  submitDoctorApplication: (payload: CreateDoctorApplicationPayload) =>
    request<DoctorApplicationItem>('/doctorapplications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Backoffice Endpoints (SuperAdmin Only)
  backoffice: {
    getApplications: (status?: DoctorApplicationStatus) =>
      request<DoctorApplicationItem[]>(`/backoffice/doctor-applications${status ? `?status=${status}` : ''}`),

    reviewApplication: (id: string, approve: boolean, reviewerNotes?: string) =>
      request<DoctorApplicationItem>(`/backoffice/doctor-applications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ approve, reviewerNotes }),
      }),

    getSpecialties: () => request<SpecialtyItem[]>('/backoffice/specialties'),
    createSpecialty: (body: Omit<SpecialtyItem, 'id'>) =>
      request<SpecialtyItem>('/backoffice/specialties', { method: 'POST', body: JSON.stringify(body) }),
    updateSpecialty: (id: string, body: Omit<SpecialtyItem, 'id'>) =>
      request<SpecialtyItem>(`/backoffice/specialties/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteSpecialty: (id: string) =>
      request<void>(`/backoffice/specialties/${id}`, { method: 'DELETE' }),

    getClinics: () => request<ClinicSummary[]>('/backoffice/clinics'),
    createClinic: (body: Partial<ClinicSummary>) =>
      request<ClinicSummary>('/backoffice/clinics', { method: 'POST', body: JSON.stringify(body) }),
    updateClinic: (id: string, body: Partial<ClinicSummary>) =>
      request<ClinicSummary>(`/backoffice/clinics/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteClinic: (id: string) =>
      request<void>(`/backoffice/clinics/${id}`, { method: 'DELETE' }),

    getInsurances: () => request<InsuranceProviderItem[]>('/backoffice/insurances'),
    createInsurance: (body: Omit<InsuranceProviderItem, 'id'>) =>
      request<InsuranceProviderItem>('/backoffice/insurances', { method: 'POST', body: JSON.stringify(body) }),
    updateInsurance: (id: string, body: Omit<InsuranceProviderItem, 'id'>) =>
      request<InsuranceProviderItem>(`/backoffice/insurances/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteInsurance: (id: string) =>
      request<void>(`/backoffice/insurances/${id}`, { method: 'DELETE' }),

    getDoctors: () => request<DoctorCard[]>('/backoffice/doctors'),
    deleteDoctor: (id: string) =>
      request<void>(`/backoffice/doctors/${id}`, { method: 'DELETE' }),
  },
};
