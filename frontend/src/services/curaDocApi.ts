import {
  AppointmentConfirmation,
  ClinicSummary,
  CreateAppointmentPayload,
  DoctorCard,
  DoctorSearchFilter,
  ScheduleSlot,
} from '../types/models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
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
  getFeaturedClinics: () => request<ClinicSummary[]>('/clinics/featured'),

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
};
