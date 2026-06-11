// src/lib/features/auth/authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi, LoginData, RegisterData } from "@/lib/api/auth";
import { User } from "@/types";
import { RegisterFormData } from "@/app/(auth)/register/page";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isCheckingAuth: boolean; // ✅ true chỉ lần đầu app khởi động
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

// ✅ Fetch profile — chỉ gọi 1 lần khi app mount
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    // Nếu không có token trong localStorage → không cần gọi API
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (!token) return rejectWithValue("No token");
    }

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
      const response = await authApi.login(data);
      // ✅ Lưu token vào localStorage ngay khi login thành công
      if (typeof window !== "undefined" && response.accessToken) {
        localStorage.setItem("access_token", response.accessToken);
      }
      return response.user;
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
      // ✅ Lưu token vào localStorage ngay khi register thành công
      if (typeof window !== "undefined" && response.accessToken) {
        localStorage.setItem("access_token", response.accessToken);
      }
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
      // ✅ Xóa token khỏi localStorage khi logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
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
        // Không bật lại global loading ở đây
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;

        const message = action.payload as string;

        // Không cần hiển thị "No token" như lỗi thật
        state.error = message === "No token" ? null : message;
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
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
