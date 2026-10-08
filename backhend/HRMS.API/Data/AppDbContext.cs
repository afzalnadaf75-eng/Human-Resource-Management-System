using HRMS.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HRMS.API.Data;

public class AppDbContext : IdentityDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }

    public DbSet<Attendance> Attendances { get; set; }

    public DbSet<LeaveRequest> LeaveRequests { get; set; }

    public DbSet<Payroll> Payrolls { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Payroll>()
            .Property(p => p.BasicSalary)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payroll>()
            .Property(p => p.Allowances)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payroll>()
            .Property(p => p.Deductions)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payroll>()
            .Property(p => p.NetSalary)
            .HasPrecision(18, 2);
    }
}
