import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { formatCurrency } from "../lib/utils"
import { Button } from "./Button"

export function PlanCard({ plan, onSelect }) {
  return (
    <motion.article
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "glass-panel surface-ring relative overflow-hidden rounded-[32px] p-6",
        plan.highlight ? "border-fuchsia-300/40 bg-fuchsia-300/[0.08]" : "",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{plan.category}</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{plan.title}</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{plan.description}</p>
        </div>
        {plan.highlight ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-100">
            <Sparkles className="h-3.5 w-3.5" />
            Popular
          </span>
        ) : null}
      </div>
      <div className="mt-6 flex items-end justify-between gap-4 border-y border-white/8 py-5">
        <div>
          <p className="text-sm text-zinc-500">Quantity</p>
          <p className="mt-1 text-lg font-medium text-white">{plan.quantity}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">Price</p>
          <p className="mt-1 text-3xl font-semibold text-white">{formatCurrency(plan.price)}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {plan.features.map((feature) => (
          <span key={feature} className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-zinc-300">
            {feature}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">Estimated delivery: {plan.eta}</p>
        <Button onClick={() => onSelect(plan)} className="gap-2">
          Select Plan
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  )
}
