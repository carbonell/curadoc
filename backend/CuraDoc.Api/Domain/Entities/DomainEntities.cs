using System;
using System.Collections.Generic;

namespace CuraDoc.Api.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public enum CareDeliveryMode
{
    InPersonVisit = 1,
    VirtualVideo = 2
}

public enum AppointmentStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Completed = 4
}

public enum DoctorApplicationStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public enum UserRole
{
    Patient = 1,
    Doctor = 2,
    SuperAdmin = 3
}

public class AppUser : BaseEntity
{
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.Patient;
}

public class Specialty : BaseEntity
{
    public required string Name { get; set; } // e.g., "Cardiology", "Dermatology"
    public string? Description { get; set; }
    public string? IconCode { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Clinic : BaseEntity
{
    public required string Name { get; set; }
    public required string StreetAddress { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string ZipCode { get; set; }
    public string? PhoneNumber { get; set; }
    public string? BadgeLabel { get; set; } // e.g., "Level 1 Trauma Center", "Magnet Recognized"
    public string? ImageUrl { get; set; }
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int AvailableSlotsToday { get; set; }
    public bool HasParkingValidation { get; set; }
    public bool IsAdaCompliant { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}

public class Doctor : BaseEntity
{
    public required string FullName { get; set; }
    public required string Credentials { get; set; } // e.g., "MD, FACC"
    public required string PrimarySpecialty { get; set; } // e.g., "Cardiology"
    public string? SubSpecialty { get; set; } // e.g., "Cardiologist & Electrophysiologist"
    public string? Gender { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsBoardCertified { get; set; } = true;
    public bool IsTopRated { get; set; }
    public decimal AverageRating { get; set; }
    public int VerifiedReviewCount { get; set; }

    // Credentialing & Identity Verification Fields
    public string? ExequaturNumber { get; set; }
    public string? IdentityDocumentNumber { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? InstagramOrXUrl { get; set; }
    public string? WebsiteOrResearchGateUrl { get; set; }

    // Financial / Co-pay details
    public decimal ConsultationRate { get; set; } // e.g., 220.00m
    public decimal StandardCopay { get; set; } // e.g., 45.00m
    public decimal SelfPayRate { get; set; } // e.g., 180.00m
    public DateTime? NextAvailableSlot { get; set; }

    public Guid ClinicId { get; set; }
    public Clinic? Clinic { get; set; }

    public ICollection<DoctorScheduleSlot> ScheduleSlots { get; set; } = new List<DoctorScheduleSlot>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}

public class DoctorApplication : BaseEntity
{
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Credentials { get; set; } // e.g., "MD, FACC"
    public required string PrimarySpecialty { get; set; }
    public string? SubSpecialty { get; set; }
    public string? Gender { get; set; }

    // Mandatory Validation Fields
    public required string ExequaturNumber { get; set; }
    public required string IdentityDocumentNumber { get; set; }

    // Social Media Professional Profiles
    public string? LinkedInUrl { get; set; }
    public string? InstagramOrXUrl { get; set; }
    public string? WebsiteOrResearchGateUrl { get; set; }

    public Guid PreferredClinicId { get; set; }
    public Clinic? PreferredClinic { get; set; }

    public decimal ProposedConsultationRate { get; set; } = 200.00m;
    public decimal ProposedStandardCopay { get; set; } = 45.00m;

    public DoctorApplicationStatus Status { get; set; } = DoctorApplicationStatus.Pending;
    public string? ReviewerNotes { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByEmail { get; set; }
    public Guid? ApprovedDoctorId { get; set; }
}

public class InsuranceProvider : BaseEntity
{
    public required string Name { get; set; } // e.g., "BlueCross BlueShield"
    public required string PlanName { get; set; } // e.g., "BCBS PPO Tier 1"
    public decimal DefaultNetworkDiscount { get; set; } // e.g., 175.00m
    public bool IsActive { get; set; } = true;
}

public class DoctorScheduleSlot : BaseEntity
{
    public Guid DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    public DateTime StartTimeUtc { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public bool IsBooked { get; set; }
}

public class Appointment : BaseEntity
{
    public required string ConfirmationCode { get; set; } // e.g., "MED-8942-CH"
    
    public Guid DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    public Guid? ScheduleSlotId { get; set; }
    public DoctorScheduleSlot? ScheduleSlot { get; set; }

    public DateTime AppointmentDateTime { get; set; }
    public CareDeliveryMode DeliveryMode { get; set; } = CareDeliveryMode.InPersonVisit;
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Confirmed;

    // Patient Intake Details (Step 3 of Booking)
    public bool IsForSelf { get; set; } = true;
    public required string PatientFullName { get; set; }
    public DateOnly PatientDateOfBirth { get; set; }
    public required string PatientPhoneNumber { get; set; }
    public required string PatientEmail { get; set; }
    public string? InsuranceMemberId { get; set; }
    public string? InsuranceGroupNumber { get; set; }
    public string? PrimaryReasonForVisit { get; set; }
    public bool SmsRemindersOptIn { get; set; } = true;
    public decimal EstimatedCopay { get; set; }

    // Post-Booking Feedback (Screen 0)
    public int? ExperienceRating { get; set; }
    public string? ExperienceFeedback { get; set; }
}
