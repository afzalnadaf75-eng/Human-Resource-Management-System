using HRMS.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HRMS.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:8443")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Create HR and Employee roles/users
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    var dbContext = scope.ServiceProvider
    .GetRequiredService<AppDbContext>();

    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<IdentityUser>>();

    // Create roles
    string[] roles = { "HR", "Employee" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            var roleResult = await roleManager.CreateAsync(
                new IdentityRole(role));

            if (!roleResult.Succeeded)
            {
                Console.WriteLine($"Failed to create role: {role}");

                foreach (var error in roleResult.Errors)
                {
                    Console.WriteLine(
                        $"{error.Code}: {error.Description}");
                }
            }
        }
    }

    // =========================
    // Create HR user
    // =========================

    var hrEmail = "hr@hrms.com";
    var hrPassword = "HR@12345a";

    var hrUser = await userManager.FindByEmailAsync(hrEmail);

    if (hrUser == null)
    {
        hrUser = new IdentityUser
        {
            UserName = hrEmail,
            Email = hrEmail,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(
            hrUser,
            hrPassword);

        if (result.Succeeded)
        {
            Console.WriteLine("HR user created successfully.");

            var roleResult = await userManager.AddToRoleAsync(
                hrUser,
                "HR");

            if (!roleResult.Succeeded)
            {
                Console.WriteLine("Failed to assign HR role.");

                foreach (var error in roleResult.Errors)
                {
                    Console.WriteLine(
                        $"{error.Code}: {error.Description}");
                }
            }
        }
        else
        {
            Console.WriteLine("Failed to create HR user.");

            foreach (var error in result.Errors)
            {
                Console.WriteLine(
                    $"{error.Code}: {error.Description}");
            }
        }
    }
    else
    {
        Console.WriteLine("HR user already exists.");

        if (!await userManager.IsInRoleAsync(hrUser, "HR"))
        {
            await userManager.AddToRoleAsync(
                hrUser,
                "HR");
        }
    }

    // =========================
    // Create Employee user
    // =========================

    var employeeEmail = "afzal@example.com";
    var employeePassword = "Employee@12345";

    var employeeUser =
        await userManager.FindByEmailAsync(employeeEmail);

    if (employeeUser == null)
    {
        employeeUser = new IdentityUser
        {
            UserName = employeeEmail,
            Email = employeeEmail,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(
            employeeUser,
            employeePassword);

        if (result.Succeeded)
        {
            Console.WriteLine(
                "Employee user created successfully.");

            await userManager.AddToRoleAsync(
                employeeUser,
                "Employee");
        }
        else
        {
            Console.WriteLine(
                "Failed to create Employee user.");

            foreach (var error in result.Errors)
            {
                Console.WriteLine(
                    $"{error.Code}: {error.Description}");
            }
        }
    }
    else
    {
        Console.WriteLine("Employee user already exists.");

        if (!await userManager.IsInRoleAsync(
                employeeUser,
                "Employee"))
        {
            await userManager.AddToRoleAsync(
                employeeUser,
                "Employee");
        }
    }
    // =========================
    // Link Identity user to Employee record
    // =========================

    var employeeRecord = await dbContext.Employees
        .FirstOrDefaultAsync(e => e.EmployeeId == "EMP001");

    if (employeeRecord != null &&
        employeeUser != null &&
        employeeRecord.UserId != employeeUser.Id)
    {
        employeeRecord.UserId = employeeUser.Id;

        await dbContext.SaveChangesAsync();

        Console.WriteLine("Employee user linked to EMP001.");
    }
}
Console.WriteLine("ABOUT TO START WEB SERVER");

app.Run();

Console.WriteLine("WEB SERVER STOPPED");