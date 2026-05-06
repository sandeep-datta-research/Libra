import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react"
import { apiRequest, getStoredAuthToken, setStoredAuthToken } from "../lib/api"

const AuthSessionContext = createContext(null)

export function AuthProvider({ children }) {
  const hasStoredToken = Boolean(getStoredAuthToken())
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(hasStoredToken)
  const [authError, setAuthError] = useState("")

  useEffect(() => {
    if (!hasStoredToken) return undefined

    let active = true

    async function loadMe() {
      try {
        const payload = await apiRequest("/api/auth/me", { auth: true })
        if (!active) return
        setUser(payload.user)
      } catch (error) {
        if (!active) return
        setStoredAuthToken("")
        setUser(null)
        setAuthError(error.message || "Session expired.")
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
  }, [hasStoredToken])

  async function loginWithGoogle(credential) {
    const payload = await apiRequest("/api/auth/google", {
      method: "POST",
      body: { credential },
    })

    setStoredAuthToken(payload.token)
    setUser(payload.user)
    setAuthError("")
    return payload.user
  }

  function logout() {
    setStoredAuthToken("")
    setUser(null)
    setAuthError("")
  }

  const value = useMemo(
    () => ({
      authError,
      isAuthenticated: Boolean(user),
      isLoading,
      loginWithGoogle,
      logout,
      setAuthError,
      user,
    }),
    [authError, isLoading, user],
  )

  return createElement(AuthSessionContext.Provider, { value }, children)
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext)
  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider.")
  }
  return context
}
