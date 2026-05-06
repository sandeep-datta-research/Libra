import { LogOut, ShieldCheck, ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/Button"
import { GoogleLoginButton } from "../components/GoogleLoginButton"
import { SectionHeading } from "../components/SectionHeading"
import { SkeletonCard } from "../components/SkeletonCard"
import { StatusPill } from "../components/StatusPill"
import { useAuthSession } from "../hooks/useAuthSession"
import { listPortalOrders } from "../lib/orders"
import { formatCurrency, formatDate } from "../lib/utils"

export function PortalPage() {
  const { authError, isAuthenticated, isLoading, loginWithGoogle, logout, user } = useAuthSession()

  return (
    <section className="page-shell">
      <SectionHeading
        eyebrow="User Portal"
        title="One Google sign-in for order visibility."
        copy="Customers can continue ordering without creating a full account, but a Google login makes it easier to attach orders to their email and review every status from one place."
      />

      {!isAuthenticated ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[36px] border border-white/10 bg-radial-premium p-8">
            <p className="section-kicker">Portal Access</p>
            <h2 className="mt-4 font-display text-5xl text-white">Sign in with Google</h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-zinc-400">
              Use your Google account to save your name and email into new orders automatically, then view every order from the same portal later.
            </p>
            <div className="mt-8">
              {isLoading ? (
                <SkeletonCard className="h-14" />
              ) : (
                <GoogleLoginButton text="continue_with" width={360} onCredential={loginWithGoogle} />
              )}
            </div>
            {authError ? <p className="mt-4 text-sm text-rose-300">{authError}</p> : null}
          </div>

          <div className="glass-panel rounded-[36px] p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <ShoppingBag className="h-5 w-5 text-fuchsia-200" />
                <p className="mt-4 text-lg font-semibold text-white">Auto-filled checkout</p>
                <p className="mt-2 text-sm leading-7 text-zinc-400">Your name and email move directly into the order flow the next time you choose a package.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="h-5 w-5 text-cyan-200" />
                <p className="mt-4 text-lg font-semibold text-white">Cleaner support path</p>
                <p className="mt-2 text-sm leading-7 text-zinc-400">Every portal order is grouped under one identity, making manual verification and updates easier to manage.</p>
              </div>
            </div>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-[#091021] p-5">
              <p className="text-sm text-zinc-400">No account still works.</p>
              <p className="mt-2 text-base leading-7 text-zinc-300">
                You can still place an order directly from the order page without signing in. Google login just gives you a cleaner portal and automatic identity capture.
              </p>
              <Link to="/order?plan=growth-boost" className="mt-5 inline-flex">
                <Button>Go to order page</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <PortalOrdersPanel logout={logout} user={user} />
      )}
    </section>
  )
}

function PortalOrdersPanel({ logout, user }) {
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    listPortalOrders()
      .then((rows) => {
        if (!active) return
        setOrders(rows)
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message || "Failed to load portal orders.")
      })
      .finally(() => {
        if (active) {
          setOrdersLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-4">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-xl font-semibold text-white">
                  {user?.name?.slice(0, 1) || "L"}
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-500">Signed in as</p>
                <p className="mt-1 text-xl font-semibold text-white">{user?.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/order?plan=growth-boost">
                <Button>Place new order</Button>
              </Link>
              <Button variant="secondary" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Your Orders</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{orders.length} portal-linked orders</h3>
              </div>
              <p className="text-sm text-zinc-400">Track statuses without using individual Order IDs every time.</p>
            </div>

            {error ? <p className="mt-5 text-sm text-rose-300">{error}</p> : null}

            <div className="mt-6 grid gap-4">
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} className="h-28" />)
              ) : orders.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-[#091021] p-6 text-sm text-zinc-400">
                  No orders are linked to this email yet. Place your next order while signed in so it shows up here automatically.
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-[28px] border border-white/10 bg-[#091021] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{order.id}</p>
                        <h4 className="mt-2 text-xl font-semibold text-white">{order.service}</h4>
                        <p className="mt-2 text-sm text-zinc-400">@{order.username}</p>
                      </div>
                      <StatusPill status={order.status} />
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Amount</p>
                        <p className="mt-2 text-base font-medium text-white">{formatCurrency(order.amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Created</p>
                        <p className="mt-2 text-base font-medium text-white">{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Transaction</p>
                        <p className="mt-2 text-base font-medium text-white">{order.transaction_id || "Awaiting proof"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
    </div>
  )
}
