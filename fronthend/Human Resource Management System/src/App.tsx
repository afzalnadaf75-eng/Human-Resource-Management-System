import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { login as apiLogin } from "./api/auth";
import { getMyPayroll } from "./api/payroll";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

type Role = "employee" | "hr";
type Page =
  | "dashboard"
  | "profile"
  | "attendance"
  | "leave"
  | "payroll"
  | "employees";
type Tone = "blue" | "teal" | "green" | "amber" | "red" | "violet" | "navy";

const employees = [
  {
    id: "EMP001",
    name: "Afzal Nadaf",
    initials: "AN",
    email: "afzal.nadaf@northstar.co",
    dept: "Engineering",
    title: "Software Engineer",
    joined: "12 Mar 2022",
    status: "Active",
    tone: "blue",
  },
  {
    id: "EMP014",
    name: "Meera Iyer",
    initials: "MI",
    email: "meera.iyer@northstar.co",
    dept: "Design",
    title: "Product Designer",
    joined: "08 Aug 2023",
    status: "Active",
    tone: "violet",
  },
  {
    id: "EMP021",
    name: "Rohan Mehta",
    initials: "RM",
    email: "rohan.mehta@northstar.co",
    dept: "Finance",
    title: "Finance Analyst",
    joined: "16 Jan 2024",
    status: "On leave",
    tone: "amber",
  },
  {
    id: "EMP007",
    name: "Sana Khan",
    initials: "SK",
    email: "sana.khan@northstar.co",
    dept: "People",
    title: "HR Executive",
    joined: "03 Nov 2022",
    status: "Active",
    tone: "teal",
  },
  {
    id: "EMP025",
    name: "Nikhil Rao",
    initials: "NR",
    email: "nikhil.rao@northstar.co",
    dept: "Marketing",
    title: "Growth Manager",
    joined: "19 Feb 2024",
    status: "Active",
    tone: "green",
  },
  {
    id: "EMP011",
    name: "Priya Desai",
    initials: "PD",
    email: "priya.desai@northstar.co",
    dept: "Sales",
    title: "Account Executive",
    joined: "27 Jun 2023",
    status: "Inactive",
    tone: "red",
  },
] as const;

const leaveSeed = [
  {
    id: 1,
    employee: "Rohan Mehta",
    initials: "RM",
    type: "Sick Leave",
    start: "24 May",
    end: "25 May",
    days: 2,
    reason: "Seasonal flu and doctor-advised rest",
    status: "Pending",
  },
  {
    id: 2,
    employee: "Meera Iyer",
    initials: "MI",
    type: "Casual Leave",
    start: "28 May",
    end: "28 May",
    days: 1,
    reason: "Personal appointment",
    status: "Pending",
  },
  {
    id: 3,
    employee: "Nikhil Rao",
    initials: "NR",
    type: "Paid Leave",
    start: "03 Jun",
    end: "07 Jun",
    days: 5,
    reason: "Family vacation",
    status: "Approved",
  },
  {
    id: 4,
    employee: "Priya Desai",
    initials: "PD",
    type: "Casual Leave",
    start: "20 May",
    end: "21 May",
    days: 2,
    reason: "Personal commitment",
    status: "Rejected",
  },
];

const attendanceRows = [
  ["Afzal Nadaf", "Engineering", "09:02 AM", "06:11 PM", "8h 39m", "Present"],
  ["Meera Iyer", "Design", "09:18 AM", "06:04 PM", "8h 16m", "Late"],
  ["Sana Khan", "People", "08:55 AM", "05:48 PM", "8h 23m", "Present"],
  ["Nikhil Rao", "Marketing", "09:07 AM", "06:20 PM", "8h 43m", "Present"],
  ["Rohan Mehta", "Finance", "—", "—", "—", "On leave"],
  ["Priya Desai", "Sales", "—", "—", "—", "Absent"],
];

const payrollRows = [
  ["Afzal Nadaf", "₹72,000", "₹9,500", "₹5,240", "₹76,260", "31 May 2024"],
  ["Meera Iyer", "₹68,000", "₹8,200", "₹4,890", "₹71,310", "31 May 2024"],
  ["Rohan Mehta", "₹64,000", "₹7,800", "₹4,580", "₹67,220", "31 May 2024"],
  ["Sana Khan", "₹58,000", "₹7,000", "₹4,120", "₹60,880", "31 May 2024"],
  ["Nikhil Rao", "₹76,000", "₹11,200", "₹5,720", "₹81,480", "31 May 2024"],
];

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button button-${variant} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function Avatar({
  initials,
  tone = "blue",
  size = "md",
}: {
  initials: string;
  tone?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className={`avatar avatar-${tone} avatar-${size}`}>{initials}</span>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const inferred =
    tone ||
    (children === "Active" || children === "Present" || children === "Approved"
      ? "green"
      : children === "Pending" || children === "Late" || children === "On leave"
        ? "amber"
        : "red");
  return (
    <span className={`badge badge-${inferred}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  detail,
  icon,
  tone,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: Tone;
  trend?: "up" | "down";
}) {
  return (
    <div className={`stat stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        {trend && (
          <span className={`trend ${trend}`}>
            {trend === "up" ? <ArrowUpRight /> : <ArrowDownRight />} 4.2%
          </span>
        )}
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-detail">{detail}</p>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function MiniBars({
  values,
  labels,
  color = "blue",
}: {
  values: number[];
  labels: string[];
  color?: string;
}) {
  const max = Math.max(...values);
  return (
    <div className="mini-bars">
      {values.map((value, index) => (
        <div className="bar-column" key={`${labels[index]}-${index}`}>
          <div className="bar-track">
            <div
              className={`bar-fill bar-${color}`}
              style={{ height: `${(value / max) * 100}%` }}
            >
              <span>{value}%</span>
            </div>
          </div>
          <small>{labels[index]}</small>
        </div>
      ))}
    </div>
  );
}

function Donut({
  value,
  tone,
  label,
}: {
  value: number;
  tone: string;
  label: string;
}) {
  return (
    <div className="donut-wrap">
      <div
        className={`donut donut-${tone}`}
        style={{ "--value": `${value * 3.6}deg` } as React.CSSProperties}
      >
        <span>{value}%</span>
      </div>
      <div>
        <strong>{label}</strong>
        <small>of total workforce</small>
      </div>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("afzal@example.com");
  const [password, setPassword] = useState("Employee@12345");
  const [loginMode, setLoginMode] = useState<Role | null>(null);
  const chooseLogin = (nextRole: Role) => {
    setLoginMode(nextRole);

    if (nextRole === "hr") {
      setEmail("hr@hrms.com");
      setPassword("HR@12345a");
    } else {
      setEmail("afzal@example.com");
      setPassword("Employee@12345");
    }
  };
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    try {
      const result = await apiLogin(email, password);

      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.role);
      localStorage.setItem("email", result.email);

      const role: Role = result.role.toLowerCase() === "hr" ? "hr" : "employee";

      onLogin(role);
    } catch (error) {
      console.error(error);
      setError("Invalid email or password.");
    }
  };
  return (
    <main className="login-shell">
      <section className="login-brand">
        <div className="brand">
          <span className="brand-mark">
            <Users />
          </span>
          <span>HRMS</span>
        </div>
        <div className="login-copy">
          <p className="eyebrow light">
            People operations, thoughtfully connected
          </p>
          <h1>Work feels better when everything just works.</h1>
          <p>
            One calm place for your people, attendance, leave, and payroll—from
            first day to every payday.
          </p>
        </div>
        <div className="visual-cluster" aria-hidden="true">
          <div className="visual-main">
            <span>
              <TrendingUp />
            </span>
            <small>This month</small>
            <strong>96.4%</strong>
            <p>Team attendance</p>
            <div className="visual-line">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="visual-person">
            <Avatar initials="AN" tone="teal" size="lg" />
            <span>
              <strong>Afzal Nadaf</strong>
              <small>Checked in · 9:02 AM</small>
            </span>
            <CheckCircle2 />
          </div>
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
        </div>
        <p className="login-foot">Trusted tools for growing teams</p>
      </section>
      <section className="login-form-area">
        <form className="login-form" onSubmit={submit}>
          <div className="mobile-brand brand">
            <span className="brand-mark">
              <Users />
            </span>
            <span>HRMS</span>
          </div>
          <p className="eyebrow">
            {loginMode
              ? `${loginMode === "hr" ? "HR" : "Employee"} portal`
              : "Welcome back"}
          </p>
          <h2>
            {loginMode
              ? `${loginMode === "hr" ? "HR" : "Employee"} login`
              : "Sign in to your workspace"}
          </h2>
          <p className="form-intro">
            {loginMode
              ? `Enter your ${loginMode === "hr" ? "HR administrator" : "employee"} credentials to continue.`
              : "Enter your work email and password to continue."}
          </p>
          <label>
            Email address
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label>
            Password
            <div className="password-wrap">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
              <Eye />
            </div>
          </label>

          {error && (
            <p style={{ color: "#dc2626", marginTop: "8px" }}>{error}</p>
          )}

          <div className="form-options">
            <label className="checkbox">
              <input type="checkbox" defaultChecked />
              <span />
              Remember me
            </label>
            <button type="button" className="text-button">
              Forgot password?
            </button>
          </div>
          <Button type="submit" className="login-button" icon={<LogIn />}>
            {loginMode
              ? `Continue as ${loginMode === "hr" ? "HR" : "employee"}`
              : "Sign in securely"}
          </Button>
          <div className="demo-divider">
            <span>{loginMode ? "Switch portal" : "Choose login portal"}</span>
          </div>
          {loginMode ? (
            <Button
              variant="secondary"
              className="login-button"
              onClick={() => setLoginMode(null)}
            >
              Back to login options
            </Button>
          ) : (
            <div className="demo-buttons">
              <Button
                variant="secondary"
                onClick={() => chooseLogin("employee")}
              >
                Employee login
              </Button>
              <Button variant="secondary" onClick={() => chooseLogin("hr")}>
                HR login
              </Button>
            </div>
          )}
          <p className="security-note">
            <ShieldCheck />
            Your account is protected by enterprise-grade security.
          </p>
        </form>
      </section>
    </main>
  );
}

function Sidebar({
  role,
  page,
  setPage,
  mobileOpen,
  setMobileOpen,
}: {
  role: Role;
  page: Page;
  setPage: (p: Page) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const employeeNav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["profile", "My Profile", UserRound],
    ["attendance", "Attendance", Clock3],
    ["leave", "Leave", CalendarDays],
    ["payroll", "Payroll", WalletCards],
  ] as const;
  const hrNav = [
    ["dashboard", "HR Dashboard", LayoutDashboard],
    ["employees", "Employees", Users],
    ["attendance", "Attendance", Clock3],
    ["leave", "Leave Management", CalendarDays],
    ["payroll", "Payroll", WalletCards],
  ] as const;
  const nav = role === "hr" ? hrNav : employeeNav;
  return (
    <>
      {mobileOpen && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Users />
          </span>
          <span>HRMS</span>
        </div>
        <div className="workspace">
          <span className="workspace-icon">
            <Building2 />
          </span>
          <span>
            <small>Workspace</small>
            <strong>Northstar Labs</strong>
          </span>
          <ChevronDown />
        </div>
        <nav>
          <p className="nav-label">Workspace</p>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setMobileOpen(false);
              }}
            >
              <Icon />
              <span>{label}</span>
              {page === id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="support-card">
            <span>
              <Sparkles />
            </span>
            <strong>Need a hand?</strong>
            <p>Visit the HR help center</p>
            <button>
              Open support <ChevronRight />
            </button>
          </div>
          <p>HRMS v2.4 · Secure workspace</p>
        </div>
      </aside>
    </>
  );
}

function Topbar({
  role,
  onMenu,
  onLogout,
}: {
  role: Role;
  onMenu: () => void;
  onLogout: () => void;
}) {
  const [notifications, setNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenu}>
        <Menu />
      </button>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <div className="popover-wrap">
          <button
            className="icon-button"
            onClick={() => setNotifications(!notifications)}
          >
            <Bell />
            <span className="notification-dot" />
          </button>
          {notifications && (
            <div className="popover notification-popover">
              <strong>Notifications</strong>
              <div>
                <span className="notice-icon green">
                  <Check />
                </span>
                <p>
                  <b>Leave approved</b>
                  <small>Your leave for 3 June was approved.</small>
                </p>
              </div>
              <div>
                <span className="notice-icon violet">
                  <Banknote />
                </span>
                <p>
                  <b>Payslip ready</b>
                  <small>May 2024 payslip is now available.</small>
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="divider" />
        <div className="popover-wrap">
          <button
            className="profile-button"
            onClick={() => setProfile(!profile)}
          >
            <Avatar
              initials={role === "hr" ? "SK" : "AN"}
              tone={role === "hr" ? "teal" : "blue"}
            />
            <span>
              <strong>{role === "hr" ? "Sana Khan" : "Afzal Nadaf"}</strong>
              <small>
                {role === "hr" ? "HR Administrator" : "Software Engineer"}
              </small>
            </span>
            <ChevronDown />
          </button>
          {profile && (
            <div className="popover profile-popover">
              <button onClick={onLogout}>
                <LogOut />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function EmployeeDashboard({
  onCheck,
  checkedIn,
  openLeave,
}: {
  onCheck: () => void;
  checkedIn: boolean;
  openLeave: () => void;
}) {
  return (
    <>
      <section className="welcome-banner">
        <div>
          <p>Monday, 27 May 2024</p>
          <h1>
            Good morning, Afzal <span>👋</span>
          </h1>
          <p>
            {checkedIn
              ? "You're checked in. Here's what your workday looks like."
              : "Ready for a productive day? Remember to check in."}
          </p>
        </div>
        <div className="check-card">
          <span className={`pulse ${checkedIn ? "online" : ""}`} />
          <div>
            <small>Today's status</small>
            <strong>
              {checkedIn ? "Checked in at 9:02 AM" : "Not checked in"}
            </strong>
          </div>
          <Button
            variant={checkedIn ? "secondary" : "primary"}
            onClick={onCheck}
            icon={<Clock3 />}
          >
            {checkedIn ? "Check out" : "Check in"}
          </Button>
        </div>
      </section>
      <div className="stats-grid employee-stats">
        <Stat
          label="Attendance"
          value="96%"
          detail="22 of 23 working days"
          icon={<Activity />}
          tone="teal"
          trend="up"
        />
        <Stat
          label="Leave balance"
          value="14 days"
          detail="Across all leave types"
          icon={<CalendarDays />}
          tone="blue"
        />
        <Stat
          label="Pending requests"
          value="2"
          detail="Awaiting HR response"
          icon={<Clock3 />}
          tone="amber"
        />
        <Stat
          label="Latest salary"
          value="₹76,260"
          detail="Paid on 30 Apr 2024"
          icon={<WalletCards />}
          tone="violet"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel attendance-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Attendance</p>
              <h2>Your week at a glance</h2>
            </div>
            <button className="text-button">
              View details <ChevronRight />
            </button>
          </div>
          <div className="attendance-summary">
            <div>
              <small>Today</small>
              <Badge tone="green">Present</Badge>
            </div>
            <div>
              <small>Check in</small>
              <strong>09:02 AM</strong>
            </div>
            <div>
              <small>Check out</small>
              <strong>06:11 PM</strong>
            </div>
            <div>
              <small>Working hours</small>
              <strong>8h 39m</strong>
            </div>
          </div>
          <MiniBars
            values={[91, 95, 88, 100, 73]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
            color="teal"
          />
        </section>
        <section className="panel leave-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Time off</p>
              <h2>Leave balance</h2>
            </div>
            <Button onClick={openLeave} icon={<Plus />}>
              Apply for leave
            </Button>
          </div>
          <div className="leave-list">
            <div>
              <span className="leave-symbol blue">C</span>
              <p>
                <strong>Casual leave</strong>
                <small>2 used of 8</small>
              </p>
              <b>6</b>
            </div>
            <div>
              <span className="leave-symbol red">S</span>
              <p>
                <strong>Sick leave</strong>
                <small>1 used of 6</small>
              </p>
              <b>5</b>
            </div>
            <div>
              <span className="leave-symbol green">P</span>
              <p>
                <strong>Paid leave</strong>
                <small>9 used of 12</small>
              </p>
              <b>3</b>
            </div>
          </div>
          <div className="pending-note">
            <Clock3 />
            <span>
              <strong>2 requests pending</strong>
              <small>Latest request submitted 24 May</small>
            </span>
          </div>
        </section>
      </div>
      <section className="salary-strip">
        <div className="salary-title">
          <span>
            <CircleDollarSign />
          </span>
          <div>
            <p className="eyebrow light">Latest payroll · April 2024</p>
            <h2>₹76,260</h2>
            <small>Net salary paid on 30 Apr 2024</small>
          </div>
        </div>
        <div className="salary-equation">
          <div>
            <small>Basic salary</small>
            <strong>₹72,000</strong>
          </div>
          <span>+</span>
          <div>
            <small>Allowances</small>
            <strong className="green-text">₹9,500</strong>
          </div>
          <span>−</span>
          <div>
            <small>Deductions</small>
            <strong className="red-text">₹5,240</strong>
          </div>
          <span>=</span>
          <div className="net">
            <small>Net salary</small>
            <strong>₹76,260</strong>
          </div>
        </div>
        <Button variant="secondary" icon={<Download />}>
          Payslip
        </Button>
      </section>
    </>
  );
}

function HRDashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Monday, 27 May 2024"
        title="Good morning, HR Team 👋"
        description="Here’s the pulse of Northstar Labs today."
        action={<Button icon={<Plus />}>Add employee</Button>}
      />
      <div className="stats-grid">
        <Stat
          label="Total employees"
          value="248"
          detail="+12 this quarter"
          icon={<Users />}
          tone="blue"
          trend="up"
        />
        <Stat
          label="Present today"
          value="221"
          detail="94.2% attendance rate"
          icon={<CheckCircle2 />}
          tone="green"
        />
        <Stat
          label="On leave"
          value="16"
          detail="6.4% of workforce"
          icon={<CalendarDays />}
          tone="teal"
        />
        <Stat
          label="Pending requests"
          value="11"
          detail="Requires your attention"
          icon={<Clock3 />}
          tone="amber"
        />
      </div>
      <div className="hr-overview-grid">
        <section className="panel trend-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Team health</p>
              <h2>Attendance trend</h2>
            </div>
            <select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <MiniBars
            values={[91, 94, 92, 96, 94, 72, 58]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            color="blue"
          />
          <div className="chart-legend">
            <span>
              <i className="blue-bg" />
              Present
            </span>
            <strong>
              94.2% <small>average</small>
            </strong>
          </div>
        </section>
        <section className="panel department-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workforce</p>
              <h2>Department mix</h2>
            </div>
            <button className="icon-button">
              <MoreHorizontal />
            </button>
          </div>
          <div className="department-content">
            <Donut value={36} tone="blue" label="Engineering" />
            <div className="department-list">
              <span>
                <i className="blue-bg" />
                Engineering <b>89</b>
              </span>
              <span>
                <i className="teal-bg" />
                Sales & Marketing <b>61</b>
              </span>
              <span>
                <i className="violet-bg" />
                Operations <b>54</b>
              </span>
              <span>
                <i className="amber-bg" />
                Other <b>44</b>
              </span>
            </div>
          </div>
        </section>
      </div>
      <div className="hr-lists-grid">
        <section className="panel people-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">New teammates</p>
              <h2>Recently joined</h2>
            </div>
            <button className="text-button">
              View all <ChevronRight />
            </button>
          </div>
          {employees.slice(1, 4).map((e, i) => (
            <div className="person-row" key={e.id}>
              <Avatar initials={e.initials} tone={e.tone} />
              <p>
                <strong>{e.name}</strong>
                <small>
                  {e.title} · {e.dept}
                </small>
              </p>
              <span>{i === 0 ? "Today" : `${i + 2} days ago`}</span>
            </div>
          ))}
        </section>
        <section className="panel people-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Availability</p>
              <h2>Currently on leave</h2>
            </div>
            <button className="text-button">
              Manage <ChevronRight />
            </button>
          </div>
          {employees.slice(2, 5).map((e, i) => (
            <div className="person-row" key={e.id}>
              <Avatar initials={e.initials} tone={e.tone} />
              <p>
                <strong>{e.name}</strong>
                <small>
                  {e.dept} · {i + 1} day{i ? "s" : ""}
                </small>
              </p>
              <Badge tone={i === 0 ? "red" : "amber"}>
                {i === 0 ? "Sick leave" : "Paid leave"}
              </Badge>
            </div>
          ))}
        </section>
        <section className="panel payroll-snapshot">
          <div>
            <p className="eyebrow light">May payroll</p>
            <h2>₹18.42L</h2>
            <p>Estimated total payroll</p>
          </div>
          <div className="payroll-progress">
            <span>
              <small>Processed</small>
              <b>82%</b>
            </span>
            <i>
              <em />
            </i>
            <p>204 of 248 employee records complete</p>
          </div>
          <Button variant="secondary">Review payroll</Button>
        </section>
      </div>
    </>
  );
}

function EmployeesPage({
  openEmployee,
}: {
  openEmployee: (index: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All departments");
  const filtered = employees.filter(
    (e) =>
      (e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.email.toLowerCase().includes(query.toLowerCase())) &&
      (dept === "All departments" || e.dept === dept),
  );
  return (
    <>
      <PageHeader
        eyebrow="People directory"
        title="Employees"
        description="Manage profiles, roles, and employment details for 248 team members."
        action={<Button icon={<Plus />}>Add employee</Button>}
      />
      <section className="table-panel">
        <div className="table-toolbar">
          <div className="search">
            <Search />
            <input
              placeholder="Search name, email, or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filters">
            <select value={dept} onChange={(e) => setDept(e.target.value)}>
              <option>All departments</option>
              {[
                "Engineering",
                "Design",
                "Finance",
                "People",
                "Marketing",
                "Sales",
              ].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select>
              <option>All statuses</option>
              <option>Active</option>
              <option>On leave</option>
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Job title</th>
                <th>Joining date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() =>
                    openEmployee(
                      employees.findIndex((employee) => employee.id === e.id),
                    )
                  }
                >
                  <td>
                    <div className="table-person">
                      <Avatar initials={e.initials} tone={e.tone} />
                      <span>
                        <strong>{e.name}</strong>
                        <small>{e.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <code>{e.id}</code>
                  </td>
                  <td>{e.dept}</td>
                  <td>{e.title}</td>
                  <td>{e.joined}</td>
                  <td>
                    <Badge>{e.status}</Badge>
                  </td>
                  <td>
                    <button className="icon-button">
                      <MoreHorizontal />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {filtered.length} of 248 employees</span>
          <div>
            <Button variant="secondary">Previous</Button>
            <Button variant="secondary">Next</Button>
          </div>
        </div>
      </section>
    </>
  );
}

function HRAttendance() {
  const [query, setQuery] = useState("");
  const rows = attendanceRows.filter((row) =>
    row[0].toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="Daily operations"
        title="Attendance"
        description="Monitor check-ins and working hours across your team."
        action={
          <Button variant="secondary" icon={<Download />}>
            Export report
          </Button>
        }
      />
      <div className="compact-stats">
        <div>
          <span className="stat-icon green">
            <CheckCircle2 />
          </span>
          <p>
            <small>Present</small>
            <strong>221</strong>
          </p>
        </div>
        <div>
          <span className="stat-icon red">
            <XCircle />
          </span>
          <p>
            <small>Absent</small>
            <strong>11</strong>
          </p>
        </div>
        <div>
          <span className="stat-icon amber">
            <Clock3 />
          </span>
          <p>
            <small>Late arrivals</small>
            <strong>16</strong>
          </p>
        </div>
        <div className="compact-chart">
          <span>
            <small>7-day trend</small>
            <strong>94.2%</strong>
          </span>
          <MiniBars
            values={[80, 92, 84, 100, 93, 89, 96]}
            labels={["", "", "", "", "", "", ""]}
            color="teal"
          />
        </div>
      </div>
      <section className="table-panel">
        <div className="table-toolbar">
          <div className="search">
            <Search />
            <input
              placeholder="Search employee..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filters">
            <input type="date" defaultValue="2024-05-27" />
            <select>
              <option>All departments</option>
              <option>Engineering</option>
              <option>Design</option>
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Working hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r[0]}>
                  <td>
                    <div className="table-person">
                      <Avatar
                        initials={r[0]
                          .split(" ")
                          .map((x) => x[0])
                          .join("")}
                        tone={employees[i]?.tone || "blue"}
                      />
                      <strong>{r[0]}</strong>
                    </div>
                  </td>
                  <td>{r[1]}</td>
                  <td>27 May 2024</td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td>{r[4]}</td>
                  <td>
                    <Badge>{r[5]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function LeaveManagement() {
  const [requests, setRequests] = useState(leaveSeed);
  const [tab, setTab] = useState("Pending");
  const visible = requests.filter((r) => r.status === tab);
  const update = (id: number, status: string) =>
    setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  return (
    <>
      <PageHeader
        eyebrow="Time off"
        title="Leave management"
        description="Review requests and keep team availability on track."
      />
      <div className="leave-tabs">
        {["Pending", "Approved", "Rejected"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
            <span>{requests.filter((r) => r.status === t).length}</span>
          </button>
        ))}
      </div>
      <div className="request-list">
        {visible.length ? (
          visible.map((r) => (
            <article className="request-card" key={r.id}>
              <div className="request-person">
                <Avatar
                  initials={r.initials}
                  tone={
                    r.status === "Pending"
                      ? "amber"
                      : r.status === "Approved"
                        ? "green"
                        : "red"
                  }
                />
                <div>
                  <h3>{r.employee}</h3>
                  <p>{r.type}</p>
                </div>
              </div>
              <div className="request-dates">
                <div>
                  <small>From</small>
                  <strong>{r.start}</strong>
                </div>
                <ChevronRight />
                <div>
                  <small>To</small>
                  <strong>{r.end}</strong>
                </div>
                <span>
                  {r.days} day{r.days > 1 ? "s" : ""}
                </span>
              </div>
              <div className="request-reason">
                <small>Reason</small>
                <p>{r.reason}</p>
              </div>
              <div className="request-actions">
                {r.status === "Pending" ? (
                  <>
                    <Button
                      variant="danger"
                      onClick={() => update(r.id, "Rejected")}
                      icon={<X />}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => update(r.id, "Approved")}
                      icon={<Check />}
                    >
                      Approve
                    </Button>
                  </>
                ) : (
                  <Badge>{r.status}</Badge>
                )}
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            title={`No ${tab.toLowerCase()} requests`}
            text="There’s nothing to review in this category right now."
          />
        )}
      </div>
    </>
  );
}

function PayrollPage({ openPayroll }: { openPayroll: () => void }) {
  return (
    <>
      <PageHeader
        eyebrow="May 2024"
        title="Payroll"
        description="Review salaries, deductions, and monthly disbursements."
        action={
          <Button onClick={openPayroll} icon={<Plus />}>
            Create payroll
          </Button>
        }
      />
      <div className="stats-grid payroll-stats">
        <Stat
          label="Total payroll"
          value="₹18.42L"
          detail="248 employees"
          icon={<WalletCards />}
          tone="navy"
        />
        <Stat
          label="Basic salaries"
          value="₹16.08L"
          detail="87.3% of total"
          icon={<Banknote />}
          tone="blue"
        />
        <Stat
          label="Allowances"
          value="₹3.12L"
          detail="16.9% of total"
          icon={<ArrowUpRight />}
          tone="green"
        />
        <Stat
          label="Deductions"
          value="₹78.2K"
          detail="4.2% of gross"
          icon={<ArrowDownRight />}
          tone="red"
        />
      </div>
      <section className="table-panel">
        <div className="table-toolbar">
          <div className="search">
            <Search />
            <input placeholder="Search employee..." />
          </div>
          <div className="filters">
            <select>
              <option>May 2024</option>
              <option>April 2024</option>
            </select>
            <Button variant="secondary" icon={<Download />}>
              Export
            </Button>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basic salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net salary</th>
                <th>Pay date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {payrollRows.map((r, i) => (
                <tr key={r[0]}>
                  <td>
                    <div className="table-person">
                      <Avatar
                        initials={r[0]
                          .split(" ")
                          .map((x) => x[0])
                          .join("")}
                        tone={employees[i]?.tone || "blue"}
                      />
                      <strong>{r[0]}</strong>
                    </div>
                  </td>
                  <td>{r[1]}</td>
                  <td className="green-text">{r[2]}</td>
                  <td className="red-text">{r[3]}</td>
                  <td>
                    <strong>{r[4]}</strong>
                  </td>
                  <td>{r[5]}</td>
                  <td>
                    <button className="icon-button" onClick={openPayroll}>
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function EmployeeSubPage({
  page,
  openLeave,
  openProfile,
}: {
  page: Page;
  openLeave: () => void;
  openProfile: () => void;
}) {
  const [payroll, setPayroll] = useState<any[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState("");

  useEffect(() => {
    if (page !== "payroll") return;

    const loadPayroll = async () => {
      try {
        setPayrollLoading(true);
        setPayrollError("");

        const data = await getMyPayroll();

        setPayroll(data);

        setPayroll(data);
      } catch (error) {
        console.error("Payroll error:", error);
        setPayrollError("Unable to load your payroll.");
      } finally {
        setPayrollLoading(false);
      }
    };

    loadPayroll();
  }, [page]);

  if (page === "profile")
    return (
      <>
        <PageHeader
          eyebrow="Employee profile"
          title="My profile"
          description="Your personal and employment information."
          action={
            <Button
              variant="secondary"
              onClick={openProfile}
              icon={<UserRound />}
            >
              Edit details
            </Button>
          }
        />

        <section className="profile-hero">
          <div className="profile-identity">
            <Avatar initials="AN" tone="blue" size="lg" />
            <div>
              <h2>Afzal Nadaf</h2>
              <p>Software Engineer · Engineering</p>
              <Badge tone="green">Active employee</Badge>
            </div>
          </div>

          <div className="profile-meta">
            <div>
              <Mail />
              <span>
                <small>Work email</small>
                <strong>afzal.nadaf@northstar.co</strong>
              </span>
            </div>

            <div>
              <BriefcaseBusiness />
              <span>
                <small>Employee ID</small>
                <strong>EMP001</strong>
              </span>
            </div>

            <div>
              <CalendarDays />
              <span>
                <small>Joined</small>
                <strong>12 March 2022</strong>
              </span>
            </div>
          </div>
        </section>

        <div className="profile-summary">
          <Stat
            label="Attendance rate"
            value="96%"
            detail="Last 30 days"
            icon={<Activity />}
            tone="teal"
          />

          <Stat
            label="Leave balance"
            value="14 days"
            detail="Across leave types"
            icon={<CalendarDays />}
            tone="blue"
          />

          <Stat
            label="Latest salary"
            value="₹76,260"
            detail="April 2024"
            icon={<WalletCards />}
            tone="violet"
          />
        </div>
      </>
    );

  if (page === "attendance")
    return (
      <>
        <PageHeader
          eyebrow="My work hours"
          title="Attendance"
          description="Track your daily check-ins and monthly consistency."
        />

        <div className="compact-stats">
          <div>
            <span className="stat-icon green">
              <CheckCircle2 />
            </span>

            <p>
              <small>Present days</small>
              <strong>22</strong>
            </p>
          </div>

          <div>
            <span className="stat-icon amber">
              <Clock3 />
            </span>

            <p>
              <small>Average check-in</small>
              <strong>09:04</strong>
            </p>
          </div>

          <div>
            <span className="stat-icon blue">
              <Activity />
            </span>

            <p>
              <small>Average hours</small>
              <strong>8h 34m</strong>
            </p>
          </div>
        </div>

        <section className="panel large-chart">
          <div className="section-heading">
            <div>
              <p className="eyebrow">This week</p>
              <h2>Working hours</h2>
            </div>

            <Badge tone="green">96% on time</Badge>
          </div>

          <MiniBars
            values={[87, 94, 90, 98, 72]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
            color="teal"
          />
        </section>
      </>
    );

  if (page === "leave")
    return (
      <>
        <PageHeader
          eyebrow="My time off"
          title="Leave"
          description="Plan time away and follow your request status."
          action={
            <Button onClick={openLeave} icon={<Plus />}>
              Apply for leave
            </Button>
          }
        />

        <div className="stats-grid employee-stats">
          <Stat
            label="Casual leave"
            value="6 days"
            detail="2 of 8 used"
            icon={<CalendarDays />}
            tone="blue"
          />

          <Stat
            label="Sick leave"
            value="5 days"
            detail="1 of 6 used"
            icon={<Activity />}
            tone="red"
          />

          <Stat
            label="Paid leave"
            value="3 days"
            detail="9 of 12 used"
            icon={<BriefcaseBusiness />}
            tone="green"
          />

          <Stat
            label="Pending"
            value="2"
            detail="Awaiting review"
            icon={<Clock3 />}
            tone="amber"
          />
        </div>

        <section className="table-panel">
          <div className="section-heading inset">
            <div>
              <p className="eyebrow">Request history</p>
              <h2>Recent leave</h2>
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Leave type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {leaveSeed.slice(0, 3).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.type}</strong>
                    </td>

                    <td>
                      {r.start} – {r.end}
                    </td>

                    <td>{r.days}</td>

                    <td>{r.reason}</td>

                    <td>
                      <Badge>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );

  // EMPLOYEE PAYROLL
  const latestPayroll = payroll.length > 0 ? payroll[0] : null;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatPayDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Compensation"
        title="My payroll"
        description="View salary details and download your payslips."
        action={
          <Button variant="secondary" icon={<Download />}>
            Download payslip
          </Button>
        }
      />

      {payrollLoading && (
        <section className="panel">
          <p>Loading your payroll...</p>
        </section>
      )}

      {payrollError && (
        <section className="panel">
          <p>{payrollError}</p>
        </section>
      )}

      {!payrollLoading && !payrollError && !latestPayroll && (
        <section className="panel">
          <h2>No payroll records found</h2>
          <p>Your salary information has not been added yet.</p>
        </section>
      )}

      {!payrollLoading && !payrollError && latestPayroll && (
        <section className="employee-payroll">
          <div className="payroll-primary">
            <p className="eyebrow light">Latest net salary</p>

            <h2>{formatCurrency(latestPayroll.netSalary)}</h2>

            <p>Paid on {formatPayDate(latestPayroll.payDate)}</p>

            <Badge tone="green">Payment complete</Badge>
          </div>

          <div className="breakdown">
            <h2>Salary breakdown</h2>

            <div>
              <span>Basic salary</span>
              <strong>{formatCurrency(latestPayroll.basicSalary)}</strong>
            </div>

            <div>
              <span>Allowances</span>
              <strong className="green-text">
                + {formatCurrency(latestPayroll.allowances)}
              </strong>
            </div>

            <div>
              <span>Deductions</span>
              <strong className="red-text">
                − {formatCurrency(latestPayroll.deductions)}
              </strong>
            </div>

            <div className="breakdown-total">
              <span>Net salary</span>

              <strong>{formatCurrency(latestPayroll.netSalary)}</strong>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <span>
        <FileText />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="modal-layer" role="dialog">
      <button className="modal-scrim" onClick={onClose} aria-label="Close" />
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmployeeDetail({
  index,
  onClose,
}: {
  index: number;
  onClose: () => void;
}) {
  const e = employees[index] || employees[0];
  return (
    <Modal title="Employee details" onClose={onClose}>
      <div className="detail-hero">
        <Avatar initials={e.initials} tone={e.tone} size="lg" />
        <div>
          <h2>{e.name}</h2>
          <p>
            {e.title} · {e.dept}
          </p>
          <Badge>{e.status}</Badge>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <small>Employee ID</small>
          <strong>{e.id}</strong>
        </div>
        <div>
          <small>Work email</small>
          <strong>{e.email}</strong>
        </div>
        <div>
          <small>Joining date</small>
          <strong>{e.joined}</strong>
        </div>
        <div>
          <small>Employment</small>
          <strong>Full time</strong>
        </div>
      </div>
      <div className="detail-metrics">
        <Stat
          label="Attendance"
          value="96%"
          detail="This month"
          icon={<Activity />}
          tone="teal"
        />
        <Stat
          label="Leave balance"
          value="14"
          detail="Days available"
          icon={<CalendarDays />}
          tone="blue"
        />
        <Stat
          label="Latest salary"
          value="₹76.2K"
          detail="Paid 30 Apr"
          icon={<WalletCards />}
          tone="violet"
        />
      </div>
    </Modal>
  );
}

function FormModal({
  kind,
  onClose,
}: {
  kind: "leave" | "payroll";
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <Modal title="All set" onClose={onClose}>
        <div className="success-state">
          <span>
            <Check />
          </span>
          <h2>
            {kind === "leave"
              ? "Leave request submitted"
              : "Payroll draft created"}
          </h2>
          <p>
            {kind === "leave"
              ? "HR will review your request and notify you."
              : "The May payroll is ready for review."}
          </p>
          <Button onClick={onClose}>Done</Button>
        </div>
      </Modal>
    );
  return (
    <Modal
      title={kind === "leave" ? "Apply for leave" : "Create payroll"}
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
        }}
      >
        {kind === "leave" ? (
          <>
            <label>
              Leave type
              <select required>
                <option>Casual leave</option>
                <option>Sick leave</option>
                <option>Paid leave</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                Start date
                <input type="date" required />
              </label>
              <label>
                End date
                <input type="date" required />
              </label>
            </div>
            <label>
              Reason
              <textarea
                rows={3}
                placeholder="Briefly explain your request..."
                required
              />
            </label>
          </>
        ) : (
          <>
            <label>
              Payroll period
              <select>
                <option>May 2024</option>
                <option>June 2024</option>
              </select>
            </label>
            <label>
              Employee group
              <select>
                <option>All active employees (248)</option>
                <option>Engineering (89)</option>
              </select>
            </label>
            <div className="payroll-preview">
              <WalletCards />
              <span>
                <small>Estimated payroll</small>
                <strong>₹18,42,000</strong>
              </span>
            </div>
          </>
        )}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {kind === "leave" ? "Submit request" : "Create draft"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ProfileEditModal({ onClose }: { onClose: () => void }) {
  const [saved, setSaved] = useState(false);
  if (saved)
    return (
      <Modal title="Profile updated" onClose={onClose}>
        <div className="success-state">
          <span>
            <Check />
          </span>
          <h2>Details saved successfully</h2>
          <p>Your personal information has been updated.</p>
          <Button onClick={onClose}>Done</Button>
        </div>
      </Modal>
    );
  return (
    <Modal title="Edit personal details" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <div className="form-row">
          <label>
            First name
            <input defaultValue="Afzal" required />
          </label>
          <label>
            Last name
            <input defaultValue="Nadaf" required />
          </label>
        </div>
        <label>
          Work email
          <input
            type="email"
            defaultValue="afzal.nadaf@northstar.co"
            disabled
          />
        </label>
        <div className="form-row">
          <label>
            Phone number
            <input type="tel" defaultValue="+91 98765 43210" />
          </label>
          <label>
            Date of birth
            <input type="date" defaultValue="1997-08-14" />
          </label>
        </div>
        <label>
          Home address
          <textarea
            rows={3}
            defaultValue="42 Lakeview Road, Bengaluru, Karnataka"
          />
        </label>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkedIn, setCheckedIn] = useState(true);
  const [employeeDetail, setEmployeeDetail] = useState<number | null>(null);
  const [modal, setModal] = useState<"leave" | "payroll" | "profile" | null>(
    null,
  );
  const login = (nextRole: Role) => {
    setRole(nextRole);
    setPage("dashboard");
  };
  const safePage = useMemo(() => {
    if (!role) return "dashboard";

    // Employee cannot access HR-only Employees page
    if (role === "employee" && page === "employees") {
      return "dashboard";
    }

    // HR cannot access employee-only Profile page
    if (role === "hr" && page === "profile") {
      return "dashboard";
    }

    return page;
  }, [page, role]);
  if (!role) return <Login onLogin={login} />;
  let content: ReactNode;
  if (safePage === "dashboard")
    content =
      role === "hr" ? (
        <HRDashboard />
      ) : (
        <EmployeeDashboard
          checkedIn={checkedIn}
          onCheck={() => setCheckedIn(!checkedIn)}
          openLeave={() => setModal("leave")}
        />
      );
  else if (role === "hr" && safePage === "employees")
    content = <EmployeesPage openEmployee={setEmployeeDetail} />;
  else if (role === "hr" && safePage === "attendance")
    content = <HRAttendance />;
  else if (role === "hr" && safePage === "leave") content = <LeaveManagement />;
  else if (role === "hr" && safePage === "payroll")
    content = <PayrollPage openPayroll={() => setModal("payroll")} />;
  else
    content = (
      <EmployeeSubPage
        page={safePage}
        openLeave={() => setModal("leave")}
        openProfile={() => setModal("profile")}
      />
    );
  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        page={safePage}
        setPage={setPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="app-main">
        <Topbar
          role={role}
          onMenu={() => setMobileOpen(true)}
          onLogout={() => setRole(null)}
        />
        <main className="content">{content}</main>
      </div>
      {employeeDetail !== null && (
        <EmployeeDetail
          index={employeeDetail}
          onClose={() => setEmployeeDetail(null)}
        />
      )}
      {modal === "profile" ? (
        <ProfileEditModal onClose={() => setModal(null)} />
      ) : (
        modal && <FormModal kind={modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
