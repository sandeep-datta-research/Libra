import { useState } from "react"

const STORAGE_KEY = "velora-admin-auth"
const adminPasskey = import.meta.env.VITE_ADMIN_PASSKEY || "change-me-admin"

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(STORAGE_KEY) === "true"
  })

  function login(passkey) {
    const allowed = passkey === adminPasskey
    if (allowed && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true")
      setIsAuthenticated(true)
    }
    return allowed
  }

  function logout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setIsAuthenticated(false)
  }

  return { isAuthenticated, login, logout }
}
