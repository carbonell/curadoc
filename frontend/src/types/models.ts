export enum CareDeliveryMode {
  InPersonVisit = 1,
  VirtualVideo = 2,
}

export enum AppointmentStatus {
  Pending = 1,
  Confirmed = 2,
  Cancelled = 3,
  Completed = 4,
}

export interface ClinicSummary {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  badgeLabel?: string;
  averageRating: number;
  reviewCount: number;
  availableSlotsToday: number;
  hasParkingValidation: boolean;
  isAdaCompliant: boolean;
  latitude: number;
  longitude: number;
}

export interface DoctorCard {
  id: string;
  fullName: string;
  credentials: string;
  primarySpecialty: string;
  subSpecialty?: string;
  isBoardCertified: boolean;
  isTopRated: boolean;
  averageRating: number;
  verifiedReviewCount: number;
  consultationRate: number;
  standardCopay: number;
  selfPayRate: number;
  nextAvailableSlot?: string;
  clinic: ClinicSummary;
}

export interface ScheduleSlot {
  id: string;
  startTimeUtc: string;
  durationMinutes: number;
  isBooked: boolean;
}

export interface DoctorSearchFilter {
  specialty?: string;
  location?: string;
  insurance?: string;
  gender?: string;
  minRating?: number;
  sortBy?: 'rating' | 'availability';
}

export interface CreateAppointmentPayload {
  doctorId: string;
  scheduleSlotId?: string;
  appointmentDateTime: string;
  deliveryMode: CareDeliveryMode;
  isForSelf: boolean;
  patientFullName: string;
  patientDateOfBirth: string;
  patientPhoneNumber: string;
  patientEmail: string;
  insuranceMemberId?: string;
  insuranceGroupNumber?: string;
  primaryReasonForVisit?: string;
  smsRemindersOptIn: boolean;
}

export interface AppointmentConfirmation {
  id: string;
  confirmationCode: string;
  providerFullName: string;
  providerSpecialty: string;
  appointmentDateTime: string;
  deliveryMode: CareDeliveryMode;
  clinicName: string;
  clinicAddress: string;
  estimatedCopay: number;
  patientEmail: string;
  status: AppointmentStatus;
}
