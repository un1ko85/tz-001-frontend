import React, { useEffect, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuthStore } from "@/features/auth/model/store"
import { apiClient } from "@/shared/api/client"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import type { RequestPriority, RequestStatus, RequestResponse, UserResponse } from "@/shared/api/types"

interface RequestDialogProps {
  requestId: number | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RequestDialog({
  requestId,
  isOpen,
  onClose,
  onSuccess,
}: RequestDialogProps) {
  const user = useAuthStore((state) => state.user)
  const isEditMode = requestId !== null

  // Fields State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<RequestPriority>("normal")
  const [status, setStatus] = useState<RequestStatus>("new")
  const [assigneeId, setAssigneeId] = useState<string>("unassigned")

  // Fetch single request (only in Edit mode)
  const { data: requestDetails, isLoading: isDetailsLoading } = useQuery<RequestResponse>({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const response = await apiClient.get(`/requests/${requestId}`)
      return response.data
    },
    enabled: isEditMode && isOpen,
  })

  // Fetch managers & admins for assignee selection (Managers / Admins only)
  const isStaff = user?.role === "manager" || user?.role === "admin"
  const { data: usersList } = useQuery<UserResponse[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get("/users")
      return response.data
    },
    enabled: isStaff && isOpen,
  })

  // Filter possible assignees (only managers and admins)
  const assignees = usersList?.filter(
    (u) => u.role === "manager" || u.role === "admin"
  ) || []

  // Prepopulate form fields
  useEffect(() => {
    if (isEditMode && requestDetails) {
      setTitle(requestDetails.title)
      setDescription(requestDetails.description || "")
      setPriority(requestDetails.priority)
      setStatus(requestDetails.status)
      setAssigneeId(
        requestDetails.assignee ? requestDetails.assignee.id.toString() : "unassigned"
      )
    } else if (!isEditMode) {
      setTitle("")
      setDescription("")
      setPriority("normal")
      setStatus("new")
      setAssigneeId("unassigned")
    }
  }, [isEditMode, requestDetails, isOpen])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {}

      if (!isEditMode) {
        // Create Request (all users can do this)
        payload.title = title
        payload.description = description
        payload.priority = priority
        return await apiClient.post("/requests", payload)
      } else {
        // Edit Request: role-based payload fields
        if (user?.role === "admin") {
          payload.title = title
          payload.description = description
          payload.priority = priority
          payload.status = status
          payload.assignee_id = assigneeId === "unassigned" ? null : parseInt(assigneeId)
        } else if (user?.role === "manager") {
          payload.status = status
          payload.assignee_id = assigneeId === "unassigned" ? null : parseInt(assigneeId)
        } else {
          // User role
          payload.title = title
          payload.description = description
          payload.priority = priority
          payload.status = status
        }
        return await apiClient.patch(`/requests/${requestId}`, payload)
      }
    },
    onSuccess: () => {
      toast.success(
        isEditMode ? "Request updated successfully" : "Request created successfully"
      )
      onSuccess()
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail || "An error occurred. Please try again."
      toast.error(detail)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditMode && !title) {
      toast.error("Title is required")
      return
    }
    saveMutation.mutate()
  }

  // Determine field disable states based on role-based matrix
  const isTitleDescPriorityDisabled = isEditMode && user?.role === "manager"
  const isStatusDisabled = !isEditMode // Status always "new" on create
  const isAssigneeDisabled = !isStaff // Users cannot assign requests

  // Special constraint: cannot edit done request (user) or revert done request (manager)
  const isRequestDone = requestDetails?.status === "done"
  const isFormLockedForUser = isEditMode && user?.role === "user" && isRequestDone
  const isDoneStatusLockedForManager = isEditMode && user?.role === "manager" && isRequestDone

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {isEditMode ? "Edit Request" : "Create Request"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            {isEditMode
              ? "Modify the selected ticket details below"
              : "Describe the issue you are facing to submit a new ticket"}
          </DialogDescription>
        </DialogHeader>

        {isEditMode && isDetailsLoading ? (
          <div className="py-6 text-center text-slate-400 text-xs animate-pulse">
            Loading request details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="dialog-title" className="text-slate-300 text-xs">Title</Label>
              <Input
                id="dialog-title"
                type="text"
                placeholder="Brief summary of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isTitleDescPriorityDisabled || isFormLockedForUser}
                required
                className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 text-xs h-9"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="dialog-desc" className="text-slate-300 text-xs">Description</Label>
              <textarea
                id="dialog-desc"
                placeholder="Provide detailed description of the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isTitleDescPriorityDisabled || isFormLockedForUser}
                rows={3}
                className="flex w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(val) => setPriority(val as any)}
                  disabled={isTitleDescPriorityDisabled || isFormLockedForUser}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100 text-xs h-9">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as any)}
                  disabled={isStatusDisabled || isFormLockedForUser || isDoneStatusLockedForManager}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100 text-xs h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee selection (Staff only) */}
            {isStaff && (
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Assignee</Label>
                <Select
                  value={assigneeId}
                  onValueChange={setAssigneeId}
                  disabled={isAssigneeDisabled || isDoneStatusLockedForManager}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100 text-xs h-9">
                    <SelectValue placeholder="Select Assignee" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignees.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.username} ({a.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800 text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || isFormLockedForUser}
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 text-xs h-9"
              >
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
