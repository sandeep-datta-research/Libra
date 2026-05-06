import { Mail, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { Button } from "./Button"
import { SkeletonCard } from "./SkeletonCard"

export function ProtectedRoute({ children }) {
  const { adminEmail, authError, isAuthenticated, isLoading, isSupabaseConfigured, sendMagicLink } = useAdminAuth()
  const [email, setEmail] = useState(adminEmail)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSending, setIsSending] = useState(false)

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
          Admin login now uses Supabase email authentication and only accepts the approved Libra admin address.
        </p>
        {!isSupabaseConfigured ? (
          <div className="mt-8 rounded-[28px] border border-amber-200/15 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100/90">
            Configure Supabase first. Admin email auth cannot work until `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
          </div>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setError("")
              setSuccess("")
              setIsSending(true)
              try {
                await sendMagicLink(email)
                setSuccess(`Magic link sent to ${adminEmail}. Open the email and come back to /admin.`)
              } catch (submissionError) {
                setError(submissionError.message || "Failed to send login link.")
              } finally {
                setIsSending(false)
              }
            }}
          >
            <label className="space-y-2">
              <span className="text-sm text-zinc-400">Approved admin email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  className="field pl-11"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError("")
                    setSuccess("")
                  }}
                  placeholder={adminEmail}
                />
              </div>
            </label>
            {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
            <Button type="submit" disabled={isSending} className="w-full justify-center">
              {isSending ? "Sending magic link..." : "Email Admin Login Link"}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
