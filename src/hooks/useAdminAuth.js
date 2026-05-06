import { useEffect, useState } from "react"
import { apiRequest, getStoredAdminToken, setStoredAdminToken } from "../lib/api"

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "sandeepdatta866@gmail.com"

export function useAdminAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredAdminToken()))
  const [authError, setAuthError] = useState("")

  useEffect(() => {
    if (!getStoredAdminToken()) return undefined

    let active = true

    async function loadMe() {
      try {
        const payload = await apiRequest("/api/admin/me", { admin: true })
        if (!active) return
        setUser(payload.user)
      } catch (error) {
        if (!active) return
        setStoredAdminToken("")
        setUser(null)
        setAuthError(error.message || "Admin session expired.")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadMe()

    return () => {
      active = false
    }
  }, [])

  async function login(email, password) {
    const payload = await apiRequest("/api/admin/login", {
      method: "POST",
      body: { email, password },
    })

    setStoredAdminToken(payload.token)
    setUser(payload.user)
    setAuthError("")
    return payload.user
  }

  function logout() {
    setStoredAdminToken("")
    setUser(null)
  }

  return {
    adminEmail,
    authError,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    user,
  }
}
