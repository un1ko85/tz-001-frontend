import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import axios from "axios"
import { Toaster } from "sonner"

import { useAuthStore } from "@/features/auth/model/store"
import { LoginForm } from "@/features/auth/ui/LoginForm"
import { RegisterForm } from "@/features/auth/ui/RegisterForm"
import { ProtectedRoute, PublicRoute } from "@/features/auth/ui/guards"
import { Dashboard } from "@/pages/dashboard/Dashboard"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setUser = useAuthStore((state) => state.setUser)
  const setInitialized = useAuthStore((state) => state.setInitialized)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await axios.post("/api/auth/refresh")
        const { access_token } = response.data
        setAccessToken(access_token)

        const userResponse = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        setUser(userResponse.data)
      } catch (error) {
        // No valid session cookie
        setAccessToken(null)
        setUser(null)
      } finally {
        setInitialized(true)
      }
    }

    initializeSession()
  }, [setAccessToken, setUser, setInitialized])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-500/30">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
                    <LoginForm />
                  </div>
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
                    <RegisterForm />
                  </div>
                </PublicRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        <Toaster theme="dark" position="top-right" closeButton richColors />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
