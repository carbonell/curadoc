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

public class InsuranceProvider : BaseEntity
{
    public required string Name { get; set; } // e.g., "BlueCross BlueShield"
    public required string PlanName { get; set; } // e.g., "BCBS PPO Tier 1"
    public decimal DefaultNetworkDiscount { get; set; } // e.g., 175.00m
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
