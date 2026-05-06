import { cn } from "../lib/utils"

const styles = {
  Pending: "bg-amber-300/12 text-amber-200 border-amber-200/15",
  Verified: "bg-sky-300/12 text-sky-200 border-sky-200/15",
  "In Progress": "bg-violet-300/12 text-violet-200 border-violet-200/15",
  Completed: "bg-emerald-300/12 text-emerald-200 border-emerald-200/15",
  Rejected: "bg-rose-300/12 text-rose-200 border-rose-200/15",
}

export function StatusPill({ status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
        styles[status] || "bg-white/8 text-white border-white/10",
      )}
    >
      {status}
    </span>
  )
}
