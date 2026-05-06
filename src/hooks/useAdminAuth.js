import { useAuthSession } from "./useAuthSession"

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "sandeepdatta866@gmail.com"

export function useAdminAuth() {
  const session = useAuthSession()

  return {
    ...session,
    adminEmail,
    isAuthenticated: Boolean(session.user && session.user.role === "admin" && session.user.email === adminEmail),
  }
}
