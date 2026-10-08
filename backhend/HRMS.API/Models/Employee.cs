namespace HRMS.API.Models;

public class Employee
{
    public int Id { get; set; }

    public string EmployeeId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public DateTime JoiningDate { get; set; }

    public string ProfilePictureUrl { get; set; } = string.Empty;

    public string? UserId { get; set; }
}