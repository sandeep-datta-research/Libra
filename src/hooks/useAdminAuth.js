import { useAuthSession } from "./useAuthSession"

const adminEmail = `${import.meta.env.VITE_ADMIN_EMAIL || "sandeepdatta866@gmail.com"}`.trim().toLowerCase()

export function useAdminAuth() {
  const session = useAuthSession()
  const sessionEmail = `${session.user?.email || ""}`.trim().toLowerCase()
  const isAdminRole = `${session.user?.role || ""}`.trim().toLowerCase() === "admin"

  return {
    ...session,
    adminEmail,
    isAuthenticated: Boolean(session.user && isAdminRole && sessionEmail === adminEmail),
  }
}
