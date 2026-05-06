export const apiBaseUrl = import.meta.env.VITE_API_URL || ""

function buildUrl(path) {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem("libra-auth-token") || ""
}

export function setStoredAuthToken(token) {
  if (typeof window === "undefined") return
  if (token) {
    window.localStorage.setItem("libra-auth-token", token)
  } else {
    window.localStorage.removeItem("libra-auth-token")
  }
}

export async function apiRequest(path, { method = "GET", body, headers = {}, isForm = false, auth = false, admin = false } = {}) {
  const requestHeaders = new Headers(headers)

  if (!isForm) {
    requestHeaders.set("Content-Type", "application/json")
  }

  if (auth || admin) {
    const token = getStoredAuthToken()
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
