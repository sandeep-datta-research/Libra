import { Search, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "../components/Button"
import { SectionHeading } from "../components/SectionHeading"
import { SkeletonCard } from "../components/SkeletonCard"
import { StatusPill } from "../components/StatusPill"
import { trackOrder } from "../lib/orders"
import { formatDate } from "../lib/utils"

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleTrack(event) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const found = await trackOrder(orderId.trim().toUpperCase())
      if (!found) {
        setOrder(null)
        setError("No order found for that ID.")
        return
      }
      setOrder(found)
    } catch (trackingError) {
      setError(trackingError.message || "Failed to fetch order status.")
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-shell">
      <SectionHeading
        eyebrow="Track Order"
        title="Order status, without the back-and-forth."
        copy="Customers can enter their unique order ID to check the latest verification and fulfillment status."
      />
      <div className="mt-10 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <form className="space-y-4" onSubmit={handleTrack}>
            <label className="space-y-2">
              <span className="text-sm text-zinc-400">Order ID</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  className="field pl-11 uppercase"
                  value={orderId}
                  onChange={(event) => {
                    setOrderId(event.target.value)
                    setError("")
                  }}
                  placeholder="IG-ABC123"
                />
              </div>
            </label>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <Button type="submit" disabled={isLoading} className="w-full justify-center">
              {isLoading ? "Checking status..." : "Track Now"}
            </Button>
          </form>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          {isLoading ? (
            <SkeletonCard className="h-[260px]" />
          ) : order ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Current Order</p>
                  <h3 className="mt-3 text-3xl font-semibold text-white">{order.id}</h3>
                  <p className="mt-3 text-sm text-zinc-400">Submitted on {formatDate(order.created_at)}</p>
                </div>
                <StatusPill status={order.status} />
              </div>
              <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-zinc-500">Instagram username</p>
                  <p className="mt-2 text-lg font-medium text-white">@{order.username}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Selected service</p>
                  <p className="mt-2 text-lg font-medium text-white">{order.service}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-zinc-500">Latest note</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">{order.notes || "No additional notes submitted."}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/8">
                <Sparkles className="h-6 w-6 text-fuchsia-200" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">Enter an order ID to begin.</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-zinc-400">
                Once an order has been created and payment proof submitted, its status will be visible here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
