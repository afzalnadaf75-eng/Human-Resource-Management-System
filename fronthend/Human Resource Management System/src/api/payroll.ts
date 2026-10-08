import axios from "axios";

const API_URL = "http://localhost:5067";

export interface Payroll {
  id: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payDate: string;
}

export async function getMyPayroll(): Promise<Payroll[]> {
  const token = localStorage.getItem("token");

  const response = await axios.get<Payroll[]>(
    `${API_URL}/api/payroll/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}