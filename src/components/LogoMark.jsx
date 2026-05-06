export function LogoMark({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_30%_20%,rgba(244,114,182,0.34),transparent_36%),radial-gradient(circle_at_70%_75%,rgba(34,211,238,0.3),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] blur-[2px]" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(155deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] shadow-[0_18px_50px_rgba(7,10,24,0.45)]">
        <div className="absolute left-1/2 top-[18%] h-[18%] w-[68%] -translate-x-1/2 rounded-full bg-white/75 blur-[1px]" />
        <div className="absolute left-1/2 top-[32%] h-[5%] w-[56%] -translate-x-1/2 rounded-full bg-white/90" />
        <div className="absolute left-[28%] top-[29%] h-[32%] w-[6%] rounded-full bg-white/90" />
        <div className="absolute right-[28%] top-[29%] h-[32%] w-[6%] rounded-full bg-white/90" />
        <div className="absolute left-[22%] top-[48%] h-[18%] w-[18%] rotate-[18deg] rounded-b-[999px] rounded-t-[38%] border-x border-b border-white/80" />
        <div className="absolute right-[22%] top-[48%] h-[18%] w-[18%] -rotate-[18deg] rounded-b-[999px] rounded-t-[38%] border-x border-b border-white/80" />
        <div className="absolute bottom-[18%] left-1/2 h-[8%] w-[46%] -translate-x-1/2 rounded-full bg-white/85" />
      </div>
    </div>
  )
}
