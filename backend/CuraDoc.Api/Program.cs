using CuraDoc.Api.Domain.Entities;
using CuraDoc.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<CuraDocDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=curadoc.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendClient", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Ensure SQLite database is created and seeded with the mockup + backoffice data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CuraDocDbContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any())
    {
        db.Users.AddRange(
            new AppUser
            {
                Email = "admin@curadoc.com",
                FullName = "CuraDoc Super Admin",
                PasswordHash = "Admin123!",
                Role = UserRole.SuperAdmin
            },
            new AppUser
            {
                Email = "alex.morgan@email.com",
                FullName = "Alex Morgan",
                PasswordHash = "Patient123!",
                Role = UserRole.Patient
            }
        );
    }

    if (!db.Specialties.Any())
    {
        db.Specialties.AddRange(
            new Specialty { Name = "Cardiology", Description = "Heart and cardiovascular system specialists", IconCode = "heart", IsActive = true },
            new Specialty { Name = "Dermatology", Description = "Skin, hair, and nail conditions", IconCode = "sparkles", IsActive = true },
            new Specialty { Name = "Pediatrics", Description = "Medical care for infants, children, and adolescents", IconCode = "baby", IsActive = true },
            new Specialty { Name = "Orthopedics", Description = "Musculoskeletal system, bones, and joints", IconCode = "bone", IsActive = true },
            new Specialty { Name = "Psychiatry", Description = "Mental health and behavioral disorders", IconCode = "brain", IsActive = true }
        );
    }

    if (!db.InsuranceProviders.Any())
    {
        db.InsuranceProviders.AddRange(
            new InsuranceProvider { Name = "BlueCross BlueShield", PlanName = "BCBS PPO Tier 1", DefaultNetworkDiscount = 175.00m, IsActive = true },
            new InsuranceProvider { Name = "Aetna Health", PlanName = "Aetna Open Choice PPO", DefaultNetworkDiscount = 160.00m, IsActive = true },
            new InsuranceProvider { Name = "UnitedHealthcare", PlanName = "UHC Choice Plus", DefaultNetworkDiscount = 170.00m, IsActive = true },
            new InsuranceProvider { Name = "Cigna", PlanName = "Cigna OAP", DefaultNetworkDiscount = 155.00m, IsActive = true }
        );
    }

    if (!db.Clinics.Any())
    {
        var nwClinic = new Clinic
        {
            Name = "Northwestern Memorial Heart Center",
            StreetAddress = "676 N Saint Clair St, Suite 1400",
            City = "Chicago",
            State = "IL",
            ZipCode = "60611",
            PhoneNumber = "(312) 555-0198",
            BadgeLabel = "Level 1 Trauma Center",
            AverageRating = 4.9m,
            ReviewCount = 1240,
            AvailableSlotsToday = 18,
            HasParkingValidation = true,
            IsAdaCompliant = true,
            Latitude = 41.8947,
            Longitude = -87.6216
        };

        var rushClinic = new Clinic
        {
            Name = "Rush University Health Pavilion",
            StreetAddress = "1725 W Harrison St",
            City = "Chicago",
            State = "IL",
            ZipCode = "60612",
            PhoneNumber = "(312) 555-0144",
            BadgeLabel = "Magnet Recognized",
            AverageRating = 4.8m,
            ReviewCount = 980,
            AvailableSlotsToday = 12,
            HasParkingValidation = true,
            IsAdaCompliant = true,
            Latitude = 41.8744,
            Longitude = -87.6698
        };

        db.Clinics.AddRange(nwClinic, rushClinic);

        var drJenkins = new Doctor
        {
            FullName = "Dr. Sarah Jenkins",
            Credentials = "MD, FACC",
            PrimarySpecialty = "Cardiology",
            SubSpecialty = "Cardiologist & Electrophysiologist",
            Gender = "Female",
            IsBoardCertified = true,
            IsTopRated = true,
            AverageRating = 4.96m,
            VerifiedReviewCount = 428,
            ExequaturNumber = "EXQ-2014-8821",
            IdentityDocumentNumber = "001-1492831-9",
            LinkedInUrl = "https://linkedin.com/in/dr-sarah-jenkins-md",
            ConsultationRate = 220.00m,
            StandardCopay = 45.00m,
            SelfPayRate = 180.00m,
            NextAvailableSlot = DateTime.UtcNow.Date.AddDays(1).AddHours(10).AddMinutes(15),
            Clinic = nwClinic
        };

        var drVance = new Doctor
        {
            FullName = "Dr. Marcus Vance",
            Credentials = "MD",
            PrimarySpecialty = "Cardiology",
            SubSpecialty = "Interventional Cardiologist",
            Gender = "Male",
            IsBoardCertified = true,
            IsTopRated = false,
            AverageRating = 4.80m,
            VerifiedReviewCount = 218,
            ExequaturNumber = "EXQ-2017-4410",
            IdentityDocumentNumber = "001-8837120-4",
            LinkedInUrl = "https://linkedin.com/in/dr-marcus-vance-md",
            ConsultationRate = 210.00m,
            StandardCopay = 45.00m,
            SelfPayRate = 175.00m,
            NextAvailableSlot = DateTime.UtcNow.Date.AddDays(2).AddHours(14).AddMinutes(30),
            Clinic = rushClinic
        };

        db.Doctors.AddRange(drJenkins, drVance);

        db.DoctorApplications.Add(new DoctorApplication
        {
            FullName = "Dr. Elena Rostova",
            Email = "elena.rostova@cardioinstitute.org",
            PhoneNumber = "+1 (312) 555-0177",
            Credentials = "MD, PhD",
            PrimarySpecialty = "Cardiology",
            SubSpecialty = "Preventative Cardiology & Lipidology",
            Gender = "Female",
            ExequaturNumber = "EXQ-2019-9941",
            IdentityDocumentNumber = "001-2938471-2",
            LinkedInUrl = "https://linkedin.com/in/dr-elena-rostova",
            InstagramOrXUrl = "https://x.com/drelenarostova",
            WebsiteOrResearchGateUrl = "https://researchgate.net/profile/Elena-Rostova",
            PreferredClinic = nwClinic,
            ProposedConsultationRate = 230.00m,
            ProposedStandardCopay = 40.00m,
            Status = DoctorApplicationStatus.Pending
        });

        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("FrontendClient");
app.MapControllers();
app.Run();
