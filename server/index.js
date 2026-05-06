import bcrypt from "bcryptjs"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

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
const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password"
const jwtSecret = process.env.JWT_SECRET || "change-this-jwt-secret"
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    service: { type: String, required: true },
    notes: { type: String, default: "" },
    transaction_id: { type: String, default: "" },
    screenshot_url: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Verified", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
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

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema)
const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema)

const memoryStore = {
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
    storageMode = "mongo"
  } catch (error) {
    console.warn("Mongo connection failed, falling back to in-memory preview store:", error.message)
    storageMode = "memory"
  }
}

await bootstrapStorage()

app.use(
  cors({
    origin: [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
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

function createOrderId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `IG-${random}`
}

function createAdminToken() {
  return jwt.sign({ email: adminEmail, role: "admin" }, jwtSecret, { expiresIn: "7d" })
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""

  if (!token) {
    res.status(401).json({ message: "Admin token missing." })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    if ((payload.email || "").toLowerCase() !== adminEmail) {
      res.status(403).json({ message: "Forbidden." })
      return
    }
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ message: "Invalid admin token." })
  }
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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, storageMode })
})

app.post("/api/orders", async (req, res) => {
  const { username, service, notes = "" } = req.body || {}

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username || "")) {
    res.status(400).json({ message: "Enter a valid Instagram username." })
    return
  }

  if (!service?.trim()) {
    res.status(400).json({ message: "Service is required." })
    return
  }

  let orderId = createOrderId()
  while (await orderExists(orderId)) {
    orderId = createOrderId()
  }

  const order = await createOrderRecord({
    id: orderId,
    username: username.trim(),
    service: service.trim(),
    notes: notes.trim(),
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

app.get("/api/settings/capacity", async (_req, res) => {
  res.json({ capacity: await getCapacityValue() })
})

app.post("/api/admin/login", async (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase()
  const password = req.body?.password || ""

  if (email !== adminEmail) {
    res.status(403).json({ message: "Only the approved admin email can log in." })
    return
  }

  const passwordMatches =
    adminPassword.startsWith("$2")
      ? await bcrypt.compare(password, adminPassword)
      : password === adminPassword

  if (!passwordMatches) {
    res.status(401).json({ message: "Incorrect admin password." })
    return
  }

  res.json({
    token: createAdminToken(),
    user: { email: adminEmail },
  })
})

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({ user: { email: req.admin.email } })
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

app.use((error, _req, res) => {
  res.status(400).json({ message: error.message || "Request failed." })
})

app.listen(port, () => {
  console.log(`Libra backend listening on http://localhost:${port}`)
  console.log(`Storage mode: ${storageMode}`)
})
