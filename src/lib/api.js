export const apiBaseUrl = import.meta.env.VITE_API_URL || ""

function buildUrl(path) {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path
}

export function getStoredAdminToken() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem("libra-admin-token") || ""
}

export function setStoredAdminToken(token) {
  if (typeof window === "undefined") return
  if (token) {
    window.localStorage.setItem("libra-admin-token", token)
  } else {
    window.localStorage.removeItem("libra-admin-token")
  }
}

export async function apiRequest(path, { method = "GET", body, headers = {}, isForm = false, admin = false } = {}) {
  const requestHeaders = new Headers(headers)

  if (!isForm) {
    requestHeaders.set("Content-Type", "application/json")
  }

  if (admin) {
    const token = getStoredAdminToken()
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get("content-type") || ""
  const payload = contentType.includes("application/json") ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === "object" && payload?.message ? payload.message : "Request failed."
    throw new Error(message)
  }

  return payload
}
