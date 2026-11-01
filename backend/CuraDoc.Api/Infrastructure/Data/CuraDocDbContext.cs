using CuraDoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CuraDoc.Api.Infrastructure.Data;

public class CuraDocDbContext : DbContext
{
    public CuraDocDbContext(DbContextOptions<CuraDocDbContext> options) : base(options) { }

    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<InsuranceProvider> InsuranceProviders => Set<InsuranceProvider>();
    public DbSet<DoctorScheduleSlot> ScheduleSlots => Set<DoctorScheduleSlot>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Clinic>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(200);
            entity.Property(c => c.AverageRating).HasPrecision(3, 2);
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.FullName).IsRequired().HasMaxLength(150);
            entity.Property(d => d.PrimarySpecialty).IsRequired().HasMaxLength(100);
            entity.Property(d => d.AverageRating).HasPrecision(3, 2);
            entity.Property(d => d.ConsultationRate).HasPrecision(10, 2);
            entity.Property(d => d.StandardCopay).HasPrecision(10, 2);
            entity.Property(d => d.SelfPayRate).HasPrecision(10, 2);

            entity.HasOne(d => d.Clinic)
                  .WithMany(c => c.Doctors)
                  .HasForeignKey(d => d.ClinicId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.HasIndex(a => a.ConfirmationCode).IsUnique();
            entity.Property(a => a.ConfirmationCode).IsRequired().HasMaxLength(32);
            entity.Property(a => a.PatientFullName).IsRequired().HasMaxLength(150);
            entity.Property(a => a.PatientEmail).IsRequired().HasMaxLength(150);
            entity.Property(a => a.EstimatedCopay).HasPrecision(10, 2);

            entity.HasOne(a => a.Doctor)
                  .WithMany(d => d.Appointments)
                  .HasForeignKey(a => a.DoctorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
