import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ImageUp, ReceiptIndianRupee, ShieldCheck, WalletCards } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { Button } from "../components/Button"
import { OrderSuccessAnimation } from "../components/OrderSuccessAnimation"
import { PlanCard } from "../components/PlanCard"
import { SectionHeading } from "../components/SectionHeading"
import { services } from "../data/services"
import { createOrder, submitPaymentProof } from "../lib/orders"
import { buildOrderNotes, formatCurrency, validateInstagramUsername, validateScreenshot } from "../lib/utils"

const profileKey = "libra-profile"

export function OrderPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const planId = searchParams.get("plan")
  const selectedPlan = useMemo(() => services.find((plan) => plan.id === planId) || services[1], [planId])
  const [profile, setProfile] = useState(() => {
    if (typeof window === "undefined") {
      return { name: "", email: "" }
    }
    try {
      const stored = JSON.parse(window.localStorage.getItem(profileKey) || "{}")
      return {
        name: stored.name || "",
        email: stored.email || "",
      }
    } catch {
      return { name: "", email: "" }
    }
  })
  const [username, setUsername] = useState("")
  const [notes, setNotes] = useState("")
  const [createdOrder, setCreatedOrder] = useState(null)
  const [transactionId, setTransactionId] = useState("")
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [error, setError] = useState("")
  const [paymentError, setPaymentError] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  function handlePlanSelect(plan) {
    setSearchParams({ plan: plan.id })
  }

  async function handleCreateOrder(event) {
    event.preventDefault()

    if (!validateInstagramUsername(username.trim())) {
      setError("Enter a valid Instagram username without @.")
      return
    }

    setError("")
    setIsSubmittingOrder(true)

    try {
      const normalizedProfile = {
        name: profile.name.trim(),
        email: profile.email.trim(),
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(profileKey, JSON.stringify(normalizedProfile))
      }

      const created = await createOrder({
        username: username.trim(),
        service: `${selectedPlan.title} • ${formatCurrency(selectedPlan.price)}`,
        notes: buildOrderNotes(notes, normalizedProfile),
      })
      setCreatedOrder(created)
    } catch (submissionError) {
      setError(submissionError.message || "Failed to create order.")
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  async function handleSubmitPayment(event) {
    event.preventDefault()
    const screenshotValidation = validateScreenshot(screenshotFile)
    if (!transactionId.trim()) {
      setPaymentError("Transaction ID is required.")
      return
    }
    if (screenshotValidation) {
      setPaymentError(screenshotValidation)
      return
    }

    setPaymentError("")
    setIsSubmittingPayment(true)

    try {
      const updated = await submitPaymentProof({
        orderId: createdOrder.id,
        transactionId: transactionId.trim(),
        screenshotFile,
      })
      setCompletedOrder(updated)
    } catch (submissionError) {
      setPaymentError(submissionError.message || "Failed to submit payment proof.")
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const upiId = import.meta.env.VITE_UPI_ID || "your-upi-id@bank"
  const upiName = import.meta.env.VITE_UPI_NAME || "Libra Growth"

  return (
    <section className="page-shell">
      <SectionHeading
        eyebrow="Place Order"
        title="Pick a plan, then complete proof-based checkout."
        copy="Selecting a package auto-fills the service summary. Customers only enter an Instagram username and optional notes before receiving a unique order ID."
      />
      <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {services.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={handlePlanSelect} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                <ReceiptIndianRupee className="h-5 w-5 text-fuchsia-200" />
              </div>
              <div>
                <p className="section-kicker">Order Summary</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedPlan.title}</h3>
              </div>
            </div>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Selected package</p>
                  <p className="mt-1 text-lg font-medium text-white">{selectedPlan.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Total price</p>
                  <p className="mt-1 text-3xl font-semibold text-white">{formatCurrency(selectedPlan.price)}</p>
                </div>
              </div>
            </div>

            {!createdOrder ? (
              <form className="mt-6 space-y-4" onSubmit={handleCreateOrder}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-400">Name (optional)</span>
                    <input
                      className="field"
                      value={profile.name}
                      onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-400">Email (optional)</span>
                    <input
                      type="email"
                      className="field"
                      value={profile.email}
                      onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Instagram username</span>
                  <input
                    className="field"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value.replace("@", ""))
                      setError("")
                    }}
                    placeholder="username"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-400">Notes (optional)</span>
                  <textarea
                    rows="4"
                    className="field min-h-[120px] resize-none"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Anything we should know about the order?"
                  />
                </label>
                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                <Button type="submit" disabled={isSubmittingOrder} className="w-full justify-center">
                  {isSubmittingOrder ? "Creating order..." : "Generate Order ID"}
                </Button>
              </form>
            ) : !completedOrder ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
                <div className="rounded-[24px] border border-emerald-200/15 bg-emerald-300/10 p-5">
                  <p className="section-kicker text-emerald-200">Order Created</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{createdOrder.id}</p>
                  <p className="mt-2 text-sm leading-7 text-emerald-100/85">
                    Use this Order ID on the tracking page. Complete payment below, then upload the proof screenshot.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <WalletCards className="h-5 w-5 text-fuchsia-200" />
                    <div>
                      <p className="text-sm text-zinc-500">UPI Payment Instructions</p>
                      <p className="mt-1 text-lg font-semibold text-white">{upiId}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-[22px] border border-white/10 bg-[#080d20] p-4 text-sm text-zinc-300">
                    <p>Pay {formatCurrency(selectedPlan.price)} to {upiName}.</p>
                    <p>Reference your order after payment by submitting the transaction ID.</p>
                    <p>Upload the payment screenshot for manual verification.</p>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={handleSubmitPayment}>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-400">Transaction ID</span>
                    <input
                      className="field"
                      value={transactionId}
                      onChange={(event) => {
                        setTransactionId(event.target.value)
                        setPaymentError("")
                      }}
                      placeholder="Enter UPI transaction ID"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-400">Payment screenshot</span>
                    <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
                        <ImageUp className="h-4 w-4" />
                        PNG, JPG, or WEBP up to 5MB
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => {
                          setScreenshotFile(event.target.files?.[0] || null)
                          setPaymentError("")
                        }}
                        className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-slate-950"
                      />
                    </div>
                  </label>
                  {paymentError ? <p className="text-sm text-rose-300">{paymentError}</p> : null}
                  <Button type="submit" disabled={isSubmittingPayment} className="w-full justify-center">
                    {isSubmittingPayment ? "Submitting proof..." : "Submit Payment Proof"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <div className="mt-6 space-y-4 rounded-[28px] border border-emerald-200/15 bg-emerald-300/10 p-6 text-center">
                <OrderSuccessAnimation />
                <div>
                  <p className="section-kicker text-emerald-200">Proof Submitted</p>
                  <h3 className="mt-3 text-3xl font-semibold text-white">Order in review</h3>
                  <p className="mt-3 text-sm leading-7 text-emerald-100/85">
                    Your payment proof has been uploaded. Track your order with ID <strong>{completedOrder.id}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-[28px] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <p className="text-sm font-medium text-white">Built-in safeguards</p>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-400">
              <li>Username validation prevents malformed orders.</li>
              <li>Proof uploads accept only image formats under 5MB.</li>
              <li>Admin route is restricted to the approved Supabase email login.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
