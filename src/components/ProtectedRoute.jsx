import { ShieldCheck } from "lucide-react"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { GoogleLoginButton } from "./GoogleLoginButton"
import { SkeletonCard } from "./SkeletonCard"

export function ProtectedRoute({ children }) {
  const { adminEmail, authError, isAuthenticated, isLoading, loginWithGoogle, user } = useAdminAuth()

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
          Only the approved Libra operator account can open this dashboard. Continue with Google using the exact admin email.
        </p>
        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Approved operator</p>
          <p className="mt-2 text-lg font-semibold text-white">{adminEmail}</p>
        </div>
        <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0a1020] p-6">
          <GoogleLoginButton
            text="continue_with"
            width={360}
            onCredential={async (credential) => {
              const nextUser = await loginWithGoogle(credential)
              if (`${nextUser.role || ""}`.trim().toLowerCase() !== "admin") {
                throw new Error(`Sign in with ${adminEmail} to access the admin dashboard.`)
              }
            }}
          />
          {user && !isAuthenticated ? (
            <p className="mt-4 text-sm text-rose-300">Signed in as {user.email}, but that account is not the approved admin.</p>
          ) : null}
          {authError ? <p className="mt-4 text-sm text-rose-300">{authError}</p> : null}
        </div>
      </div>
    </section>
  )
}
