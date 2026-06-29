import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { LoginForm } from "../src/features/auth/ui/LoginForm"
import { RegisterForm } from "../src/features/auth/ui/RegisterForm"

const queryClient = new QueryClient()

describe("Auth Flow", () => {
  it("renders login form correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText("Welcome back")).toBeInTheDocument()
    expect(screen.getByLabelText("Username")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("shows error if fields are empty on login", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginForm />
          <Toaster />
        </MemoryRouter>
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields")).toBeInTheDocument()
    })
  })

  it("submits login form with credentials", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginForm />
          <Toaster />
        </MemoryRouter>
      </QueryClientProvider>
    )

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText("Successfully logged in!")).toBeInTheDocument()
    })
  })

  it("renders register form correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegisterForm />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText("Create an account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument()
  })
})
