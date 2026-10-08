namespace HRMS.API.Models;

public class Payroll
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public decimal BasicSalary { get; set; }

    public decimal Allowances { get; set; }

    public decimal Deductions { get; set; }

    public decimal NetSalary { get; set; }

    public DateTime PayDate { get; set; }

    public Employee? Employee { get; set; }
}