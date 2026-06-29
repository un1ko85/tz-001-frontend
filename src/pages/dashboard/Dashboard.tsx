import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { LogOut, Plus, Shield, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/features/auth/model/store"
import { apiClient } from "@/shared/api/client"
import { Button } from "@/shared/ui/button"
import { RequestFilters } from "@/features/requests/ui/RequestFilters"
import { RequestTable } from "@/features/requests/ui/RequestTable"
import { RequestDialog } from "@/features/requests/ui/RequestDialog"
import type { RequestPriority, RequestStatus, RequestListResponse } from "@/shared/api/types"

export function Dashboard() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  // Filters State
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "all">("all")
  const [sortBy, setSortBy] = useState<"created_at" | "priority">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const perPage = 10

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null)

  // Fetch Requests
  const { data, isLoading } = useQuery<RequestListResponse>({
    queryKey: [
      "requests",
      { search, statusFilter, priorityFilter, sortBy, sortOrder, page },
    ],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (priorityFilter !== "all") params.append("priority", priorityFilter)
      params.append("sort_by", sortBy)
      params.append("sort_order", sortOrder)
      params.append("page", page.toString())
      params.append("per_page", perPage.toString())

      const response = await apiClient.get(`/requests?${params.toString()}`)
      return response.data
    },
  })

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout")
    },
    onSuccess: () => {
      clearAuth()
      toast.success("Successfully logged out")
    },
    onError: () => {
      clearAuth() // Clear state anyway
    },
  })

  const handleEditClick = (id: number) => {
    setEditingRequestId(id)
    setIsDialogOpen(true)
  }

  const handleCreateClick = () => {
    setEditingRequestId(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              H
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Helpdesk Tracker
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-200">{user?.username}</span>
              <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
            </div>

            {user?.role === "admin" && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-800 text-slate-300">
                  <Shield className="mr-2 h-4 w-4 text-blue-400" />
                  Admin Panel
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="border border-slate-800 rounded-lg p-5 bg-slate-900/30 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-slate-300">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-semibold text-sm">Filters & Sort</span>
              </div>
            </div>
            <RequestFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>
        </aside>

        {/* Requests List */}
        <section className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-100">Requests</h2>
              <p className="text-sm text-slate-400">Manage and track helpdesk requests</p>
            </div>
            <Button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          </div>

          <div className="border border-slate-800 rounded-lg bg-slate-900/20 backdrop-blur-md overflow-hidden">
            <RequestTable
              data={data?.items || []}
              isLoading={isLoading}
              onEdit={handleEditClick}
              total={data?.total || 0}
              page={page}
              pages={data?.pages || 0}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>

      {/* Dialog for Create / Edit */}
      {isDialogOpen && (
        <RequestDialog
          requestId={editingRequestId}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
            setIsDialogOpen(false)
            queryClient.invalidateQueries({ queryKey: ["requests"] })
          }}
        />
      )}
    </div>
  )
}
