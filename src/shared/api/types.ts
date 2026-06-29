export type UserRole = "user" | "manager" | "admin"

export interface UserResponse {
  id: number
  username: string
  role: UserRole
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user?: UserResponse
}

export type RequestStatus = "new" | "in_progress" | "done"

export type RequestPriority = "low" | "normal" | "high"

export interface AuthorResponse {
  id: number
  username: string
}

export interface RequestResponse {
  id: number
  title: string
  description: string | null
  status: RequestStatus
  priority: RequestPriority
  author: AuthorResponse
  assignee: AuthorResponse | null
  created_at: string
  updated_at: string
}

export interface RequestListResponse {
  items: RequestResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}
