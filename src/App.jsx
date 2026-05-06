import { AnimatePresence, motion } from "framer-motion"
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom"
import { Camera, ShieldCheck, Sparkles } from "lucide-react"
import { HomePage } from "./pages/HomePage"
import { ServicesPage } from "./pages/ServicesPage"
import { OrderPage } from "./pages/OrderPage"
import { TrackOrderPage } from "./pages/TrackOrderPage"
import { AboutPage } from "./pages/AboutPage"
import { AdminPage } from "./pages/AdminPage"
import { ProtectedRoute } from "./components/ProtectedRoute"

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/order", label: "Order" },
  { to: "/track", label: "Track" },
  { to: "/about", label: "Trust" },
  { to: "/admin", label: "Admin" },
]

function AppShell({ children }) {
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_40px_rgba(4,8,25,0.55)]">
              <Camera className="h-5 w-5 text-fuchsia-200" />
            </div>
            <div>
              <p className="font-display text-lg tracking-[0.25em] text-white">VELORA</p>
              <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">Instagram Growth Lab</p>
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
          </nav>
          <NavLink
            to="/order"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(255,255,255,0.18)]"
          >
            <Sparkles className="h-4 w-4" />
            Start Order
          </NavLink>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-zinc-400 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-3">
            <p className="font-display text-xl text-white">Growth designed like a luxury product.</p>
            <p className="max-w-2xl leading-7">
              Velora combines premium presentation, structured delivery, and manual payment verification for a frictionless Instagram growth ordering experience.
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
