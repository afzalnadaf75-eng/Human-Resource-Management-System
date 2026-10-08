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
public class LeaveRequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaveRequestsController(AppDbContext context)
    {
        _context = context;
    }

    // Employee - Apply for leave
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> ApplyForLeave(LeaveRequest request)
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

        if (request.StartDate.Date > request.EndDate.Date)
        {
            return BadRequest(new
            {
                message = "Start date cannot be after end date."
            });
        }

        var overlappingLeave = await _context.LeaveRequests
            .AnyAsync(l =>
                l.EmployeeId == employee.Id &&
                l.Status != "Rejected" &&
                request.StartDate.Date <= l.EndDate.Date &&
                request.EndDate.Date >= l.StartDate.Date);

        if (overlappingLeave)
        {
            return BadRequest(new
            {
                message = "You already have a leave request for these dates."
            });
        }

        var leaveRequest = new LeaveRequest
        {
            EmployeeId = employee.Id,
            StartDate = request.StartDate.Date,
            EndDate = request.EndDate.Date,
            LeaveType = request.LeaveType,
            Reason = request.Reason,
            Status = "Pending",
            AppliedDate = DateTime.Now
        };

        _context.LeaveRequests.Add(leaveRequest);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Leave request submitted successfully.",
            leaveRequest.Id,
            leaveRequest.StartDate,
            leaveRequest.EndDate,
            leaveRequest.LeaveType,
            leaveRequest.Status
        });
    }

    // Employee - View own leave requests
    [HttpGet("my")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyLeaveRequests()
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

        var requests = await _context.LeaveRequests
            .Where(l => l.EmployeeId == employee.Id)
            .OrderByDescending(l => l.AppliedDate)
            .Select(l => new
            {
                id = l.Id,
                startDate = l.StartDate,
                endDate = l.EndDate,
                leaveType = l.LeaveType,
                reason = l.Reason,
                status = l.Status,
                appliedDate = l.AppliedDate
            })
            .ToListAsync();

        return Ok(requests);
    }
    // HR - View all leave requests
    [HttpGet]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> GetAllLeaveRequests()
    {
        var requests = await _context.LeaveRequests
            .Include(l => l.Employee)
            .OrderByDescending(l => l.AppliedDate)
            .Select(l => new
            {
                id = l.Id,
                employeeId = l.Employee!.EmployeeId,
                employeeName = l.Employee.FullName,
                startDate = l.StartDate,
                endDate = l.EndDate,
                leaveType = l.LeaveType,
                reason = l.Reason,
                status = l.Status,
                appliedDate = l.AppliedDate
            })
            .ToListAsync();

        return Ok(requests);
    }
    // HR - Approve leave request
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> ApproveLeave(int id)
    {
        var leaveRequest = await _context.LeaveRequests
            .FirstOrDefaultAsync(l => l.Id == id);

        if (leaveRequest == null)
        {
            return NotFound(new
            {
                message = "Leave request not found."
            });
        }

        if (leaveRequest.Status != "Pending")
        {
            return BadRequest(new
            {
                message = "Only pending leave requests can be approved."
            });
        }

        leaveRequest.Status = "Approved";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Leave request approved successfully.",
            leaveRequest.Id,
            leaveRequest.Status
        });
    }

    // HR - Reject leave request
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> RejectLeave(int id)
    {
        var leaveRequest = await _context.LeaveRequests
            .FirstOrDefaultAsync(l => l.Id == id);

        if (leaveRequest == null)
        {
            return NotFound(new
            {
                message = "Leave request not found."
            });
        }

        if (leaveRequest.Status != "Pending")
        {
            return BadRequest(new
            {
                message = "Only pending leave requests can be rejected."
            });
        }

        leaveRequest.Status = "Rejected";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Leave request rejected successfully.",
            leaveRequest.Id,
            leaveRequest.Status
        });
    }
}
