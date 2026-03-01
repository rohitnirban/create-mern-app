"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "@/features/auth/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
};

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async () => {
  try {
    const user = await authApi.getMe();
    return user;
  } catch {
    return null;
  }
});

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const res = await authApi.login({ email, password });
    return res.user;
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const res = await authApi.register({ name, email, password });
    return res.user;
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default authSlice.reducer;

