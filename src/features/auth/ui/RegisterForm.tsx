import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { apiClient } from "@/shared/api/client"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

export function RegisterForm() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      await apiClient.post("/auth/register", {
        username,
        password,
      })
      toast.success("Successfully registered! You can now log in.")
      navigate("/login")
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Registration failed. Try again."
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100 shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Create an account
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          Enter details to register a new account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="border-slate-800 bg-slate-950/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
          <p className="text-xs text-center text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
