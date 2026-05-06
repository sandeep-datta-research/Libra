import { LogOut, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../components/Button"
import { SectionHeading } from "../components/SectionHeading"
import { SkeletonCard } from "../components/SkeletonCard"
import { StatusPill } from "../components/StatusPill"
import { statusOptions } from "../data/services"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { getCapacity, listOrders, updateCapacity, updateOrderStatus } from "../lib/orders"
import { formatDate } from "../lib/utils"

export function AdminPage() {
  const { logout } = useAdminAuth()
  const [statusFilter, setStatusFilter] = useState("All")
  const [orders, setOrders] = useState([])
  const [capacity, setCapacityState] = useState(24)
  const [capacityInput, setCapacityInput] = useState("24")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingCapacity, setIsSavingCapacity] = useState(false)
  const [error, setError] = useState("")

  async function loadData(filter = statusFilter) {
    setIsLoading(true)
    setError("")
    try {
      const [orderRows, capacityValue] = await Promise.all([listOrders(filter), getCapacity()])
      setOrders(orderRows)
      setCapacityState(capacityValue)
      setCapacityInput(String(capacityValue))
    } catch (loadError) {
      setError(loadError.message || "Failed to load admin data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      setError("")
      try {
        const [orderRows, capacityValue] = await Promise.all([listOrders(statusFilter), getCapacity()])
        if (!active) return
        setOrders(orderRows)
        setCapacityState(capacityValue)
        setCapacityInput(String(capacityValue))
      } catch (loadError) {
        if (!active) return
        setError(loadError.message || "Failed to load admin data.")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [statusFilter])

  async function handleStatusChange(orderId, nextStatus) {
    await updateOrderStatus(orderId, nextStatus)
    await loadData(statusFilter)
  }

  async function handleSaveCapacity(event) {
    event.preventDefault()
    setIsSavingCapacity(true)
    await updateCapacity(Number(capacityInput) || 0)
    setCapacityState(Number(capacityInput) || 0)
    setIsSavingCapacity(false)
  }

  return (
    <section className="page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Admin Panel"
          title="Verification and fulfillment control."
          copy="Filter order statuses, inspect uploaded payment proof, and manage the live capacity limit from one protected route."
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => loadData(statusFilter)} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.35fr_0.65fr]">
        <form onSubmit={handleSaveCapacity} className="glass-panel rounded-[30px] p-6">
          <p className="section-kicker">Capacity Tracker</p>
          <h3 className="mt-4 text-2xl font-semibold text-white">{capacity} slots available</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Set the numeric limit used to communicate active order capacity on the storefront.
          </p>
          <label className="mt-5 block space-y-2">
            <span className="text-sm text-zinc-400">Current limit</span>
            <input
              type="number"
              min="0"
              value={capacityInput}
              onChange={(event) => setCapacityInput(event.target.value)}
              className="field"
            />
          </label>
          <Button type="submit" disabled={isSavingCapacity} className="mt-5 w-full justify-center">
            {isSavingCapacity ? "Saving..." : "Save Capacity"}
          </Button>
        </form>

        <div className="glass-panel rounded-[30px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Order Queue</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{orders.length} visible orders</h3>
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="field max-w-[220px]"
            >
              <option value="All">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

          <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
            {isLoading ? (
              <div className="space-y-3 p-4">
                <SkeletonCard className="h-16" />
                <SkeletonCard className="h-16" />
                <SkeletonCard className="h-16" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-sm text-zinc-400">No orders found for the selected filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                  <thead className="bg-white/5 text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Proof</th>
                      <th className="px-4 py-3 font-medium">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 bg-[#070b18]/70 text-zinc-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-white">{order.id}</p>
                          <p className="mt-1 text-zinc-400">@{order.username}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {formatDate(order.created_at)}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p>{order.service}</p>
                          <p className="mt-1 text-xs text-zinc-500">{order.transaction_id || "Awaiting payment proof"}</p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <StatusPill status={order.status} />
                        </td>
                        <td className="px-4 py-4 align-top">
                          {order.screenshot_url ? (
                            <a
                              href={order.screenshot_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-fuchsia-200 underline decoration-white/20 underline-offset-4"
                            >
                              View screenshot
                            </a>
                          ) : (
                            <span className="text-zinc-500">No upload yet</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            <select
                              value={order.status}
                              onChange={(event) => handleStatusChange(order.id, event.target.value)}
                              className="field min-w-[170px]"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="secondary"
                              className="justify-center"
                              onClick={() => handleStatusChange(order.id, "Verified")}
                            >
                              Quick Verify
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
