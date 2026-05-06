import { isSupabaseConfigured, storageBucket, supabase } from "./supabase"

const DEMO_ORDERS_KEY = "velora-demo-orders"
const DEMO_CAPACITY_KEY = "velora-demo-capacity"

function getStoredOrders() {
  if (typeof window === "undefined") return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(DEMO_ORDERS_KEY) || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setStoredOrders(orders) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(orders))
}

function getStoredCapacity() {
  if (typeof window === "undefined") return 24
  const stored = Number(window.localStorage.getItem(DEMO_CAPACITY_KEY))
  return Number.isFinite(stored) && stored >= 0 ? stored : 24
}

function setStoredCapacity(value) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DEMO_CAPACITY_KEY, String(value))
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("Failed to read screenshot file."))
    reader.readAsDataURL(file)
  })
}

export function generateOrderId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `IG-${random}`
}

export async function createOrder(order) {
  const nextOrder = {
    id: generateOrderId(),
    username: order.username,
    service: order.service,
    notes: order.notes || "",
    transaction_id: "",
    screenshot_url: "",
    status: "Pending",
    created_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured) {
    const orders = getStoredOrders()
    setStoredOrders([nextOrder, ...orders])
    return nextOrder
  }

  const { data, error } = await supabase.from("orders").insert(nextOrder).select().single()
  if (error) throw error
  return data
}

export async function submitPaymentProof({ orderId, transactionId, screenshotFile }) {
  let screenshotUrl = ""

  if (isSupabaseConfigured) {
    const extension = screenshotFile.name.split(".").pop() || "png"
    const path = `${orderId}/${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage.from(storageBucket).upload(path, screenshotFile, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(path)
    screenshotUrl = data.publicUrl
  } else {
    screenshotUrl = await fileToDataUrl(screenshotFile)
  }

  if (!isSupabaseConfigured) {
    const orders = getStoredOrders().map((order) =>
      order.id === orderId
        ? { ...order, transaction_id: transactionId, screenshot_url: screenshotUrl, status: "Pending" }
        : order,
    )
    const updated = orders.find((order) => order.id === orderId)
    setStoredOrders(orders)
    return updated
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      transaction_id: transactionId,
      screenshot_url: screenshotUrl,
      status: "Pending",
    })
    .eq("id", orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function trackOrder(orderId) {
  if (!isSupabaseConfigured) {
    return getStoredOrders().find((order) => order.id === orderId) || null
  }

  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle()
  if (error) throw error
  return data
}

export async function listOrders(status = "All") {
  if (!isSupabaseConfigured) {
    const orders = getStoredOrders()
    return status === "All" ? orders : orders.filter((order) => order.status === status)
  }

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false })
  if (status !== "All") {
    query = query.eq("status", status)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function updateOrderStatus(orderId, status) {
  if (!isSupabaseConfigured) {
    const orders = getStoredOrders().map((order) => (order.id === orderId ? { ...order, status } : order))
    const updated = orders.find((order) => order.id === orderId)
    setStoredOrders(orders)
    return updated
  }

  const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select().single()
  if (error) throw error
  return data
}

export async function getCapacity() {
  if (!isSupabaseConfigured) {
    return getStoredCapacity()
  }

  try {
    const { data, error } = await supabase.from("app_settings").select("value").eq("key", "capacity_limit").maybeSingle()
    if (error) throw error
    return Number(data?.value || 24)
  } catch {
    return getStoredCapacity()
  }
}

export async function updateCapacity(value) {
  if (!isSupabaseConfigured) {
    setStoredCapacity(value)
    return value
  }

  try {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "capacity_limit", value: String(value), updated_at: new Date().toISOString() })
    if (error) throw error
    return value
  } catch {
    setStoredCapacity(value)
    return value
  }
}
