using System.ComponentModel.DataAnnotations;
using CuraDoc.Api.Domain.Entities;

namespace CuraDoc.Api.Application.DTOs;

public record ClinicSummaryDto(
    Guid Id,
    string Name,
    string StreetAddress,
    string City,
    string State,
    string ZipCode,
    string? PhoneNumber,
    string? BadgeLabel,
    decimal AverageRating,
    int ReviewCount,
    int AvailableSlotsToday,
    bool HasParkingValidation,
    bool IsAdaCompliant,
    double Latitude,
    double Longitude
);

public record DoctorCardDto(
    Guid Id,
    string FullName,
    string Credentials,
    string PrimarySpecialty,
    string? SubSpecialty,
    bool IsBoardCertified,
    bool IsTopRated,
    decimal AverageRating,
    int VerifiedReviewCount,
    decimal ConsultationRate,
    decimal StandardCopay,
    decimal SelfPayRate,
    DateTime? NextAvailableSlot,
    ClinicSummaryDto Clinic
);

public record ScheduleSlotDto(
    Guid Id,
    DateTime StartTimeUtc,
    int DurationMinutes,
    bool IsBooked
);

public record DoctorSearchFilterDto(
    string? Specialty,
    string? Location,
    string? Insurance,
    string? Gender,
    decimal? MinRating,
    string? SortBy // "rating", "availability"
);

public class CreateAppointmentRequest
{
    [Required]
    public Guid DoctorId { get; set; }

    public Guid? ScheduleSlotId { get; set; }

    [Required]
    public DateTime AppointmentDateTime { get; set; }

    [Required]
    public CareDeliveryMode DeliveryMode { get; set; } = CareDeliveryMode.InPersonVisit;

    public bool IsForSelf { get; set; } = true;

    [Required, StringLength(150, MinimumLength = 2)]
    public required string PatientFullName { get; set; }

    [Required]
    public DateOnly PatientDateOfBirth { get; set; }

    [Required, Phone]
    public required string PatientPhoneNumber { get; set; }

    [Required, EmailAddress]
    public required string PatientEmail { get; set; }

    [StringLength(64)]
    public string? InsuranceMemberId { get; set; }

    [StringLength(64)]
    public string? InsuranceGroupNumber { get; set; }

    [StringLength(1000)]
    public string? PrimaryReasonForVisit { get; set; }

    public bool SmsRemindersOptIn { get; set; } = true;
}

public record AppointmentConfirmationDto(
    Guid Id,
    string ConfirmationCode,
    string ProviderFullName,
    string ProviderSpecialty,
    DateTime AppointmentDateTime,
    CareDeliveryMode DeliveryMode,
    string ClinicName,
    string ClinicAddress,
    decimal EstimatedCopay,
    string PatientEmail,
    AppointmentStatus Status
);

public class SubmitFeedbackRequest
{
    [Range(1, 5)]
    public int Rating { get; set; }

    [StringLength(1000)]
    public string? Comment { get; set; }
}
