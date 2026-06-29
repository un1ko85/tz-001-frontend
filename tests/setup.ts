import "@testing-library/jest-dom/vitest"
import { setupServer } from "msw/node"
import { HttpResponse, http } from "msw"
import { beforeAll, afterEach, afterAll, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// Simple mock for window.matchMedia if needed by shadcn
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", async () => {
    return HttpResponse.json({
      access_token: "mocked-token",
      token_type: "bearer",
      user: { id: 1, username: "testuser", role: "user" },
    })
  }),
  http.post("/api/auth/register", async () => {
    return HttpResponse.json({ id: 2, username: "newuser", role: "user" }, { status: 201 })
  }),
  http.post("/api/auth/logout", async () => {
    return HttpResponse.json({ detail: "Logged out" })
  }),
  http.post("/api/auth/refresh", async () => {
    return HttpResponse.json({ access_token: "refreshed-token", token_type: "bearer" })
  }),
  http.get("/api/users/me", async () => {
    return HttpResponse.json({ id: 1, username: "testuser", role: "user" })
  }),

  // Requests endpoints
  http.get("/api/requests", async () => {
    return HttpResponse.json({
      items: [
        {
          id: 1,
          title: "Mock Request",
          description: "Mock Description",
          status: "new",
          priority: "normal",
          author: { id: 1, username: "testuser" },
          created_at: "2026-06-29T00:00:00Z",
          updated_at: "2026-06-29T00:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      per_page: 10,
      pages: 1,
    })
  }),
]

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
