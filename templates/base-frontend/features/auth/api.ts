"use client";

import api from "@/lib/axios";
import type { ApiSuccessResponse, AuthResponse, User } from "@/types";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await api.post<ApiSuccessResponse<{ user: User }>>("/auth/register", data);
    const { data: payload, message } = res.data;
    return { user: payload!.user, message: message ?? "Registration successful" };
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post<ApiSuccessResponse<{ user: User }>>("/auth/login", data);
    const { data: payload, message } = res.data;
    return { user: payload!.user, message: message ?? "Login successful" };
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiSuccessResponse<{ user: User }>>("/auth/me");
    return res.data.data!.user;
  },
};

