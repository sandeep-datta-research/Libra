export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function validateInstagramUsername(username) {
  return /^[a-zA-Z0-9._]{1,30}$/.test(username)
}

export function validateScreenshot(file) {
  if (!file) {
    return "Payment screenshot is required."
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return "Upload a PNG, JPG, or WEBP screenshot."
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Screenshot must be under 5MB."
  }

  return null
}

export function buildOrderNotes(notes, profile) {
  const metadata = []

  if (profile?.name?.trim()) {
    metadata.push(`Name: ${profile.name.trim()}`)
  }

  if (profile?.email?.trim()) {
    metadata.push(`Email: ${profile.email.trim()}`)
  }

  if (notes?.trim()) {
    metadata.push(`Notes: ${notes.trim()}`)
  }

  return metadata.join(" | ")
}
