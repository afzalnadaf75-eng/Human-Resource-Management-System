namespace HRMS.API.Models;

public class Attendance
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public DateTime Date { get; set; }

    public TimeSpan? CheckIn { get; set; }

    public TimeSpan? CheckOut { get; set; }

    public string Status { get; set; } = "Present";

    public Employee? Employee { get; set; }
}