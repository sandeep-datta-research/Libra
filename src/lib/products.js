import { apiRequest } from "./api"

export async function listProducts() {
  const payload = await apiRequest("/api/products")
  return payload.products || []
}

export async function listAdminProducts() {
  const payload = await apiRequest("/api/admin/products", { admin: true })
  return payload.products || []
}

export async function createProduct(product) {
  const payload = await apiRequest("/api/admin/products", {
    method: "POST",
    body: product,
    admin: true,
  })
  return payload.product
}

export async function updateProduct(productId, product) {
  const payload = await apiRequest(`/api/admin/products/${productId}`, {
    method: "PUT",
    body: product,
    admin: true,
  })
  return payload.product
}
