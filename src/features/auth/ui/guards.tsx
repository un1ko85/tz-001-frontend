import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/model/store"
import type { UserRole } from "@/shared/api/types"

interface RouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: RouteProps) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading your session...</p>
        </div>
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

interface RoleRouteProps extends RouteProps {
  allowedRoles: UserRole[]
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function PublicRoute({ children }: RouteProps) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  if (!isInitialized) {
    return null // Silence render until initial session load check is complete
  }

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
