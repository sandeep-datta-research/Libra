import { apiBaseUrl, apiRequest } from "./api"

export function generateOrderId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `IG-${random}`
}

export async function createOrder(order) {
  const payload = await apiRequest("/api/orders", {
    method: "POST",
    body: order,
  })

  return payload.order
}

export async function submitPaymentProof({ orderId, transactionId, screenshotFile }) {
  const formData = new FormData()
  formData.append("transactionId", transactionId)
  formData.append("screenshot", screenshotFile)

  const payload = await apiRequest(`/api/orders/${orderId}/payment`, {
    method: "PATCH",
    body: formData,
    isForm: true,
  })

  return payload.order
}

export async function trackOrder(orderId) {
  const payload = await apiRequest(`/api/orders/${orderId}`)
  return payload.order
}

export async function listOrders(status = "All") {
  const suffix = status !== "All" ? `?status=${encodeURIComponent(status)}` : ""
  const payload = await apiRequest(`/api/admin/orders${suffix}`, { admin: true })
  return payload.orders || []
}

export async function updateOrderStatus(orderId, status) {
  const payload = await apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
    admin: true,
  })
  return payload.order
}

export async function getCapacity() {
  const payload = await apiRequest("/api/settings/capacity")
  return Number(payload.capacity || 24)
}

export async function updateCapacity(value) {
  const payload = await apiRequest("/api/admin/settings/capacity", {
    method: "PUT",
    body: { capacity: value },
    admin: true,
  })
  return Number(payload.capacity || value)
}

export async function getScreenshotUrl(path) {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path
}
