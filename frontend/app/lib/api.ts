const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.message || "Something went wrong" };
    }

    return { data: json, error: null };
  } catch {
    return { data: null, error: "Network error. Please check your connection." };
  }
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface SigninPayload {
  username: string;
  password: string;
}

export interface UserResponse {
  message: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface MeResponse {
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

export const api = {
  signup: (payload: SignupPayload) =>
    request<UserResponse>("/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  signin: (payload: SigninPayload) =>
    request<UserResponse>("/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ message: string }>("/logout", { method: "POST" }),

  getMe: () => request<MeResponse>("/getme"),
};
