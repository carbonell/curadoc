using CuraDoc.Api.Application.DTOs;
using CuraDoc.Api.Domain.Entities;
using CuraDoc.Api.Infrastructure.Auth;
using CuraDoc.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuraDoc.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly CuraDocDbContext _db;

    public AuthController(CuraDocDbContext db) => _db = db;

    [HttpPost("login")]
    public async Task<ActionResult<AuthLoginResponse>> Login([FromBody] AuthLoginRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user == null || user.PasswordHash != request.Password)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = SimpleTokenService.CreateToken(user);
        return Ok(new AuthLoginResponse(user.Id, user.Email, user.FullName, user.Role, token));
    }
}

[ApiController]
[Route("api/[controller]")]
public class DoctorApplicationsController : ControllerBase
{
    private readonly CuraDocDbContext _db;

    public DoctorApplicationsController(CuraDocDbContext db) => _db = db;

    [HttpPost]
    public async Task<ActionResult<DoctorApplicationDto>> SubmitApplication([FromBody] CreateDoctorApplicationRequest request)
    {
        var clinic = await _db.Clinics.AsNoTracking().FirstOrDefaultAsync(c => c.Id == request.PreferredClinicId);
        if (clinic == null)
        {
            return BadRequest(new { message = "Selected preferred clinic does not exist." });
        }

        var app = new DoctorApplication
        {
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Credentials = request.Credentials,
            PrimarySpecialty = request.PrimarySpecialty,
            SubSpecialty = request.SubSpecialty,
            Gender = request.Gender,
            ExequaturNumber = request.ExequaturNumber,
            IdentityDocumentNumber = request.IdentityDocumentNumber,
            LinkedInUrl = request.LinkedInUrl,
            InstagramOrXUrl = request.InstagramOrXUrl,
            WebsiteOrResearchGateUrl = request.WebsiteOrResearchGateUrl,
            PreferredClinicId = request.PreferredClinicId,
            ProposedConsultationRate = request.ProposedConsultationRate,
            ProposedStandardCopay = request.ProposedStandardCopay,
            Status = DoctorApplicationStatus.Pending
        };

        _db.DoctorApplications.Add(app);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetApplicationStatus), new { id = app.Id }, new DoctorApplicationDto(
            app.Id, app.FullName, app.Email, app.PhoneNumber, app.Credentials, app.PrimarySpecialty,
            app.SubSpecialty, app.Gender, app.ExequaturNumber, app.IdentityDocumentNumber,
            app.LinkedInUrl, app.InstagramOrXUrl, app.WebsiteOrResearchGateUrl,
            app.PreferredClinicId, clinic.Name, app.ProposedConsultationRate, app.ProposedStandardCopay,
            app.Status, app.ReviewerNotes, app.CreatedAt, app.ReviewedAt, app.ReviewedByEmail, app.ApprovedDoctorId
        ));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DoctorApplicationDto>> GetApplicationStatus(Guid id)
    {
        var a = await _db.DoctorApplications.Include(x => x.PreferredClinic).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (a == null) return NotFound();

        return Ok(new DoctorApplicationDto(
            a.Id, a.FullName, a.Email, a.PhoneNumber, a.Credentials, a.PrimarySpecialty,
            a.SubSpecialty, a.Gender, a.ExequaturNumber, a.IdentityDocumentNumber,
            a.LinkedInUrl, a.InstagramOrXUrl, a.WebsiteOrResearchGateUrl,
            a.PreferredClinicId, a.PreferredClinic?.Name ?? "N/A", a.ProposedConsultationRate, a.ProposedStandardCopay,
            a.Status, a.ReviewerNotes, a.CreatedAt, a.ReviewedAt, a.ReviewedByEmail, a.ApprovedDoctorId
        ));
    }
}

[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private readonly CuraDocDbContext _db;

    public CatalogController(CuraDocDbContext db) => _db = db;

    [HttpGet("specialties")]
    public async Task<ActionResult<IEnumerable<SpecialtyDto>>> GetActiveSpecialties()
    {
        var items = await _db.Specialties
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new SpecialtyDto(s.Id, s.Name, s.Description, s.IconCode, s.IsActive))
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("insurances")]
    public async Task<ActionResult<IEnumerable<InsuranceProviderDto>>> GetActiveInsurances()
    {
        var items = await _db.InsuranceProviders
            .AsNoTracking()
            .Where(i => i.IsActive)
            .OrderBy(i => i.Name)
            .Select(i => new InsuranceProviderDto(i.Id, i.Name, i.PlanName, i.DefaultNetworkDiscount, i.IsActive))
            .ToListAsync();
        return Ok(items);
    }
}

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly CuraDocDbContext _db;

    public DoctorsController(CuraDocDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DoctorCardDto>>> SearchDoctors([FromQuery] DoctorSearchFilterDto filter)
    {
        var query = _db.Doctors.Include(d => d.Clinic).AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Specialty))
        {
            var term = filter.Specialty.Trim().ToLower();
            query = query.Where(d =>
                d.PrimarySpecialty.ToLower().Contains(term) ||
                (d.SubSpecialty != null && d.SubSpecialty.ToLower().Contains(term)) ||
                d.FullName.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(filter.Location))
        {
            var loc = filter.Location.Trim().ToLower();
            query = query.Where(d =>
                d.Clinic != null &&
                (d.Clinic.City.ToLower().Contains(loc) || d.Clinic.ZipCode.Contains(loc)));
        }

        if (!string.IsNullOrWhiteSpace(filter.Gender) && filter.Gender != "Any")
        {
            query = query.Where(d => d.Gender == filter.Gender);
        }

        if (filter.MinRating.HasValue)
        {
            query = query.Where(d => d.AverageRating >= filter.MinRating.Value);
        }

        query = filter.SortBy?.ToLower() switch
        {
            "availability" => query.OrderBy(d => d.NextAvailableSlot),
            _ => query.OrderByDescending(d => d.AverageRating)
        };

        var doctors = await query.Select(d => new DoctorCardDto(
            d.Id,
            d.FullName,
            d.Credentials,
            d.PrimarySpecialty,
            d.SubSpecialty,
            d.IsBoardCertified,
            d.IsTopRated,
            d.AverageRating,
            d.VerifiedReviewCount,
            d.ConsultationRate,
            d.StandardCopay,
            d.SelfPayRate,
            d.NextAvailableSlot,
            d.ExequaturNumber,
            d.IdentityDocumentNumber,
            d.LinkedInUrl,
            d.InstagramOrXUrl,
            d.WebsiteOrResearchGateUrl,
            new ClinicSummaryDto(
                d.Clinic!.Id,
                d.Clinic.Name,
                d.Clinic.StreetAddress,
                d.Clinic.City,
                d.Clinic.State,
                d.Clinic.ZipCode,
                d.Clinic.PhoneNumber,
                d.Clinic.BadgeLabel,
                d.Clinic.AverageRating,
                d.Clinic.ReviewCount,
                d.Clinic.AvailableSlotsToday,
                d.Clinic.HasParkingValidation,
                d.Clinic.IsAdaCompliant,
                d.Clinic.Latitude,
                d.Clinic.Longitude
            )
        )).ToListAsync();

        return Ok(doctors);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DoctorCardDto>> GetDoctorById(Guid id)
    {
        var d = await _db.Doctors.Include(x => x.Clinic).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (d == null || d.Clinic == null) return NotFound();

        return Ok(new DoctorCardDto(
            d.Id, d.FullName, d.Credentials, d.PrimarySpecialty, d.SubSpecialty,
            d.IsBoardCertified, d.IsTopRated, d.AverageRating, d.VerifiedReviewCount,
            d.ConsultationRate, d.StandardCopay, d.SelfPayRate, d.NextAvailableSlot,
            d.ExequaturNumber, d.IdentityDocumentNumber, d.LinkedInUrl, d.InstagramOrXUrl, d.WebsiteOrResearchGateUrl,
            new ClinicSummaryDto(
                d.Clinic.Id, d.Clinic.Name, d.Clinic.StreetAddress, d.Clinic.City, d.Clinic.State,
                d.Clinic.ZipCode, d.Clinic.PhoneNumber, d.Clinic.BadgeLabel, d.Clinic.AverageRating,
                d.Clinic.ReviewCount, d.Clinic.AvailableSlotsToday, d.Clinic.HasParkingValidation,
                d.Clinic.IsAdaCompliant, d.Clinic.Latitude, d.Clinic.Longitude
            )
        ));
    }

    [HttpGet("{id:guid}/slots")]
    public async Task<ActionResult<IEnumerable<ScheduleSlotDto>>> GetAvailableSlots(Guid id, [FromQuery] DateOnly? date)
    {
        var query = _db.ScheduleSlots.AsNoTracking().Where(s => s.DoctorId == id);
        if (date.HasValue)
        {
            var start = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = date.Value.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
            query = query.Where(s => s.StartTimeUtc >= start && s.StartTimeUtc <= end);
        }

        var slots = await query
            .OrderBy(s => s.StartTimeUtc)
            .Select(s => new ScheduleSlotDto(s.Id, s.StartTimeUtc, s.DurationMinutes, s.IsBooked))
            .ToListAsync();

        return Ok(slots);
    }
}

[ApiController]
[Route("api/[controller]")]
public class ClinicsController : ControllerBase
{
    private readonly CuraDocDbContext _db;

    public ClinicsController(CuraDocDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClinicSummaryDto>>> GetAllClinics()
    {
        var clinics = await _db.Clinics
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new ClinicSummaryDto(
                c.Id, c.Name, c.StreetAddress, c.City, c.State, c.ZipCode,
                c.PhoneNumber, c.BadgeLabel, c.AverageRating, c.ReviewCount,
                c.AvailableSlotsToday, c.HasParkingValidation, c.IsAdaCompliant,
                c.Latitude, c.Longitude
            ))
            .ToListAsync();

        return Ok(clinics);
    }

    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<ClinicSummaryDto>>> GetFeaturedClinics()
    {
        var clinics = await _db.Clinics
            .AsNoTracking()
            .OrderByDescending(c => c.AverageRating)
            .Take(4)
            .Select(c => new ClinicSummaryDto(
                c.Id, c.Name, c.StreetAddress, c.City, c.State, c.ZipCode,
                c.PhoneNumber, c.BadgeLabel, c.AverageRating, c.ReviewCount,
                c.AvailableSlotsToday, c.HasParkingValidation, c.IsAdaCompliant,
                c.Latitude, c.Longitude
            ))
            .ToListAsync();

        return Ok(clinics);
    }
}

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly CuraDocDbContext _db;

    public AppointmentsController(CuraDocDbContext db) => _db = db;

    [HttpPost]
    public async Task<ActionResult<AppointmentConfirmationDto>> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        var doctor = await _db.Doctors.Include(d => d.Clinic).FirstOrDefaultAsync(d => d.Id == request.DoctorId);
        if (doctor == null || doctor.Clinic == null)
            return BadRequest(new { message = "Selected healthcare provider was not found." });

        if (request.ScheduleSlotId.HasValue)
        {
            var slot = await _db.ScheduleSlots.FirstOrDefaultAsync(s => s.Id == request.ScheduleSlotId.Value && s.DoctorId == doctor.Id);
            if (slot is { IsBooked: true })
                return Conflict(new { message = "The requested time slot has already been reserved." });

            if (slot != null)
                slot.IsBooked = true;
        }

        var code = $"MED-{Random.Shared.Next(1000, 9999)}-CH";
        var appointment = new Appointment
        {
            ConfirmationCode = code,
            DoctorId = doctor.Id,
            ScheduleSlotId = request.ScheduleSlotId,
            AppointmentDateTime = request.AppointmentDateTime,
            DeliveryMode = request.DeliveryMode,
            Status = AppointmentStatus.Confirmed,
            IsForSelf = request.IsForSelf,
            PatientFullName = request.PatientFullName,
            PatientDateOfBirth = request.PatientDateOfBirth,
            PatientPhoneNumber = request.PatientPhoneNumber,
            PatientEmail = request.PatientEmail,
            InsuranceMemberId = request.InsuranceMemberId,
            InsuranceGroupNumber = request.InsuranceGroupNumber,
            PrimaryReasonForVisit = request.PrimaryReasonForVisit,
            SmsRemindersOptIn = request.SmsRemindersOptIn,
            EstimatedCopay = doctor.StandardCopay
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        var response = MapToConfirmationDto(appointment, doctor);
        return CreatedAtAction(nameof(GetByConfirmationCode), new { code = appointment.ConfirmationCode }, response);
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<AppointmentConfirmationDto>> GetByConfirmationCode(string code)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Doctor)
            .ThenInclude(d => d!.Clinic)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.ConfirmationCode == code);

        if (appointment?.Doctor?.Clinic == null) return NotFound();

        return Ok(MapToConfirmationDto(appointment, appointment.Doctor));
    }

    [HttpPost("{code}/feedback")]
    public async Task<IActionResult> SubmitFeedback(string code, [FromBody] SubmitFeedbackRequest request)
    {
        var appointment = await _db.Appointments.FirstOrDefaultAsync(a => a.ConfirmationCode == code);
        if (appointment == null) return NotFound();

        appointment.ExperienceRating = request.Rating;
        appointment.ExperienceFeedback = request.Comment;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static AppointmentConfirmationDto MapToConfirmationDto(Appointment a, Doctor d) => new(
        a.Id,
        a.ConfirmationCode,
        $"{d.FullName}, {d.Credentials}",
        d.PrimarySpecialty,
        a.AppointmentDateTime,
        a.DeliveryMode,
        d.Clinic!.Name,
        $"{d.Clinic.StreetAddress}, {d.Clinic.City}, {d.Clinic.State} {d.Clinic.ZipCode}",
        a.EstimatedCopay,
        a.PatientEmail,
        a.Status
    );
}
