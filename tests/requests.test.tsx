import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Dashboard } from "../src/pages/dashboard/Dashboard"
import { useAuthStore } from "../src/features/auth/model/store"

const queryClient = new QueryClient()

describe("Requests & Dashboard Flow", () => {
  it("renders dashboard and fetches requests", async () => {
    // Mock user in the store
    useAuthStore.setState({
      user: { id: 1, username: "testuser", role: "user" },
      accessToken: "mocked-token",
      isInitialized: true,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Header check
    expect(screen.getByText("Helpdesk Tracker")).toBeInTheDocument()

    // Filter labels
    expect(screen.getByLabelText("Search Text")).toBeInTheDocument()

    // Wait for MSW to mock the requests endpoint and display in table
    await waitFor(() => {
      expect(screen.getByText("Mock Request")).toBeInTheDocument()
    })
    
    expect(screen.getByText("Mock Description")).toBeInTheDocument()
  })
})
