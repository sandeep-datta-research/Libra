import { motion } from "framer-motion"
import { ArrowRight, BadgeCheck, Clock3, LineChart, ShieldCheck, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { testimonials, trustStats } from "../data/services"
import { Button } from "../components/Button"
import { SectionHeading } from "../components/SectionHeading"

const benefits = [
  {
    title: "High-trust checkout flow",
    copy: "Plan selection, instant order ID generation, UPI handoff, and payment-proof upload are stitched into one premium journey.",
    icon: ShieldCheck,
  },
  {
    title: "Operations visibility",
    copy: "Customers can track status in real time while admins verify proof, update stages, and keep delivery capacity in range.",
    icon: Clock3,
  },
  {
    title: "Built for conversion",
    copy: "Cinematic gradients, motion cards, and clear package framing help the service feel structured rather than sketchy.",
    icon: LineChart,
  },
]

export function HomePage() {
  return (
    <>
      <section className="page-shell pt-14 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-kicker"
            >
              Cinematic growth commerce
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-5 max-w-4xl font-display text-6xl leading-none text-white sm:text-7xl lg:text-[5.6rem]"
            >
              Premium Instagram growth,
              <span className="text-gradient"> sold like elite software.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400"
            >
              Velora is a high-end growth storefront with modern package discovery, order creation, payment proof collection, order tracking, and a protected admin command layer.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link to="/order">
                <Button className="gap-2">
                  Launch an Order
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="secondary">Explore Packages</Button>
              </Link>
            </motion.div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 + index * 0.06 }}
                  className="glass-panel rounded-[28px] p-5"
                >
                  <p className="text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-zinc-400">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.16 }}
            className="glass-panel surface-ring relative overflow-hidden rounded-[36px] p-7"
          >
            <div className="premium-grid absolute inset-0" />
            <div className="relative rounded-[28px] border border-white/10 bg-[#090f23]/80 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Live conversion flow</p>
                  <h2 className="mt-4 text-3xl font-semibold text-white">One clean order path</h2>
                </div>
                <span className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  Ready
                </span>
              </div>
              <div className="mt-7 space-y-4">
                {[
                  "Choose package and auto-fill order form",
                  "Receive unique order ID instantly",
                  "Complete UPI payment and upload screenshot",
                  "Track verification and completion from a status page",
                ].map((step) => (
                  <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <BadgeCheck className="h-5 w-5 text-fuchsia-200" />
                    <p className="text-sm text-zinc-200">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Featured package</p>
                    <p className="mt-2 text-xl font-semibold text-white">Growth Boost</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Total</p>
                    <p className="mt-2 text-2xl font-semibold text-white">₹120</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="page-shell">
        <SectionHeading
          eyebrow="Why It Converts"
          title="Designed to reduce hesitation."
          copy="The product experience leads with trust signals, premium visual framing, and a clearly sequenced delivery workflow."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08 }}
                className="glass-panel rounded-[32px] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                  <Icon className="h-5 w-5 text-fuchsia-200" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">{benefit.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{benefit.copy}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="page-shell">
        <div className="glass-panel rounded-[36px] p-8 sm:p-10">
          <SectionHeading
            eyebrow="Social Proof"
            title="Calm, premium, conversion-first."
            copy="Every page is optimized to feel more like a modern SaaS product than a commodity panel."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.quote} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <Sparkles className="h-5 w-5 text-fuchsia-200" />
                <p className="mt-4 text-base leading-8 text-zinc-200">“{item.quote}”</p>
                <p className="mt-6 text-sm uppercase tracking-[0.24em] text-zinc-500">{item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
