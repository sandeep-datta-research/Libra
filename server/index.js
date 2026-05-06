import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import mongoose from "mongoose"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { services as seededServices } from "../src/data/services.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, "uploads")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const app = express()
const port = Number(process.env.PORT || 4000)
const mongoUri = process.env.MONGODB_URI || ""
const adminEmail = (process.env.ADMIN_EMAIL || "sandeepdatta866@gmail.com").toLowerCase()
const jwtSecret = process.env.JWT_SECRET || "change-this-jwt-secret"
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
const googleClientId = process.env.GOOGLE_CLIENT_ID || ""
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null

const allowedOrigins = [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"]

function cloneSeedProducts() {
  return seededServices.map((service) => ({
    ...service,
    features: [...service.features],
    isAvailable: service.isAvailable ?? true,
    stockLabel: service.stockLabel || "Available",
  }))
}

function normalizeFeatures(features) {
  if (Array.isArray(features)) {
    return features.map((feature) => `${feature}`.trim()).filter(Boolean)
  }

  if (typeof features === "string") {
    return features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean)
  }

  return []
}

function slugify(value) {
  return `${value || ""}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48)
}

function normalizeProductInput(input, fallbackId = "") {
  const id = slugify(input.id || input.title || fallbackId)
  return {
    id,
    category: `${input.category || ""}`.trim(),
    title: `${input.title || ""}`.trim(),
    description: `${input.description || ""}`.trim(),
    quantity: `${input.quantity || ""}`.trim(),
    price: Number(input.price || 0),
    eta: `${input.eta || ""}`.trim(),
    highlight: Boolean(input.highlight),
    isAvailable: input.isAvailable !== false,
    stockLabel: `${input.stockLabel || (input.isAvailable === false ? "Out of stock" : "Available")}`.trim(),
    features: normalizeFeatures(input.features),
  }
}

function validateProduct(product) {
  if (!product.id || !product.title || !product.category || !product.quantity || !product.description || !product.eta) {
    return "All product fields are required."
  }

  if (!Number.isFinite(product.price) || product.price <= 0) {
    return "Price must be a valid number."
  }

  if (product.features.length === 0) {
    return "Add at least one feature."
  }

  return null
}

function createOrderId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `IG-${random}`
}

function createSessionToken(user) {
  return jwt.sign(user, jwtSecret, { expiresIn: "7d" })
}

async function verifyGoogleCredential(credential) {
  if (!googleClient || !googleClientId) {
    throw new Error("Google login is not configured on the backend.")
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: googleClientId,
  })

  const payload = ticket.getPayload()
  if (!payload?.email || !payload.email_verified) {
    throw new Error("Google account email could not be verified.")
  }

  return {
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email,
    picture: payload.picture || "",
  }
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || ""
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
}

function readSession(req) {
  const token = getBearerToken(req)
  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, jwtSecret)
  } catch {
    return null
  }
}

function requireAuth(req, res, next) {
  const session = readSession(req)
  if (!session) {
    res.status(401).json({ message: "Authentication required." })
    return
  }

  req.user = session
  next()
}

function requireAdmin(req, res, next) {
  const session = readSession(req)
  if (!session) {
    res.status(401).json({ message: "Authentication required." })
    return
  }

  if (session.role !== "admin" || `${session.email || ""}`.toLowerCase() !== adminEmail) {
    res.status(403).json({ message: "Admin access required." })
    return
  }

  req.user = session
  next()
}

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: Number, required: true },
    eta: { type: String, required: true },
    highlight: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    stockLabel: { type: String, default: "Available" },
    features: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
)

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    service: { type: String, required: true },
    service_id: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    transaction_id: { type: String, default: "" },
    screenshot_url: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Verified", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
    user_email: { type: String, default: "" },
    user_name: { type: String, default: "" },
    user_picture: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: true }, versionKey: false },
)

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: { createdAt: false, updatedAt: "updated_at" }, versionKey: false },
)

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema)
const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema)

const memoryStore = {
  products: cloneSeedProducts(),
  orders: [],
  settings: new Map([["capacity_limit", "24"]]),
}

let storageMode = "memory"

async function bootstrapStorage() {
  if (!mongoUri) {
    storageMode = "memory"
    return
  }

  try {
    await mongoose.connect(mongoUri)
    await Setting.updateOne({ key: "capacity_limit" }, { $setOnInsert: { value: "24" } }, { upsert: true })

    for (const product of cloneSeedProducts()) {
      await Product.updateOne({ id: product.id }, { $setOnInsert: product }, { upsert: true })
    }

    storageMode = "mongo"
  } catch (error) {
    console.warn("Mongo connection failed, falling back to in-memory preview store:", error.message)
    storageMode = "memory"
  }
}

await bootstrapStorage()

async function listProductsRecord() {
  if (storageMode === "mongo") {
    return Product.find({}).sort({ highlight: -1, price: 1 })
  }

  return [...memoryStore.products].sort((a, b) => Number(b.highlight) - Number(a.highlight) || a.price - b.price)
}

async function findProductById(productId) {
  if (storageMode === "mongo") {
    return Product.findOne({ id: productId })
  }

  return memoryStore.products.find((product) => product.id === productId) || null
}

async function createProductRecord(input) {
  const product = normalizeProductInput(input)
  const validationError = validateProduct(product)
  if (validationError) {
    throw new Error(validationError)
  }

  if (storageMode === "mongo") {
    if (await Product.exists({ id: product.id })) {
      throw new Error("A card with that id already exists.")
    }
    return Product.create(product)
  }

  if (memoryStore.products.some((item) => item.id === product.id)) {
    throw new Error("A card with that id already exists.")
  }
  memoryStore.products.unshift(product)
  return product
}

async function updateProductRecord(productId, input) {
  const current = await findProductById(productId)
  if (!current) return null

  const merged = normalizeProductInput({ ...current, ...input }, productId)
  const validationError = validateProduct(merged)
  if (validationError) {
    throw new Error(validationError)
  }

  if (storageMode === "mongo") {
    return Product.findOneAndUpdate({ id: productId }, merged, { new: true })
  }

  const index = memoryStore.products.findIndex((item) => item.id === productId)
  memoryStore.products[index] = merged
  return merged
}

async function orderExists(orderId) {
  if (storageMode === "mongo") {
    return Boolean(await Order.exists({ id: orderId }))
  }

  return memoryStore.orders.some((order) => order.id === orderId)
}

async function createOrderRecord(record) {
  if (storageMode === "mongo") {
    return Order.create(record)
  }

  const order = {
    ...record,
    transaction_id: "",
    screenshot_url: "",
    status: "Pending",
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  memoryStore.orders.unshift(order)
  return order
}

async function findOrderById(orderId) {
  if (storageMode === "mongo") {
    return Order.findOne({ id: orderId })
  }

  return memoryStore.orders.find((order) => order.id === orderId) || null
}

async function savePaymentProof(orderId, transactionId, screenshotUrl) {
  if (storageMode === "mongo") {
    return Order.findOneAndUpdate(
      { id: orderId },
      { transaction_id: transactionId, screenshot_url: screenshotUrl, status: "Pending" },
      { new: true },
    )
  }

  const order = memoryStore.orders.find((row) => row.id === orderId)
  if (!order) return null
  order.transaction_id = transactionId
  order.screenshot_url = screenshotUrl
  order.status = "Pending"
  order.updatedAt = new Date().toISOString()
  return order
}

async function listOrderRecords(status) {
  if (storageMode === "mongo") {
    const filter = status !== "All" ? { status } : {}
    return Order.find(filter).sort({ created_at: -1 })
  }

  return memoryStore.orders.filter((order) => (status === "All" ? true : order.status === status))
}

async function listOrdersForUser(userEmail) {
  if (storageMode === "mongo") {
    return Order.find({ user_email: userEmail }).sort({ created_at: -1 })
  }

  return memoryStore.orders.filter((order) => order.user_email === userEmail)
}

async function updateOrderRecordStatus(orderId, status) {
  if (storageMode === "mongo") {
    return Order.findOneAndUpdate({ id: orderId }, { status }, { new: true })
  }

  const order = memoryStore.orders.find((row) => row.id === orderId)
  if (!order) return null
  order.status = status
  order.updatedAt = new Date().toISOString()
  return order
}

async function getCapacityValue() {
  if (storageMode === "mongo") {
    const setting = await Setting.findOne({ key: "capacity_limit" })
    return Number(setting?.value || 24)
  }

  return Number(memoryStore.settings.get("capacity_limit") || 24)
}

async function setCapacityValue(capacity) {
  if (storageMode === "mongo") {
    const setting = await Setting.findOneAndUpdate(
      { key: "capacity_limit" },
      { value: String(capacity) },
      { new: true, upsert: true },
    )
    return Number(setting.value)
  }

  memoryStore.settings.set("capacity_limit", String(capacity))
  return capacity
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: false,
  }),
)
app.use(express.json())
app.use("/uploads", express.static(uploadsDir))

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || ".png")
    callback(null, `${req.params.orderId}-${Date.now()}${extension}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      callback(null, true)
      return
    }
    callback(new Error("Upload a PNG, JPG, or WEBP screenshot."))
  },
})

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, storageMode, googleAuth: Boolean(googleClientId) })
})

app.post("/api/auth/google", async (req, res) => {
  const credential = `${req.body?.credential || ""}`
  const googleUser = await verifyGoogleCredential(credential)
  const user = {
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    role: googleUser.email === adminEmail ? "admin" : "user",
  }

  res.json({
    token: createSessionToken(user),
    user,
  })
})

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user })
})

app.get("/api/products", async (_req, res) => {
  const products = await listProductsRecord()
  res.json({ products })
})

app.post("/api/orders", async (req, res) => {
  const { username, serviceId = "", notes = "", userEmail = "", userName = "", userPicture = "" } = req.body || {}

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username || "")) {
    res.status(400).json({ message: "Enter a valid Instagram username." })
    return
  }

  const product = await findProductById(serviceId)
  if (!product) {
    res.status(400).json({ message: "Select a valid package." })
    return
  }

  if (product.isAvailable === false) {
    res.status(400).json({ message: "This card is currently out of stock." })
    return
  }

  let orderId = createOrderId()
  while (await orderExists(orderId)) {
    orderId = createOrderId()
  }

  const order = await createOrderRecord({
    id: orderId,
    username: username.trim(),
    service: `${product.title} • Rs ${product.price}`,
    service_id: product.id,
    amount: product.price,
    notes: `${notes}`.trim(),
    user_email: `${userEmail}`.trim().toLowerCase(),
    user_name: `${userName}`.trim(),
    user_picture: `${userPicture}`.trim(),
  })

  res.status(201).json({ order })
})

app.patch("/api/orders/:orderId/payment", upload.single("screenshot"), async (req, res) => {
  const transactionId = req.body?.transactionId?.trim()
  if (!transactionId) {
    res.status(400).json({ message: "Transaction ID is required." })
    return
  }

  if (!req.file) {
    res.status(400).json({ message: "Payment screenshot is required." })
    return
  }

  const order = await findOrderById(req.params.orderId)
  if (!order) {
    res.status(404).json({ message: "Order not found." })
    return
  }

  const updated = await savePaymentProof(req.params.orderId, transactionId, `/uploads/${req.file.filename}`)
  res.json({ order: updated })
})

app.get("/api/orders/:orderId", async (req, res) => {
  const order = await findOrderById(req.params.orderId)
  if (!order) {
    res.status(404).json({ message: "No order found for that ID." })
    return
  }

  res.json({ order })
})

app.get("/api/portal/orders", requireAuth, async (req, res) => {
  const orders = await listOrdersForUser(`${req.user.email}`.toLowerCase())
  res.json({ orders })
})

app.get("/api/settings/capacity", async (_req, res) => {
  res.json({ capacity: await getCapacityValue() })
})

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({ user: req.user })
})

app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "All"
  const orders = await listOrderRecords(status)
  res.json({ orders })
})

app.patch("/api/admin/orders/:orderId/status", requireAdmin, async (req, res) => {
  const { status } = req.body || {}
  if (!["Pending", "Verified", "In Progress", "Completed", "Rejected"].includes(status)) {
    res.status(400).json({ message: "Invalid status." })
    return
  }

  const order = await updateOrderRecordStatus(req.params.orderId, status)
  if (!order) {
    res.status(404).json({ message: "Order not found." })
    return
  }

  res.json({ order })
})

app.put("/api/admin/settings/capacity", requireAdmin, async (req, res) => {
  const capacity = Number(req.body?.capacity)
  if (!Number.isFinite(capacity) || capacity < 0) {
    res.status(400).json({ message: "Capacity must be a valid number." })
    return
  }

  res.json({ capacity: await setCapacityValue(capacity) })
})

app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  const products = await listProductsRecord()
  res.json({ products })
})

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const product = await createProductRecord(req.body || {})
  res.status(201).json({ product })
})

app.put("/api/admin/products/:productId", requireAdmin, async (req, res) => {
  const product = await updateProductRecord(req.params.productId, req.body || {})
  if (!product) {
    res.status(404).json({ message: "Card not found." })
    return
  }

  res.json({ product })
})

app.use((error, _req, res, next) => {
  void next
  res.status(400).json({ message: error.message || "Request failed." })
})

app.listen(port, () => {
  console.log(`Libra backend listening on http://localhost:${port}`)
  console.log(`Storage mode: ${storageMode}`)
})
