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

// Ensure SQLite database is created and seeded with the mockup data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CuraDocDbContext>();
    db.Database.EnsureCreated();
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
            ConsultationRate = 210.00m,
            StandardCopay = 45.00m,
            SelfPayRate = 175.00m,
            NextAvailableSlot = DateTime.UtcNow.Date.AddDays(2).AddHours(14).AddMinutes(30),
            Clinic = rushClinic
        };

        db.Doctors.AddRange(drJenkins, drVance);
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
