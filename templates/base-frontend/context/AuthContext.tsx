"use client";

import { useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import {
  fetchCurrentUser,
  loginThunk,
  logoutThunk,
  registerThunk,
} from "@/features/auth/authSlice";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <>{children}</>;
}

export function useAuth(): AuthContextValue {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading } = useAppSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      await dispatch(loginThunk({ email, password })).unwrap();
      router.push("/dashboard");
    },
    [dispatch, router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await dispatch(registerThunk({ name, email, password })).unwrap();
      router.push("/dashboard");
    },
    [dispatch, router]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutThunk()).unwrap();
    queryClient.clear();
    router.push("/login");
  }, [dispatch, queryClient, router]);

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}
