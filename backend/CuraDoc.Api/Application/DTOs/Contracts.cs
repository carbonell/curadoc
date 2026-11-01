using System.ComponentModel.DataAnnotations;
using CuraDoc.Api.Domain.Entities;

namespace CuraDoc.Api.Application.DTOs;

public record AuthLoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthLoginResponse(
    Guid UserId,
    string Email,
    string FullName,
    UserRole Role,
    string AccessToken
);

public record SpecialtyDto(
    Guid Id,
    string Name,
    string? Description,
    string? IconCode,
    bool IsActive
);

public class UpsertSpecialtyRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public required string Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(64)]
    public string? IconCode { get; set; }

    public bool IsActive { get; set; } = true;
}

public record InsuranceProviderDto(
    Guid Id,
    string Name,
    string PlanName,
    decimal DefaultNetworkDiscount,
    bool IsActive
);

public class UpsertInsuranceProviderRequest
{
    [Required, StringLength(150, MinimumLength = 2)]
    public required string Name { get; set; }

    [Required, StringLength(150, MinimumLength = 2)]
    public required string PlanName { get; set; }

    [Range(0, 10000)]
    public decimal DefaultNetworkDiscount { get; set; }

    public bool IsActive { get; set; } = true;
}

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

public class UpsertClinicRequest
{
    [Required, StringLength(200, MinimumLength = 2)]
    public required string Name { get; set; }

    [Required, StringLength(200)]
    public required string StreetAddress { get; set; }

    [Required, StringLength(100)]
    public required string City { get; set; }

    [Required, StringLength(50)]
    public required string State { get; set; }

    [Required, StringLength(20)]
    public required string ZipCode { get; set; }

    [StringLength(32)]
    public string? PhoneNumber { get; set; }

    [StringLength(100)]
    public string? BadgeLabel { get; set; }

    public decimal AverageRating { get; set; } = 4.8m;
    public int AvailableSlotsToday { get; set; } = 10;
    public bool HasParkingValidation { get; set; } = true;
    public bool IsAdaCompliant { get; set; } = true;
}

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
    string? ExequaturNumber,
    string? IdentityDocumentNumber,
    string? LinkedInUrl,
    string? InstagramOrXUrl,
    string? WebsiteOrResearchGateUrl,
    ClinicSummaryDto Clinic
);

public class UpsertDoctorRequest
{
    [Required, StringLength(150)]
    public required string FullName { get; set; }

    [Required, StringLength(64)]
    public required string Credentials { get; set; }

    [Required, StringLength(100)]
    public required string PrimarySpecialty { get; set; }

    [StringLength(150)]
    public string? SubSpecialty { get; set; }

    [StringLength(32)]
    public string? Gender { get; set; }

    public string? ExequaturNumber { get; set; }
    public string? IdentityDocumentNumber { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? InstagramOrXUrl { get; set; }
    public string? WebsiteOrResearchGateUrl { get; set; }

    public decimal ConsultationRate { get; set; } = 220m;
    public decimal StandardCopay { get; set; } = 45m;
    public decimal SelfPayRate { get; set; } = 180m;

    [Required]
    public Guid ClinicId { get; set; }
}

public class CreateDoctorApplicationRequest
{
    [Required, StringLength(150, MinimumLength = 2)]
    public required string FullName { get; set; }

    [Required, EmailAddress]
    public required string Email { get; set; }

    [Required, Phone]
    public required string PhoneNumber { get; set; }

    [Required, StringLength(64)]
    public required string Credentials { get; set; }

    [Required, StringLength(100)]
    public required string PrimarySpecialty { get; set; }

    [StringLength(150)]
    public string? SubSpecialty { get; set; }

    [StringLength(32)]
    public string? Gender { get; set; }

    [Required, StringLength(64, MinimumLength = 3)]
    public required string ExequaturNumber { get; set; }

    [Required, StringLength(64, MinimumLength = 5)]
    public required string IdentityDocumentNumber { get; set; }

    [Url]
    public string? LinkedInUrl { get; set; }

    [Url]
    public string? InstagramOrXUrl { get; set; }

    [Url]
    public string? WebsiteOrResearchGateUrl { get; set; }

    [Required]
    public Guid PreferredClinicId { get; set; }

    [Range(0, 5000)]
    public decimal ProposedConsultationRate { get; set; } = 220.00m;

    [Range(0, 1000)]
    public decimal ProposedStandardCopay { get; set; } = 45.00m;
}

public record DoctorApplicationDto(
    Guid Id,
    string FullName,
    string Email,
    string PhoneNumber,
    string Credentials,
    string PrimarySpecialty,
    string? SubSpecialty,
    string? Gender,
    string ExequaturNumber,
    string IdentityDocumentNumber,
    string? LinkedInUrl,
    string? InstagramOrXUrl,
    string? WebsiteOrResearchGateUrl,
    Guid PreferredClinicId,
    string PreferredClinicName,
    decimal ProposedConsultationRate,
    decimal ProposedStandardCopay,
    DoctorApplicationStatus Status,
    string? ReviewerNotes,
    DateTime CreatedAt,
    DateTime? ReviewedAt,
    string? ReviewedByEmail,
    Guid? ApprovedDoctorId
);

public class ReviewDoctorApplicationRequest
{
    [Required]
    public bool Approve { get; set; }

    [StringLength(1000)]
    public string? ReviewerNotes { get; set; }
}

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
