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
public class PayrollController : ControllerBase
{
    private readonly AppDbContext _context;

    public PayrollController(AppDbContext context)
    {
        _context = context;
    }

    // HR - Create payroll
    [HttpPost]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> CreatePayroll([FromBody] Payroll? payroll)
    {
        if (payroll == null)
        {
            return BadRequest(new
            {
                message = "Payroll JSON body was not received."
            });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == payroll.EmployeeId);


        if (employee == null)
        {
            return NotFound(new
            {
                message = "Employee not found."
            });
        }

        payroll.NetSalary =
            payroll.BasicSalary +
            payroll.Allowances -
            payroll.Deductions;

        _context.Payrolls.Add(payroll);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Payroll created successfully.",
            payroll.Id,
            payroll.EmployeeId,
            payroll.BasicSalary,
            payroll.Allowances,
            payroll.Deductions,
            payroll.NetSalary,
            payroll.PayDate
        });
    }

    // HR - View all payroll records
    [HttpGet]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> GetAllPayroll()
    {
        var payroll = await _context.Payrolls
            .Include(p => p.Employee)
            .OrderByDescending(p => p.PayDate)
            .Select(p => new
            {
                id = p.Id,
                employeeId = p.Employee!.EmployeeId,
                employeeName = p.Employee.FullName,
                basicSalary = p.BasicSalary,
                allowances = p.Allowances,
                deductions = p.Deductions,
                netSalary = p.NetSalary,
                payDate = p.PayDate
            })
            .ToListAsync();

        return Ok(payroll);
    }

    // Employee - View own payroll
    [HttpGet("my")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyPayroll()
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

        var payroll = await _context.Payrolls
            .Where(p => p.EmployeeId == employee.Id)
            .OrderByDescending(p => p.PayDate)
            .Select(p => new
            {
                id = p.Id,
                basicSalary = p.BasicSalary,
                allowances = p.Allowances,
                deductions = p.Deductions,
                netSalary = p.NetSalary,
                payDate = p.PayDate
            })
            .ToListAsync();

        return Ok(payroll);
    }
}
