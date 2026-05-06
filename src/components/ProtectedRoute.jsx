import { LockKeyhole, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { Button } from "./Button"
import { SkeletonCard } from "./SkeletonCard"

export function ProtectedRoute({ children }) {
  const { adminEmail, authError, isAuthenticated, isLoading, login } = useAdminAuth()
  const [email, setEmail] = useState(adminEmail)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return (
      <section className="page-shell">
        <div className="mx-auto max-w-xl">
          <SkeletonCard className="h-[420px]" />
        </div>
      </section>
    )
  }

  if (isAuthenticated) {
    return children
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-xl rounded-[36px] border border-white/10 bg-radial-premium p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/8">
          <ShieldCheck className="h-7 w-7 text-emerald-300" />
        </div>
        <p className="section-kicker mt-6 text-center">Protected Route</p>
        <h1 className="mt-4 text-center font-display text-5xl text-white">Admin access</h1>
        <p className="mx-auto mt-4 max-w-md text-center leading-7 text-zinc-400">
          Admin access is restricted to the approved Libra operator email and backend credentials.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            setError("")
            setIsSubmitting(true)
            try {
              await login(email, password)
            } catch (submissionError) {
              setError(submissionError.message || "Login failed.")
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Admin email</span>
            <input
              type="email"
              className="field"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError("")
              }}
              placeholder={adminEmail}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Admin password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                className="field pl-11"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError("")
                }}
                placeholder="Enter admin password"
              />
            </div>
          </label>
          {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
            {isSubmitting ? "Signing in..." : "Unlock Admin Panel"}
          </Button>
        </form>
      </div>
    </section>
  )
}
