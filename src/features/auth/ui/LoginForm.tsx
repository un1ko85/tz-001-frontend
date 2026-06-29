import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuthStore } from "@/features/auth/model/store"
import { apiClient } from "@/shared/api/client"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

export function LoginForm() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setUser = useAuthStore((state) => state.setUser)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)

    try {
      const response = await apiClient.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      const { access_token, user } = response.data
      setAccessToken(access_token)
      if (user) {
        setUser(user)
      }
      toast.success("Successfully logged in!")
      navigate("/dashboard")
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Invalid username or password"
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100 shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          Enter your credentials to sign in
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-xs text-center text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
