import { motion } from "framer-motion"
import { Check } from "lucide-react"

export function OrderSuccessAnimation() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl" />
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-300/10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 180, damping: 12 }}
        >
          <Check className="h-9 w-9 text-emerald-200" />
        </motion.div>
      </motion.div>
    </div>
  )
}
