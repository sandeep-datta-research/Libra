import { Eye, Lock, ShieldCheck, Zap } from "lucide-react"
import { SectionHeading } from "../components/SectionHeading"

const trustPillars = [
  {
    title: "Manual verification",
    copy: "Every submitted transaction ID and screenshot can be reviewed in the admin panel before fulfillment begins.",
    icon: Eye,
  },
  {
    title: "Protected operator access",
    copy: "The admin surface is shielded behind a passkey gate for basic route-level access control.",
    icon: Lock,
  },
  {
    title: "Clean proof handling",
    copy: "File validation restricts uploads to common image formats with size checks before storage.",
    icon: ShieldCheck,
  },
  {
    title: "Fast operational updates",
    copy: "Pending, Verified, In Progress, Completed, and Rejected states keep the workflow transparent end to end.",
    icon: Zap,
  },
]

export function AboutPage() {
  return (
    <section className="page-shell">
      <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
        <div>
          <SectionHeading
            eyebrow="About Libra"
            title="Trust is part of the product."
            copy="This experience was designed for operators who need a premium storefront while still working with manual payments and fulfillment review."
          />
        </div>
        <div className="glass-panel rounded-[36px] p-7">
          <p className="section-kicker">Positioning</p>
          <p className="mt-4 text-lg leading-8 text-zinc-300">
            Libra frames an Instagram growth offer with the same polish you would expect from a premium SaaS product: cinematic visual language, minimal friction, structured proof collection, and transparent order tracking.
          </p>
          <p className="mt-4 text-lg leading-8 text-zinc-300">
            The result is a storefront that feels deliberate rather than improvised, with enough backend structure to operate day to day.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {trustPillars.map((pillar) => {
          const Icon = pillar.icon
          return (
            <div key={pillar.title} className="glass-panel rounded-[30px] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                <Icon className="h-5 w-5 text-fuchsia-200" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{pillar.copy}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
