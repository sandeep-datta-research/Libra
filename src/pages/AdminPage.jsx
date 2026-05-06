import { LogOut, Plus, RefreshCw, Save } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "../components/Button"
import { SectionHeading } from "../components/SectionHeading"
import { SkeletonCard } from "../components/SkeletonCard"
import { StatusPill } from "../components/StatusPill"
import { statusOptions } from "../data/services"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { getCapacity, getScreenshotUrl, listOrders, updateCapacity, updateOrderStatus } from "../lib/orders"
import { createProduct, listAdminProducts, updateProduct } from "../lib/products"
import { formatCurrency, formatDate } from "../lib/utils"

function createEmptyProduct() {
  return {
    id: "",
    category: "",
    title: "",
    description: "",
    quantity: "",
    price: "",
    slots: "",
    eta: "",
    featuresText: "",
    highlight: false,
    isAvailable: true,
    stockLabel: "Available",
  }
}

function toFormState(product) {
  return {
    id: product.id || "",
    category: product.category || "",
    title: product.title || "",
    description: product.description || "",
    quantity: product.quantity || "",
    price: `${product.price || ""}`,
    slots: `${product.slots ?? ""}`,
    eta: product.eta || "",
    featuresText: Array.isArray(product.features) ? product.features.join(", ") : "",
    highlight: Boolean(product.highlight),
    isAvailable: product.isAvailable !== false,
    stockLabel: product.stockLabel || (product.isAvailable === false ? "Out of stock" : "Available"),
  }
}

function toPayload(product) {
  return {
    ...product,
    price: Number(product.price || 0),
    slots: Math.max(0, Number(product.slots || 0)),
    features: product.featuresText,
  }
}

export function AdminPage() {
  const { adminEmail, logout, user } = useAdminAuth()
  const [statusFilter, setStatusFilter] = useState("All")
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [editingProductId, setEditingProductId] = useState("")
  const [productForm, setProductForm] = useState(() => createEmptyProduct())
  const [capacity, setCapacityState] = useState(24)
  const [capacityInput, setCapacityInput] = useState("24")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingCapacity, setIsSavingCapacity] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [error, setError] = useState("")

  const activeProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) || null,
    [editingProductId, products],
  )

  async function loadData(filter = statusFilter) {
    setIsLoading(true)
    setError("")
    try {
      const [orderRows, capacityValue, productRows] = await Promise.all([
        listOrders(filter),
        getCapacity(),
        listAdminProducts(),
      ])
      setOrders(orderRows)
      setProducts(productRows)
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

    Promise.all([listOrders(statusFilter), getCapacity(), listAdminProducts()])
      .then(([orderRows, capacityValue, productRows]) => {
        if (!active) return
        setOrders(orderRows)
        setProducts(productRows)
        setCapacityState(capacityValue)
        setCapacityInput(String(capacityValue))
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message || "Failed to load admin data.")
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

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
    setError("")
    try {
      await updateCapacity(Number(capacityInput) || 0)
      setCapacityState(Number(capacityInput) || 0)
    } catch (saveError) {
      setError(saveError.message || "Failed to save capacity.")
    } finally {
      setIsSavingCapacity(false)
    }
  }

  async function handleOpenScreenshot(path) {
    try {
      const url = await getScreenshotUrl(path)
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer")
      }
    } catch (openError) {
      setError(openError.message || "Failed to open screenshot.")
    }
  }

  async function handleSaveProduct(event) {
    event.preventDefault()
    setIsSavingProduct(true)
    setError("")
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, toPayload(productForm))
      } else {
        await createProduct(toPayload(productForm))
      }
      setProductForm(createEmptyProduct())
      setEditingProductId("")
      await loadData(statusFilter)
    } catch (saveError) {
      setError(saveError.message || "Failed to save product.")
    } finally {
      setIsSavingProduct(false)
    }
  }

  return (
    <section className="page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Admin Panel"
          title="Orders, cards, and stock control."
          copy="Use Google-authenticated admin access to verify orders, edit card pricing, add new plans, and lock unavailable inventory without touching code."
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

      <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-zinc-300">
        Logged in as <span className="font-semibold text-white">{user?.email || adminEmail}</span>
      </div>

      {error ? <p className="mt-5 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
        <div className="space-y-6">
          <form onSubmit={handleSaveCapacity} className="glass-panel rounded-[30px] p-6">
            <p className="section-kicker">Capacity Tracker</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">{capacity} slots available</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              This number appears publicly on the services page, so keep it aligned with your real daily fulfillment bandwidth.
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

          <form onSubmit={handleSaveProduct} className="glass-panel rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Card Manager</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{editingProductId ? "Edit active card" : "Create new card"}</h3>
              </div>
              {editingProductId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingProductId("")
                    setProductForm(createEmptyProduct())
                  }}
                >
                  New Card
                </Button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Card ID</span>
                  <input
                    className="field"
                    value={productForm.id}
                    disabled={Boolean(editingProductId)}
                    onChange={(event) => setProductForm((current) => ({ ...current, id: event.target.value }))}
                    placeholder="signature-scale"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Category</span>
                  <input
                    className="field"
                    value={productForm.category}
                    onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Premium Mix Package"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Title</span>
                  <input
                    className="field"
                    value={productForm.title}
                    onChange={(event) => setProductForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Libra Elite"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Quantity</span>
                  <input
                    className="field"
                    value={productForm.quantity}
                    onChange={(event) => setProductForm((current) => ({ ...current, quantity: event.target.value }))}
                    placeholder="400 Growth Units"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm text-zinc-400">Description</span>
                <textarea
                  rows="3"
                  className="field min-h-[110px] resize-none"
                  value={productForm.description}
                  onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Premium package description"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Price (INR)</span>
                  <input
                    type="number"
                    min="1"
                    className="field"
                    value={productForm.price}
                    onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="320"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Slots</span>
                  <input
                    type="number"
                    min="0"
                    className="field"
                    value={productForm.slots}
                    onChange={(event) => setProductForm((current) => ({ ...current, slots: event.target.value }))}
                    placeholder="12"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">ETA</span>
                  <input
                    className="field"
                    value={productForm.eta}
                    onChange={(event) => setProductForm((current) => ({ ...current, eta: event.target.value }))}
                    placeholder="24-48 hours"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Stock label</span>
                  <input
                    className="field"
                    value={productForm.stockLabel}
                    onChange={(event) => setProductForm((current) => ({ ...current, stockLabel: event.target.value }))}
                    placeholder="Available"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm text-zinc-400">Features</span>
                <input
                  className="field"
                  value={productForm.featuresText}
                  onChange={(event) => setProductForm((current) => ({ ...current, featuresText: event.target.value }))}
                  placeholder="Priority queue, human review, premium support"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={productForm.highlight}
                    onChange={(event) => setProductForm((current) => ({ ...current, highlight: event.target.checked }))}
                  />
                  Mark as most popular
                </label>
                <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        isAvailable: event.target.checked,
                        stockLabel: event.target.checked ? current.stockLabel || "Available" : "Out of stock",
                      }))
                    }
                  />
                  Available for ordering
                </label>
              </div>

              <Button type="submit" disabled={isSavingProduct} className="w-full justify-center gap-2">
                {editingProductId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isSavingProduct ? "Saving..." : editingProductId ? "Save Card Changes" : "Add New Card"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Card Inventory</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{products.length} live storefront cards</h3>
              </div>
              {activeProduct ? (
                <p className="text-sm text-zinc-400">Editing: <span className="text-white">{activeProduct.title}</span></p>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} className="h-[240px]" />)
                : products.map((product) => (
                    <div key={product.id} className="rounded-[28px] border border-white/10 bg-[#091021] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{product.category}</p>
                          <h4 className="mt-2 text-xl font-semibold text-white">{product.title}</h4>
                          <p className="mt-3 text-sm leading-7 text-zinc-400">{product.description}</p>
                        </div>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
                            product.isAvailable === false
                              ? "border border-rose-200/15 bg-rose-300/10 text-rose-100"
                              : "border border-emerald-200/15 bg-emerald-300/10 text-emerald-100",
                          ].join(" ")}
                        >
                          {product.stockLabel || (product.isAvailable === false ? "Out of stock" : "Available")}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4 border-y border-white/10 py-4">
                        <div>
                          <p className="text-sm text-zinc-500">Quantity</p>
                          <p className="mt-1 text-base font-medium text-white">{product.quantity}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {Math.max(0, Number(product.slots || 0))} slots left
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-500">Price</p>
                          <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(product.price)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {product.features?.map((feature) => (
                          <span key={feature} className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-zinc-300">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex gap-3">
                        <Button variant="secondary" onClick={() => {
                          setEditingProductId(product.id)
                          setProductForm(toFormState(product))
                        }}>
                          Edit Card
                        </Button>
                        <Button
                          onClick={async () => {
                            setError("")
                            try {
                              await updateProduct(product.id, {
                                isAvailable: product.isAvailable === false,
                                stockLabel: product.isAvailable === false ? "Available" : "Out of stock",
                              })
                              await loadData(statusFilter)
                            } catch (toggleError) {
                              setError(toggleError.message || "Failed to update stock.")
                            }
                          }}
                        >
                          {product.isAvailable === false ? "Mark In Stock" : "Mark Out of Stock"}
                        </Button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Order Queue</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{orders.length} visible orders</h3>
              </div>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setIsLoading(true)
                  setError("")
                  setStatusFilter(event.target.value)
                }}
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
                          {order.customer_name || order.customer_email ? (
                            <p className="mt-1 text-xs text-zinc-500">
                              {[order.customer_name, order.customer_email].filter(Boolean).join(" • ")}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {formatDate(order.created_at)}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p>{order.service}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {order.slot_reserved === false ? "Slot released" : "Slot reserved"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">{order.transaction_id || "Awaiting payment proof"}</p>
                        </td>
                          <td className="px-4 py-4 align-top">
                            <StatusPill status={order.status} />
                          </td>
                          <td className="px-4 py-4 align-top">
                            {order.screenshot_url ? (
                              <button
                                type="button"
                                onClick={() => handleOpenScreenshot(order.screenshot_url)}
                                className="text-fuchsia-200 underline decoration-white/20 underline-offset-4"
                              >
                                View screenshot
                              </button>
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
      </div>
    </section>
  )
}
