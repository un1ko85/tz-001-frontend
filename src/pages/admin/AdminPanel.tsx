import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, User, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { useAuthStore } from "@/features/auth/model/store"
import { apiClient } from "@/shared/api/client"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import type { UserResponse, UserRole } from "@/shared/api/types"

export function AdminPanel() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  // Fetch Users
  const { data: users, isLoading } = useQuery<UserResponse[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get("/users")
      return response.data
    },
  })

  // Role Update Mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: UserRole }) => {
      return await apiClient.patch(`/users/${userId}/role`, { role })
    },
    onSuccess: () => {
      toast.success("User role updated successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail || "Failed to update user role"
      toast.error(detail)
    },
  })

  const handleRoleChange = (userId: number, role: UserRole) => {
    updateRoleMutation.mutate({ userId, role })
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-bold text-lg tracking-tight">Admin Control Panel</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-sans">User Management</h2>
          <p className="text-sm text-slate-400">View registered employees and adjust permission levels</p>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/20 backdrop-blur-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full bg-slate-900" />
              <Skeleton className="h-12 w-full bg-slate-900" />
              <Skeleton className="h-12 w-full bg-slate-900" />
            </div>
          ) : !users || users.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-sans">
              No users found in database.
            </div>
          ) : (
            <Table className="border-collapse">
              <TableHeader className="border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-medium">User ID</TableHead>
                  <TableHead className="text-slate-400 font-medium">Username</TableHead>
                  <TableHead className="text-slate-400 font-medium">Role</TableHead>
                  <TableHead className="text-slate-400 font-medium">Date Registered</TableHead>
                  <TableHead className="text-slate-400 font-medium w-48">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-slate-800 hover:bg-slate-900/30">
                    <TableCell className="font-mono text-xs text-slate-400">#{u.id}</TableCell>
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>{u.username}</span>
                        {currentUser?.id === u.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                            You
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-slate-300 text-sm">{u.role}</span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {formatDate(u.created_at)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}
                        disabled={currentUser?.id === u.id}
                      >
                        <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-200 text-xs h-9">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  )
}
