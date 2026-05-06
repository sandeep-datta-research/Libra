import { motion } from "framer-motion"
import { cn } from "../lib/utils"

const variants = {
  primary:
    "bg-white text-slate-950 shadow-[0_18px_40px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(255,255,255,0.18)]",
  secondary:
    "border border-white/12 bg-white/6 text-white hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_24px_48px_rgba(0,0,0,0.22)]",
  ghost: "text-zinc-300 hover:bg-white/8 hover:text-white",
}

export function Button({ className, children, variant = "primary", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-fuchsia-300/20 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
