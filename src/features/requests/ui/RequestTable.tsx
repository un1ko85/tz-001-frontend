import { Edit, User } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Skeleton } from "@/shared/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import type { RequestResponse } from "@/shared/api/types"

interface RequestTableProps {
  data: RequestResponse[]
  isLoading: boolean
  onEdit: (id: number) => void
  total: number
  page: number
  pages: number
  onPageChange: (page: number) => void
}

export function RequestTable({
  data,
  isLoading,
  onEdit,
  total,
  page,
  pages,
  onPageChange,
}: RequestTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">New</Badge>
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">In Progress</Badge>
      case "done":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Done</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="border-slate-800 text-slate-400">Low</Badge>
      case "normal":
        return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Normal</Badge>
      case "high":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">High</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-full bg-slate-900" />
        <Skeleton className="h-12 w-full bg-slate-900" />
        <Skeleton className="h-12 w-full bg-slate-900" />
        <Skeleton className="h-12 w-full bg-slate-900" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-2">
        <p className="font-semibold text-lg">No requests found</p>
        <p className="text-sm">Try adjusting your filters or create a new request.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Table className="border-collapse">
        <TableHeader className="border-slate-800">
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400 font-medium">Title</TableHead>
            <TableHead className="text-slate-400 font-medium">Status</TableHead>
            <TableHead className="text-slate-400 font-medium">Priority</TableHead>
            <TableHead className="text-slate-400 font-medium">Author</TableHead>
            <TableHead className="text-slate-400 font-medium">Assignee</TableHead>
            <TableHead className="text-slate-400 font-medium">Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((request) => (
            <TableRow key={request.id} className="border-slate-800 hover:bg-slate-900/30">
              <TableCell className="font-medium text-slate-200">
                <div className="flex flex-col">
                  <span>{request.title}</span>
                  {request.description && (
                    <span className="text-xs text-slate-400 line-clamp-1 max-w-md mt-0.5">
                      {request.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>{getPriorityBadge(request.priority)}</TableCell>
              <TableCell className="text-slate-300 text-sm">
                <div className="flex items-center space-x-1.5">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>{request.author.username}</span>
                </div>
              </TableCell>
              <TableCell className="text-slate-300 text-sm">
                {request.assignee ? (
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-blue-500/80" />
                    <span>{request.assignee.username}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs italic">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-slate-400 text-sm">
                {formatDate(request.created_at)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(request.id)}
                  className="hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-900/10">
          <span className="text-xs text-slate-400">
            Showing page {page} of {pages} ({total} total items)
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-slate-300"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
              className="border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
