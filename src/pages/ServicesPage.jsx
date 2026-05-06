import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlanCard } from "../components/PlanCard"
import { SectionHeading } from "../components/SectionHeading"
import { SkeletonCard } from "../components/SkeletonCard"
import { getCapacity } from "../lib/orders"
import { listProducts } from "../lib/products"

export function ServicesPage() {
  const navigate = useNavigate()
  const [capacity, setCapacity] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    getCapacity().then(setCapacity).catch(() => setCapacity(24))
    listProducts()
      .then((rows) => setProducts(rows))
      .catch(() => setProducts([]))
      .finally(() => setIsLoadingProducts(false))
  }, [])

  function handleSelect(plan) {
    if (plan.isAvailable === false) return
    navigate(`/order?plan=${plan.id}`)
  }

  return (
    <section className="page-shell">
      <SectionHeading
        eyebrow="Growth Packages"
        title="Premium packages, clearly framed."
        copy="Choose from follower and engagement tiers built for modern creator storefronts. Cards are responsive, animated, and ready to scale with more plans dynamically."
      />
      <div className="mt-7 flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/5 px-5 py-4">
        <div>
          <p className="text-sm text-zinc-500">Current service capacity</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {capacity === null ? "Loading..." : `${capacity} active order slots remaining`}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200/15 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
          Live
        </span>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {capacity === null || isLoadingProducts
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} className="h-[320px]" />)
          : products.map((plan) => <PlanCard key={plan.id} plan={plan} onSelect={handleSelect} />)}
      </div>
    </section>
  )
}
