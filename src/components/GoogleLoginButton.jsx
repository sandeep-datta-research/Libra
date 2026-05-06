import { useEffect, useId, useRef, useState } from "react"

const scriptId = "google-identity-services"

function loadGoogleScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google login is only available in the browser."))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google)
  }

  const existing = document.getElementById(scriptId)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(window.google), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load Google login.")), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error("Failed to load Google login."))
    document.head.appendChild(script)
  })
}

export function GoogleLoginButton({ text = "signin_with", onCredential, onError, theme = "filled_black", width = 320 }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
  const elementId = useId().replace(/:/g, "")
  const containerRef = useRef(null)
  const [message, setMessage] = useState("")
  const configurationMessage = clientId ? "" : "Google login is not configured yet. Add VITE_GOOGLE_CLIENT_ID."

  useEffect(() => {
    if (!clientId) return undefined

    let active = true

    loadGoogleScript()
      .then((google) => {
        if (!active || !containerRef.current || !google?.accounts?.id) return

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await onCredential?.(response.credential)
              setMessage("")
            } catch (error) {
              setMessage(error.message || "Google login failed.")
              onError?.(error)
            }
          },
        })

        containerRef.current.innerHTML = ""
        google.accounts.id.renderButton(containerRef.current, {
          theme,
          size: "large",
          shape: "pill",
          type: "standard",
          text,
          width,
        })
      })
      .catch((error) => {
        if (!active) return
        setMessage(error.message || "Failed to load Google login.")
        onError?.(error)
      })

    return () => {
      active = false
    }
  }, [clientId, elementId, onCredential, onError, text, theme, width])

  return (
    <div className="space-y-3">
      <div ref={containerRef} data-google-button={elementId} className="min-h-[44px]" />
      {configurationMessage || message ? <p className="text-sm text-amber-200">{configurationMessage || message}</p> : null}
    </div>
  )
}
