import { LockKeyhole, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { Button } from "./Button"

export function ProtectedRoute({ children }) {
  const { isAuthenticated, login } = useAdminAuth()
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

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
          Enter the admin passkey to review orders, update statuses, and manage current capacity.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            const allowed = login(value)
            if (!allowed) {
              setError("Incorrect passkey.")
            }
          }}
        >
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Admin passkey</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                className="field pl-11"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setError("")
                }}
                placeholder="Enter passkey"
              />
            </div>
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button type="submit" className="w-full justify-center">
            Unlock Admin Panel
          </Button>
        </form>
      </div>
    </section>
  )
}
