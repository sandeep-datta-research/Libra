import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CheckCheck, Copy, ExternalLink, ImageUp, LogIn, QrCode, ReceiptIndianRupee, ShieldCheck, WalletCards } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { Button } from "../components/Button"
import { GoogleLoginButton } from "../components/GoogleLoginButton"
import { OrderSuccessAnimation } from "../components/OrderSuccessAnimation"
import { PlanCard } from "../components/PlanCard"
import { SectionHeading } from "../components/SectionHeading"
import { SkeletonCard } from "../components/SkeletonCard"
import { useAuthSession } from "../hooks/useAuthSession"
import { listProducts } from "../lib/products"
import { createOrder, submitPaymentProof } from "../lib/orders"
import { buildOrderNotes, formatCurrency, validateInstagramUsername, validateScreenshot } from "../lib/utils"

const profileKey = "libra-profile"

export function OrderPage() {
  const { isAuthenticated, loginWithGoogle, user } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const planId = searchParams.get("plan")
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const selectedPlan = useMemo(() => {
    return products.find((plan) => plan.id === planId) || products.find((plan) => plan.highlight) || products[0] || null
  }, [planId, products])
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
  const [copiedField, setCopiedField] = useState("")
  const summaryRef = useRef(null)

  useEffect(() => {
    listProducts()
      .then((rows) => setProducts(rows))
      .catch(() => setProducts([]))
      .finally(() => setIsLoadingProducts(false))
  }, [])

  function handlePlanSelect(plan) {
    if (plan.isAvailable === false) return
    setSearchParams({ plan: plan.id })
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function handleCreateOrder(event) {
    event.preventDefault()

    if (!selectedPlan) {
      setError("No package is currently available.")
      return
    }

    if (!validateInstagramUsername(username.trim())) {
      setError("Enter a valid Instagram username without @.")
      return
    }

    setError("")
    setIsSubmittingOrder(true)

    try {
      const normalizedProfile = {
        name: (user?.name || profile.name).trim(),
        email: (user?.email || profile.email).trim(),
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(profileKey, JSON.stringify(normalizedProfile))
      }

      const created = await createOrder({
        username: username.trim(),
        serviceId: selectedPlan.id,
        notes: buildOrderNotes(notes, normalizedProfile),
        userEmail: user?.email || normalizedProfile.email,
        userName: user?.name || normalizedProfile.name,
        userPicture: user?.picture || "",
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

  const upiId = import.meta.env.VITE_UPI_ID || "satousandeep@fam"
  const upiName = import.meta.env.VITE_UPI_NAME || "Libra"
  const upiLink = useMemo(() => {
    if (!selectedPlan) return ""
    const params = new URLSearchParams({
      pa: upiId,
      pn: upiName,
      am: String(selectedPlan.price),
      cu: "INR",
      tn: `${selectedPlan.title} - Libra`,
    })

    return `upi://pay?${params.toString()}`
  }, [selectedPlan, upiId, upiName])
  const qrUrl = useMemo(
    () => `https://quickchart.io/qr?size=260&text=${encodeURIComponent(upiLink)}`,
    [upiLink],
  )

  async function handleCopy(value, field) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(""), 1400)
    } catch {
      setCopiedField("")
    }
  }

  return (
    <section className="page-shell">
      <SectionHeading
        eyebrow="Place Order"
        title="Select, pay, and submit proof in one guided flow."
        copy="Package selection now drives the entire checkout surface automatically. Once you choose a plan, the payment amount, UPI deep link, and QR are already prepared."
      />
      <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-amber-200/15 bg-amber-300/10 p-5">
            <p className="section-kicker text-amber-100">Important Notice</p>
            <p className="mt-3 text-base font-semibold text-white">Keep your Instagram account public while the order is being delivered.</p>
            <p className="mt-2 text-sm leading-7 text-amber-50/85">
              Private accounts can block fulfillment and delay verification. Switch to public before placing the order and keep it public until completion.
            </p>
          </div>
          {!isAuthenticated ? (
            <div className="rounded-[30px] border border-white/10 bg-[#081121] p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-kicker">Optional Login</p>
                  <p className="mt-2 text-lg font-semibold text-white">Sign in once to auto-fill your order identity.</p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                    Google login is optional for customers, but it keeps your future orders visible in the portal and pre-fills name and email automatically.
                  </p>
                </div>
                <div className="min-w-[280px]">
                  <GoogleLoginButton text="continue_with" width={320} onCredential={loginWithGoogle} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[30px] border border-emerald-200/15 bg-emerald-300/10 p-5">
              <div className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-emerald-200" />
                <div>
                  <p className="text-sm font-medium text-white">Signed in as {user?.email}</p>
                  <p className="mt-1 text-sm text-emerald-100/85">Your identity will be attached to this order and visible in the user portal.</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            {isLoadingProducts
              ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} className="h-[320px]" />)
              : products.map((plan) => <PlanCard key={plan.id} plan={plan} onSelect={handlePlanSelect} />)}
          </div>
        </div>
        <div ref={summaryRef} className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          {!selectedPlan && !isLoadingProducts ? (
            <div className="glass-panel rounded-[32px] p-6 text-sm text-zinc-400">No active plans are available right now. Add cards from the admin dashboard to reopen ordering.</div>
          ) : null}
          {selectedPlan ? (
            <>
              <div className="glass-panel rounded-[32px] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                <ReceiptIndianRupee className="h-5 w-5 text-fuchsia-200" />
              </div>
              <div>
                <p className="section-kicker">Order Summary</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedPlan.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">Auto-updated as soon as you select a package.</p>
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
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-[#0a0f1f] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Receiver</p>
                <p className="mt-2 text-sm font-semibold text-white">{upiId}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0a0f1f] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">ETA</p>
                <p className="mt-2 text-sm font-semibold text-white">{selectedPlan.eta}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0a0f1f] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Proof</p>
                <p className="mt-2 text-sm font-semibold text-white">Txn ID + Screenshot</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0a0f1f] p-4 sm:col-span-3">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Slots left on this package</p>
                <p className="mt-2 text-sm font-semibold text-white">{Math.max(0, Number(selectedPlan.slots || 0))} active slots</p>
              </div>
            </div>

            {!createdOrder ? (
              <form className="mt-6 space-y-4" onSubmit={handleCreateOrder}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-400">Name (optional)</span>
                    <input
                      className="field"
                      value={user?.name || profile.name}
                      disabled={Boolean(user?.name)}
                      onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                      placeholder={user?.name || "Your name"}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-400">Email (optional)</span>
                    <input
                      type="email"
                      className="field"
                      value={user?.email || profile.email}
                      disabled={Boolean(user?.email)}
                      onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                      placeholder={user?.email || "you@example.com"}
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
                <Button
                  type="submit"
                  disabled={isSubmittingOrder || selectedPlan.isAvailable === false}
                  className="w-full justify-center bg-[linear-gradient(135deg,#ffffff,#f5d0fe_52%,#bae6fd)]"
                >
                  {isSubmittingOrder ? "Creating order..." : `Continue to payment for ${formatCurrency(selectedPlan.price)}`}
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
                <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:grid-cols-[220px_1fr]">
                  <div className="rounded-[22px] border border-white/10 bg-[#080d20] p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                      <QrCode className="h-3.5 w-3.5" />
                      Scan UPI QR
                    </div>
                    <img src={qrUrl} alt="Libra payment QR" className="mx-auto h-[180px] w-[180px] rounded-xl border border-white/10 bg-white p-1" />
                  </div>
                  <div className="space-y-4 rounded-[22px] border border-white/10 bg-[#080d20] p-4">
                    <div className="flex items-center gap-3">
                      <WalletCards className="h-5 w-5 text-fuchsia-200" />
                      <div>
                        <p className="text-sm text-zinc-500">UPI Payment Instructions</p>
                        <p className="mt-1 text-lg font-semibold text-white">{upiId}</p>
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                      <p>Pay {formatCurrency(selectedPlan.price)} to {upiName}.</p>
                      <p className="mt-2">Reference your order after payment by submitting the transaction ID.</p>
                      <p className="mt-2">Upload the payment screenshot for manual verification.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a href={upiLink} className="inline-flex">
                        <Button className="gap-2 bg-[linear-gradient(135deg,#ffffff,#f5d0fe_52%,#bae6fd)]">
                          Open UPI App
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button variant="secondary" className="gap-2" onClick={() => handleCopy(upiId, "upi")}>
                        {copiedField === "upi" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedField === "upi" ? "UPI copied" : "Copy UPI ID"}
                      </Button>
                      <Button variant="secondary" className="gap-2" onClick={() => handleCopy(String(selectedPlan.price), "amount")}>
                        {copiedField === "amount" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedField === "amount" ? "Amount copied" : "Copy amount"}
                      </Button>
                    </div>
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
                  <Button
                    type="submit"
                    disabled={isSubmittingPayment}
                    className="w-full justify-center bg-[linear-gradient(135deg,#ffffff,#f5d0fe_52%,#bae6fd)]"
                  >
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
                  <li>Admin route is restricted to the approved Google account.</li>
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
