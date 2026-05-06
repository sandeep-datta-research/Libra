import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const storageBucket = import.meta.env.VITE_SUPABASE_BUCKET || "payment-screenshots"
export const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "sandeepdatta866@gmail.com"
export const siteUrl =
  import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173")

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
