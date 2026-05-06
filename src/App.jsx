import { AnimatePresence, motion } from "framer-motion"
import { LogOut, Menu, ShieldCheck, Sparkles, UserCircle2, X } from "lucide-react"
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom"
import { useState } from "react"
import { HomePage } from "./pages/HomePage"
import { ServicesPage } from "./pages/ServicesPage"
import { OrderPage } from "./pages/OrderPage"
import { TrackOrderPage } from "./pages/TrackOrderPage"
import { AboutPage } from "./pages/AboutPage"
import { AdminPage } from "./pages/AdminPage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { LogoMark } from "./components/LogoMark"
import { PortalPage } from "./pages/PortalPage"
import { useAdminAuth } from "./hooks/useAdminAuth"
import { useAuthSession } from "./hooks/useAuthSession"

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/order", label: "Order" },
  { to: "/track", label: "Track" },
  { to: "/portal", label: "Portal" },
  { to: "/about", label: "Trust" },
]

function AppShell({ children }) {
  const { logout, user } = useAuthSession()
  const { isAuthenticated: isAdmin } = useAdminAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const portalItem = user
    ? {
        to: isAdmin ? "/admin" : "/portal",
        label: isAdmin ? "Admin Dashboard" : "Your Portal",
      }
    : null

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.18),transparent_25%),radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.2),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(45,212,191,0.1),transparent_22%),#050816] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute -left-16 top-64 h-72 w-72 rounded-full bg-cyan-400/10 blur-[130px]" />
        <div className="absolute -right-16 top-96 h-80 w-80 rounded-full bg-violet-500/10 blur-[140px]" />
      </div>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060816]/70 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <LogoMark className="h-11 w-11" />
            <div>
              <p className="font-display text-lg tracking-[0.25em] text-white">LIBRA</p>
              <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">Scale-led Growth House</p>
            </div>
          </NavLink>
          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-white text-slate-950 shadow-[0_16px_30px_rgba(255,255,255,0.14)]"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-emerald-300 text-slate-950 shadow-[0_16px_30px_rgba(16,185,129,0.18)]"
                      : "text-emerald-100 hover:bg-emerald-300/15 hover:text-white",
                  ].join(" ")
                }
              >
                Admin
              </NavLink>
            ) : null}
          </nav>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="hidden items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 lg:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Signed In
              </div>
            ) : null}
            {user ? (
              <NavLink
                to={isAdmin ? "/admin" : "/portal"}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm text-white md:inline-flex"
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <UserCircle2 className="h-4 w-4" />
                )}
                {isAdmin ? "Admin" : "Portal"}
              </NavLink>
            ) : null}
            <NavLink
              to="/order?plan=growth-boost"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(255,255,255,0.18)] sm:inline-flex"
            >
              <Sparkles className="h-4 w-4" />
              Start Growth
            </NavLink>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:bg-white/10 md:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-white/10 bg-[#070b18]/96 px-4 py-4 backdrop-blur-2xl md:hidden"
            >
              {user ? (
                <div className="mb-4 flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="h-11 w-11 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                      <UserCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.name || user.email}</p>
                    <p className="truncate text-xs uppercase tracking-[0.22em] text-zinc-500">
                      {isAdmin ? "Admin Access" : "Customer Portal"}
                    </p>
                  </div>
                  {isAdmin ? (
                    <span className="ml-auto rounded-full border border-emerald-200/15 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                      Admin
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-2">
                {navItems
                  .filter((item) => item.to !== "/portal")
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        [
                          "rounded-[20px] border px-4 py-3 text-sm font-medium transition",
                          isActive
                            ? "border-white bg-white text-slate-950"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10",
                        ].join(" ")
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}

                <NavLink
                  to="/order?plan=growth-boost"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-[20px] border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                >
                  Start Growth
                </NavLink>

                {portalItem ? (
                  <NavLink
                    to={portalItem.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "rounded-[20px] border px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "border-fuchsia-200/20 bg-fuchsia-200/12 text-white"
                          : "border-fuchsia-200/15 bg-fuchsia-200/8 text-fuchsia-100 hover:bg-fuchsia-200/12",
                      ].join(" ")
                    }
                  >
                    {portalItem.label}
                  </NavLink>
                ) : null}

                {isAdmin ? (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "rounded-[20px] border px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "border-emerald-200/20 bg-emerald-300/12 text-white"
                          : "border-emerald-200/15 bg-emerald-300/8 text-emerald-100 hover:bg-emerald-300/12",
                      ].join(" ")
                    }
                  >
                    Admin Access
                  </NavLink>
                ) : null}

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-zinc-400 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-3">
            <p className="font-display text-xl text-white">Libra, designed like a luxury product.</p>
            <p className="max-w-2xl leading-7">
              Libra combines premium presentation, faster payment handoff, and manual verification for an Instagram growth ordering experience that feels deliberate and high-trust.
            </p>
          </div>
          <div className="flex items-start justify-start gap-3 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:justify-end">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
            <div>
              <p className="font-medium text-white">Secure review flow</p>
              <p className="mt-1 leading-6 text-zinc-400">
                Manual verification, proof uploads, status tracking, and a protected admin route are built in.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
    </BrowserRouter>
  )
}
