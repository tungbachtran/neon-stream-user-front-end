// src/lib/features/auth/authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi, LoginData, RegisterData } from "@/lib/api/auth";
import { User } from "@/types";
import { RegisterFormData } from "@/app/(auth)/register/page";



type AuthState = {
  user: User | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isCheckingAuth: true,
  isAuthenticated: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getProfile();
      return user;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unauthenticated");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginData, { rejectWithValue }) => {
    try {
 await authApi.login(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterFormData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Registration failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isCheckingAuth = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.isCheckingAuth = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
        state.error = action.payload as string;
      })

      // login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;
