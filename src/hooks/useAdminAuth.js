import { useEffect, useState } from "react"
import { adminEmail, isSupabaseConfigured, siteUrl, supabase } from "../lib/supabase"

function normalizeEmail(value) {
  return value?.trim().toLowerCase() || ""
}

export function useAdminAuth() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState("")

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

    let active = true

    async function bootstrapSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!active) return

      if (error) {
        setAuthError(error.message)
        setIsLoading(false)
        return
      }

      const nextSession = data.session
      const currentEmail = normalizeEmail(nextSession?.user?.email)

      if (nextSession && currentEmail !== normalizeEmail(adminEmail)) {
        await supabase.auth.signOut()
        if (!active) return
        setSession(null)
        setAuthError(`Only ${adminEmail} can access the admin panel.`)
      } else {
        setSession(nextSession)
      }

      setIsLoading(false)
    }

    void bootstrapSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const currentEmail = normalizeEmail(nextSession?.user?.email)

      if (nextSession && currentEmail !== normalizeEmail(adminEmail)) {
        await supabase.auth.signOut()
        if (!active) return
        setSession(null)
        setAuthError(`Only ${adminEmail} can access the admin panel.`)
        return
      }

      if (!active) return
      setSession(nextSession)
      setAuthError("")
      setIsLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function sendMagicLink(email) {
    const normalizedEmail = normalizeEmail(email)

    if (normalizedEmail !== normalizeEmail(adminEmail)) {
      throw new Error(`Use the approved admin email: ${adminEmail}`)
    }

    if (!supabase) {
      throw new Error("Supabase is not configured yet.")
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${siteUrl.replace(/\/$/, "")}/admin`,
      },
    })

    if (error) throw error
    return true
  }

  async function logout() {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }

  return {
    adminEmail,
    authError,
    isAuthenticated: normalizeEmail(session?.user?.email) === normalizeEmail(adminEmail),
    isLoading,
    isSupabaseConfigured,
    logout,
    sendMagicLink,
    user: session?.user ?? null,
  }
}
