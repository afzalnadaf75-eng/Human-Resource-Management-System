using HRMS.API.Data;
using HRMS.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HRMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public AttendanceController(AppDbContext context)
    {
        _context = context;
    }
    [HttpPost("check-in")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CheckIn()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null)
            return NotFound(new
            {
                message = "Employee record not found."
            });

        var today = DateTime.Today;

        var existingAttendance = await _context.Attendances
            .FirstOrDefaultAsync(a =>
                a.EmployeeId == employee.Id &&
                a.Date == today);

        if (existingAttendance != null)
        {
            return BadRequest(new
            {
                message = "You have already checked in today."
            });
        }

        var attendance = new Attendance
        {
            EmployeeId = employee.Id,
            Date = today,
            CheckIn = DateTime.Now.TimeOfDay,
            Status = "Present"
        };

        _context.Attendances.Add(attendance);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Check-in successful.",
            checkIn = attendance.CheckIn
        });
    }
    [HttpPost("check-out")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CheckOut()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null)
            return NotFound(new
            {
                message = "Employee record not found."
            });

        var today = DateTime.Today;

        var attendance = await _context.Attendances
            .FirstOrDefaultAsync(a =>
                a.EmployeeId == employee.Id &&
                a.Date == today);

        if (attendance == null)
        {
            return BadRequest(new
            {
                message = "You have not checked in today."
            });
        }

        if (attendance.CheckOut != null)
        {
            return BadRequest(new
            {
                message = "You have already checked out today."
            });
        }

        attendance.CheckOut = DateTime.Now.TimeOfDay;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Check-out successful.",
            checkOut = attendance.CheckOut
        });
    }
    [HttpGet("my")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyAttendance()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Employee record not found."
            });
        }

        var attendance = await _context.Attendances
            .Where(a => a.EmployeeId == employee.Id)
            .OrderByDescending(a => a.Date)
            .Select(a => new
            {
                date = a.Date,
                checkIn = a.CheckIn,
                checkOut = a.CheckOut,
                status = a.Status
            })
            .ToListAsync();

        return Ok(attendance);
    }
    [HttpGet]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> GetAllAttendance()
    {
        var attendance = await _context.Attendances
            .Include(a => a.Employee)
            .OrderByDescending(a => a.Date)
            .Select(a => new
            {
                employeeId = a.Employee!.EmployeeId,
                employeeName = a.Employee.FullName,
                date = a.Date,
                checkIn = a.CheckIn,
                checkOut = a.CheckOut,
                status = a.Status
            })
            .ToListAsync();

        return Ok(attendance);
    }

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> GetEmployeeAttendance(int employeeId)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Employee not found."
            });
        }

        var attendance = await _context.Attendances
            .Where(a => a.EmployeeId == employeeId)
            .OrderByDescending(a => a.Date)
            .Select(a => new
            {
                employeeId = employee.EmployeeId,
                employeeName = employee.FullName,
                date = a.Date,
                checkIn = a.CheckIn,
                checkOut = a.CheckOut,
                status = a.Status
            })
            .ToListAsync();

        return Ok(attendance);
    }
}