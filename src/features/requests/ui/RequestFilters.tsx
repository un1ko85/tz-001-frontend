import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import type { RequestPriority, RequestStatus } from "@/shared/api/types"

interface RequestFiltersProps {
  search: string
  onSearchChange: (val: string) => void
  statusFilter: RequestStatus | "all"
  onStatusChange: (val: RequestStatus | "all") => void
  priorityFilter: RequestPriority | "all"
  onPriorityChange: (val: RequestPriority | "all") => void
  sortBy: "created_at" | "priority"
  onSortByChange: (val: "created_at" | "priority") => void
  sortOrder: "asc" | "desc"
  onSortOrderChange: (val: "asc" | "desc") => void
}

export function RequestFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: RequestFiltersProps) {
  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-slate-300 text-xs">Search Text</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500 text-xs h-9"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100 text-xs h-9">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">Priority</Label>
        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100 text-xs h-9">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">Sort By</Label>
        <Select value={sortBy} onValueChange={(val) => onSortByChange(val as any)}>
          <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100 text-xs h-9">
            <SelectValue placeholder="Sort field" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">Sort Order</Label>
        <Select value={sortOrder} onValueChange={(val) => onSortOrderChange(val as any)}>
          <SelectTrigger className="border-slate-800 bg-slate-950/40 text-slate-100 text-xs h-9">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
