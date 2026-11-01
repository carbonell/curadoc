using CuraDoc.Api.Application.DTOs;
using CuraDoc.Api.Domain.Entities;
using CuraDoc.Api.Infrastructure.Auth;
using CuraDoc.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuraDoc.Api.Controllers;

[ApiController]
[Route("api/backoffice")]
[RequireSuperAdmin]
public class BackofficeController : ControllerBase
{
    private readonly CuraDocDbContext _db;

    public BackofficeController(CuraDocDbContext db) => _db = db;

    // =========================================================================
    // 1. Doctor Sign-Up Validation Module (List, Inspect, Approve / Reject)
    // =========================================================================

    [HttpGet("doctor-applications")]
    public async Task<ActionResult<IEnumerable<DoctorApplicationDto>>> GetDoctorApplications([FromQuery] DoctorApplicationStatus? status)
    {
        var query = _db.DoctorApplications.Include(a => a.PreferredClinic).AsNoTracking().AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        var list = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new DoctorApplicationDto(
                a.Id, a.FullName, a.Email, a.PhoneNumber, a.Credentials, a.PrimarySpecialty,
                a.SubSpecialty, a.Gender, a.ExequaturNumber, a.IdentityDocumentNumber,
                a.LinkedInUrl, a.InstagramOrXUrl, a.WebsiteOrResearchGateUrl,
                a.PreferredClinicId, a.PreferredClinic != null ? a.PreferredClinic.Name : "N/A",
                a.ProposedConsultationRate, a.ProposedStandardCopay,
                a.Status, a.ReviewerNotes, a.CreatedAt, a.ReviewedAt, a.ReviewedByEmail, a.ApprovedDoctorId
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost("doctor-applications/{id:guid}/review")]
    public async Task<ActionResult<DoctorApplicationDto>> ReviewDoctorApplication(Guid id, [FromBody] ReviewDoctorApplicationRequest request)
    {
        var app = await _db.DoctorApplications.Include(a => a.PreferredClinic).FirstOrDefaultAsync(a => a.Id == id);
        if (app == null) return NotFound(new { message = "Doctor application not found." });

        var reviewerEmail = HttpContext.Items["UserEmail"] as string ?? "superadmin@curadoc.com";
        app.ReviewedAt = DateTime.UtcNow;
        app.ReviewedByEmail = reviewerEmail;
        app.ReviewerNotes = request.ReviewerNotes;

        if (request.Approve)
        {
            app.Status = DoctorApplicationStatus.Approved;

            // If not already provisioned as a Doctor, create the verified Doctor record
            if (!app.ApprovedDoctorId.HasValue)
            {
                var doctor = new Doctor
                {
                    FullName = app.FullName,
                    Credentials = app.Credentials,
                    PrimarySpecialty = app.PrimarySpecialty,
                    SubSpecialty = app.SubSpecialty,
                    Gender = app.Gender,
                    IsBoardCertified = true,
                    IsTopRated = false,
                    AverageRating = 5.0m,
                    VerifiedReviewCount = 1,
                    ExequaturNumber = app.ExequaturNumber,
                    IdentityDocumentNumber = app.IdentityDocumentNumber,
                    LinkedInUrl = app.LinkedInUrl,
                    InstagramOrXUrl = app.InstagramOrXUrl,
                    WebsiteOrResearchGateUrl = app.WebsiteOrResearchGateUrl,
                    ConsultationRate = app.ProposedConsultationRate,
                    StandardCopay = app.ProposedStandardCopay,
                    SelfPayRate = Math.Max(50m, app.ProposedConsultationRate - 40m),
                    NextAvailableSlot = DateTime.UtcNow.Date.AddDays(1).AddHours(9),
                    ClinicId = app.PreferredClinicId
                };

                _db.Doctors.Add(doctor);
                app.ApprovedDoctorId = doctor.Id;
            }
        }
        else
        {
            app.Status = DoctorApplicationStatus.Rejected;
        }

        await _db.SaveChangesAsync();

        return Ok(new DoctorApplicationDto(
            app.Id, app.FullName, app.Email, app.PhoneNumber, app.Credentials, app.PrimarySpecialty,
            app.SubSpecialty, app.Gender, app.ExequaturNumber, app.IdentityDocumentNumber,
            app.LinkedInUrl, app.InstagramOrXUrl, app.WebsiteOrResearchGateUrl,
            app.PreferredClinicId, app.PreferredClinic?.Name ?? "N/A",
            app.ProposedConsultationRate, app.ProposedStandardCopay,
            app.Status, app.ReviewerNotes, app.CreatedAt, app.ReviewedAt, app.ReviewedByEmail, app.ApprovedDoctorId
        ));
    }

    // =========================================================================
    // 2. Specialties CRUD
    // =========================================================================

    [HttpGet("specialties")]
    public async Task<ActionResult<IEnumerable<SpecialtyDto>>> GetSpecialties()
    {
        var items = await _db.Specialties
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new SpecialtyDto(s.Id, s.Name, s.Description, s.IconCode, s.IsActive))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("specialties")]
    public async Task<ActionResult<SpecialtyDto>> CreateSpecialty([FromBody] UpsertSpecialtyRequest request)
    {
        var s = new Specialty
        {
            Name = request.Name,
            Description = request.Description,
            IconCode = request.IconCode,
            IsActive = request.IsActive
        };
        _db.Specialties.Add(s);
        await _db.SaveChangesAsync();
        return Ok(new SpecialtyDto(s.Id, s.Name, s.Description, s.IconCode, s.IsActive));
    }

    [HttpPut("specialties/{id:guid}")]
    public async Task<ActionResult<SpecialtyDto>> UpdateSpecialty(Guid id, [FromBody] UpsertSpecialtyRequest request)
    {
        var s = await _db.Specialties.FindAsync(id);
        if (s == null) return NotFound();

        s.Name = request.Name;
        s.Description = request.Description;
        s.IconCode = request.IconCode;
        s.IsActive = request.IsActive;
        await _db.SaveChangesAsync();
        return Ok(new SpecialtyDto(s.Id, s.Name, s.Description, s.IconCode, s.IsActive));
    }

    [HttpDelete("specialties/{id:guid}")]
    public async Task<IActionResult> DeleteSpecialty(Guid id)
    {
        var s = await _db.Specialties.FindAsync(id);
        if (s == null) return NotFound();

        _db.Specialties.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // =========================================================================
    // 3. Clinics CRUD
    // =========================================================================

    [HttpGet("clinics")]
    public async Task<ActionResult<IEnumerable<ClinicSummaryDto>>> GetClinics()
    {
        var items = await _db.Clinics
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new ClinicSummaryDto(
                c.Id, c.Name, c.StreetAddress, c.City, c.State, c.ZipCode,
                c.PhoneNumber, c.BadgeLabel, c.AverageRating, c.ReviewCount,
                c.AvailableSlotsToday, c.HasParkingValidation, c.IsAdaCompliant,
                c.Latitude, c.Longitude
            ))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("clinics")]
    public async Task<ActionResult<ClinicSummaryDto>> CreateClinic([FromBody] UpsertClinicRequest request)
    {
        var c = new Clinic
        {
            Name = request.Name,
            StreetAddress = request.StreetAddress,
            City = request.City,
            State = request.State,
            ZipCode = request.ZipCode,
            PhoneNumber = request.PhoneNumber,
            BadgeLabel = request.BadgeLabel,
            AverageRating = request.AverageRating,
            ReviewCount = 100,
            AvailableSlotsToday = request.AvailableSlotsToday,
            HasParkingValidation = request.HasParkingValidation,
            IsAdaCompliant = request.IsAdaCompliant,
            Latitude = 41.88,
            Longitude = -87.63
        };
        _db.Clinics.Add(c);
        await _db.SaveChangesAsync();
        return Ok(new ClinicSummaryDto(
            c.Id, c.Name, c.StreetAddress, c.City, c.State, c.ZipCode,
            c.PhoneNumber, c.BadgeLabel, c.AverageRating, c.ReviewCount,
            c.AvailableSlotsToday, c.HasParkingValidation, c.IsAdaCompliant,
            c.Latitude, c.Longitude
        ));
    }

    [HttpPut("clinics/{id:guid}")]
    public async Task<ActionResult<ClinicSummaryDto>> UpdateClinic(Guid id, [FromBody] UpsertClinicRequest request)
    {
        var c = await _db.Clinics.FindAsync(id);
        if (c == null) return NotFound();

        c.Name = request.Name;
        c.StreetAddress = request.StreetAddress;
        c.City = request.City;
        c.State = request.State;
        c.ZipCode = request.ZipCode;
        c.PhoneNumber = request.PhoneNumber;
        c.BadgeLabel = request.BadgeLabel;
        c.AverageRating = request.AverageRating;
        c.AvailableSlotsToday = request.AvailableSlotsToday;
        c.HasParkingValidation = request.HasParkingValidation;
        c.IsAdaCompliant = request.IsAdaCompliant;

        await _db.SaveChangesAsync();
        return Ok(new ClinicSummaryDto(
            c.Id, c.Name, c.StreetAddress, c.City, c.State, c.ZipCode,
            c.PhoneNumber, c.BadgeLabel, c.AverageRating, c.ReviewCount,
            c.AvailableSlotsToday, c.HasParkingValidation, c.IsAdaCompliant,
            c.Latitude, c.Longitude
        ));
    }

    [HttpDelete("clinics/{id:guid}")]
    public async Task<IActionResult> DeleteClinic(Guid id)
    {
        var hasDoctors = await _db.Doctors.AnyAsync(d => d.ClinicId == id);
        if (hasDoctors)
            return BadRequest(new { message = "Cannot delete clinic while doctors are assigned to it." });

        var c = await _db.Clinics.FindAsync(id);
        if (c == null) return NotFound();

        _db.Clinics.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // =========================================================================
    // 4. Insurance Providers CRUD
    // =========================================================================

    [HttpGet("insurances")]
    public async Task<ActionResult<IEnumerable<InsuranceProviderDto>>> GetInsurances()
    {
        var items = await _db.InsuranceProviders
            .AsNoTracking()
            .OrderBy(i => i.Name)
            .Select(i => new InsuranceProviderDto(i.Id, i.Name, i.PlanName, i.DefaultNetworkDiscount, i.IsActive))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("insurances")]
    public async Task<ActionResult<InsuranceProviderDto>> CreateInsurance([FromBody] UpsertInsuranceProviderRequest request)
    {
        var i = new InsuranceProvider
        {
            Name = request.Name,
            PlanName = request.PlanName,
            DefaultNetworkDiscount = request.DefaultNetworkDiscount,
            IsActive = request.IsActive
        };
        _db.InsuranceProviders.Add(i);
        await _db.SaveChangesAsync();
        return Ok(new InsuranceProviderDto(i.Id, i.Name, i.PlanName, i.DefaultNetworkDiscount, i.IsActive));
    }

    [HttpPut("insurances/{id:guid}")]
    public async Task<ActionResult<InsuranceProviderDto>> UpdateInsurance(Guid id, [FromBody] UpsertInsuranceProviderRequest request)
    {
        var i = await _db.InsuranceProviders.FindAsync(id);
        if (i == null) return NotFound();

        i.Name = request.Name;
        i.PlanName = request.PlanName;
        i.DefaultNetworkDiscount = request.DefaultNetworkDiscount;
        i.IsActive = request.IsActive;
        await _db.SaveChangesAsync();
        return Ok(new InsuranceProviderDto(i.Id, i.Name, i.PlanName, i.DefaultNetworkDiscount, i.IsActive));
    }

    [HttpDelete("insurances/{id:guid}")]
    public async Task<IActionResult> DeleteInsurance(Guid id)
    {
        var i = await _db.InsuranceProviders.FindAsync(id);
        if (i == null) return NotFound();

        _db.InsuranceProviders.Remove(i);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // =========================================================================
    // 5. Verified Doctors CRUD
    // =========================================================================

    [HttpGet("doctors")]
    public async Task<ActionResult<IEnumerable<DoctorCardDto>>> GetDoctors()
    {
        var list = await _db.Doctors.Include(d => d.Clinic).AsNoTracking().OrderBy(d => d.FullName).Select(d => new DoctorCardDto(
            d.Id, d.FullName, d.Credentials, d.PrimarySpecialty, d.SubSpecialty,
            d.IsBoardCertified, d.IsTopRated, d.AverageRating, d.VerifiedReviewCount,
            d.ConsultationRate, d.StandardCopay, d.SelfPayRate, d.NextAvailableSlot,
            d.ExequaturNumber, d.IdentityDocumentNumber, d.LinkedInUrl, d.InstagramOrXUrl, d.WebsiteOrResearchGateUrl,
            new ClinicSummaryDto(
                d.Clinic!.Id, d.Clinic.Name, d.Clinic.StreetAddress, d.Clinic.City, d.Clinic.State,
                d.Clinic.ZipCode, d.Clinic.PhoneNumber, d.Clinic.BadgeLabel, d.Clinic.AverageRating,
                d.Clinic.ReviewCount, d.Clinic.AvailableSlotsToday, d.Clinic.HasParkingValidation,
                d.Clinic.IsAdaCompliant, d.Clinic.Latitude, d.Clinic.Longitude
            )
        )).ToListAsync();
        return Ok(list);
    }

    [HttpDelete("doctors/{id:guid}")]
    public async Task<IActionResult> DeleteDoctor(Guid id)
    {
        var d = await _db.Doctors.FindAsync(id);
        if (d == null) return NotFound();

        _db.Doctors.Remove(d);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
