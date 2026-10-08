import axios from "axios";

const API_URL = "http://localhost:5067";

export interface LoginResponse {
  token: string;
  role: string;
  email: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/api/auth/login`,
    {
      email,
      password,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}