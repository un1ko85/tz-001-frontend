import { create } from "zustand"
import type { UserResponse } from "@/shared/api/types"

export interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  isInitialized: boolean
  setAccessToken: (token: string | null) => void
  setUser: (user: UserResponse | null) => void
  setInitialized: (val: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setInitialized: (val) => set({ isInitialized: val }),
  clearAuth: () => set({ accessToken: null, user: null }),
}))
