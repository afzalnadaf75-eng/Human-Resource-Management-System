using HRMS.API.Data;
using HRMS.API.DTOs;
using HRMS.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HRMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees()
    {
        var employees = await _context.Employees
            .Select(e => new EmployeeDto
            {
                EmployeeId = e.EmployeeId,
                FullName = e.FullName,
                Email = e.Email,
                Phone = e.Phone,
                Address = e.Address,
                Department = e.Department,
                JobTitle = e.JobTitle,
                JoiningDate = e.JoiningDate,
                ProfilePictureUrl = e.ProfilePictureUrl
            })
            .ToListAsync();

        return Ok(employees);
    }

    // GET: api/employees/1
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
        {
            return NotFound();
        }

        var employeeDto = new EmployeeDto
        {
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Email = employee.Email,
            Phone = employee.Phone,
            Address = employee.Address,
            Department = employee.Department,
            JobTitle = employee.JobTitle,
            JoiningDate = employee.JoiningDate,
            ProfilePictureUrl = employee.ProfilePictureUrl
        };

        return Ok(employeeDto);
    }

    // POST: api/employees
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee(EmployeeDto dto)
    {
        var employee = new Employee
        {
            EmployeeId = dto.EmployeeId,
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            Department = dto.Department,
            JobTitle = dto.JobTitle,
            JoiningDate = dto.JoiningDate,
            ProfilePictureUrl = dto.ProfilePictureUrl
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        var result = new EmployeeDto
        {
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Email = employee.Email,
            Phone = employee.Phone,
            Address = employee.Address,
            Department = employee.Department,
            JobTitle = employee.JobTitle,
            JoiningDate = employee.JoiningDate,
            ProfilePictureUrl = employee.ProfilePictureUrl
        };

        return CreatedAtAction(
            nameof(GetEmployee),
            new { id = employee.Id },
            result);
    }

    // PUT: api/employees/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(
        int id,
        EmployeeDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
        {
            return NotFound();
        }

        employee.EmployeeId = dto.EmployeeId;
        employee.FullName = dto.FullName;
        employee.Email = dto.Email;
        employee.Phone = dto.Phone;
        employee.Address = dto.Address;
        employee.Department = dto.Department;
        employee.JobTitle = dto.JobTitle;
        employee.JoiningDate = dto.JoiningDate;
        employee.ProfilePictureUrl = dto.ProfilePictureUrl;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/employees/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
        {
            return NotFound();
        }

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}