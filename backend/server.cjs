// server.cjs

require("dotenv").config();
console.log(
  "[GROQ] Loaded key:",
  process.env.GROQ_API_KEY?.slice(0, 10) + "..."
);
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { z } = require("zod");

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-prod";

/* ───── data files ───── */
const DATA_DIR = path.join(__dirname, "data");
const LAYOUT_FILE = path.join(DATA_DIR, "currentLayout.json");
const BEACON_FILE = path.join(DATA_DIR, "beacons.json");
const SEARCH_FILE = path.join(DATA_DIR, "searchCounts.json");
const DISCOUNT_FILE = path.join(DATA_DIR, "discount-rules.json");
const TAKEN_FILE = path.join(DATA_DIR, "discount-taken.json");

/// ensure data files exist
(async () => {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  for (const file of [SEARCH_FILE, DISCOUNT_FILE, TAKEN_FILE]) {
    try {
      await fsp.access(file);
    } catch {
      // initialize: {} for SEARCH, [] for the rest
      const init = file === SEARCH_FILE ? "{}" : "[]";
      await fsp.writeFile(file, init, "utf8");
    }
  }
})();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* ───── tiny helpers ───── */
async function readJSON(file) {
  try {
    return JSON.parse(await fsp.readFile(file, "utf8"));
  } catch {
    return null;
  }
}
async function writeJSON(file, data) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

/* ───── Zod schemas ───── */
const productOnShelf = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive(),
});
const shelfSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["aisle", "endcap", "island", "checkout"]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zone: z.string(),
  capacity: z.number(),
  products: z.array(productOnShelf),
});
const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string(),
});
const roadSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});
const layoutSchema = z.object({
  name: z.string().min(1),
  createdAt: z.number().int(),
  scale: z.number(),
  offset: z.object({ x: z.number(), y: z.number() }),
  shelves: z.array(shelfSchema),
  zones: z.array(zoneSchema),
  roads: z.array(roadSchema),
});

/* ═════════ AUTH ═════════ */
app.post("/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (
    !fullName ||
    !email ||
    !password ||
    !["admin", "customer"].includes(role)
  ) {
    return res
      .status(400)
      .json({ error: "fullName, email, password, and valid role required" });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user =
      role === "admin"
        ? await prisma.admin.create({
            data: { fullName, email, password: hashed },
          })
        : await prisma.customer.create({
            data: { fullName, email, password: hashed },
          });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already in use" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !["admin", "customer"].includes(role)) {
    return res
      .status(400)
      .json({ error: "email, password and valid role required" });
  }
  try {
    const repo = role === "admin" ? prisma.admin : prisma.customer;
    const user = await repo.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (role === "customer") {
      await prisma.customer.update({
        where: { email },
        data: { isActive: true },
      });
    }

    const token = jwt.sign({ userId: user.id, role }, JWT_SECRET, {
      expiresIn: "4h",
    });
    res.json({ token, fullName: user.fullName, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/customers/count", async (_req, res) => {
  try {
    const total = await prisma.customer.count();
    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ═════════ LAYOUT + BEACONS ═════════ */
app.get("/api/layout", async (_req, res) => {
  const layout = await readJSON(LAYOUT_FILE);
  if (!layout) return res.sendStatus(404);
  res.json(layout);
});

app.put("/api/layout", async (req, res) => {
  const parsed = layoutSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  try {
    await writeJSON(LAYOUT_FILE, parsed.data);

    // regenerate beacons
    const centre = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
    const beacons = parsed.data.shelves.map((s) => {
      const sc = { x: s.x + s.width / 2, y: s.y + s.height / 2 };
      const nearest = parsed.data.roads
        .map(centre)
        .reduce((best, c) =>
          Math.hypot(c.x - sc.x, c.y - sc.y) <
          Math.hypot(best.x - sc.x, best.y - sc.y)
            ? c
            : best
        );
      return {
        id: s.id,
        name: s.label,
        type: s.type === "checkout" ? "qr" : "ble",
        zoneId: s.zone,
        status: "online",
        x: nearest.x,
        y: nearest.y,
        batteryLevel: null,
      };
    });
    await writeJSON(BEACON_FILE, beacons);

    res.sendStatus(204);
  } catch (err) {
    console.error("[layout-save]", err);
    res.status(500).json({ error: "Failed to save layout" });
  }
});

app.get("/api/beacons", async (_req, res) => {
  res.json((await readJSON(BEACON_FILE)) || []);
});
app.patch("/api/beacons/:id", async (req, res) => {
  const list = (await readJSON(BEACON_FILE)) || [];
  const b = list.find((x) => x.id === req.params.id);
  if (!b) return res.sendStatus(404);
  if (!["online", "offline"].includes(req.body.status)) {
    return res.status(400).json({ error: "invalid status" });
  }
  b.status = req.body.status;
  await writeJSON(BEACON_FILE, list);
  res.sendStatus(204);
});

/* ═════════ DISCOUNT RULES CRUD ═════════ */
app.get("/api/discount-rules", async (_req, res) => {
  res.json((await readJSON(DISCOUNT_FILE)) || []);
});

app.post("/api/discount-rules", async (req, res) => {
  const rule = req.body;
  if (!rule.name || !rule.trigger || !rule.condition || !rule.action) {
    return res.status(400).json({ error: "missing fields" });
  }
  rule.id = rule.id || `rule-${Date.now()}`;
  const arr = (await readJSON(DISCOUNT_FILE)) || [];
  arr.push(rule);
  await writeJSON(DISCOUNT_FILE, arr);
  res.status(201).json(rule);
});

app.patch("/api/discount-rules/:id", async (req, res) => {
  const arr = (await readJSON(DISCOUNT_FILE)) || [];
  const idx = arr.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.sendStatus(404);
  if (typeof req.body.active === "boolean") {
    arr[idx].active = req.body.active;
    await writeJSON(DISCOUNT_FILE, arr);
    return res.sendStatus(204);
  }
  res.status(400).json({ error: "active boolean required" });
});

app.delete("/api/discount-rules/:id", async (req, res) => {
  const arr = (await readJSON(DISCOUNT_FILE)) || [];
  const filtered = arr.filter((r) => r.id !== req.params.id);
  await writeJSON(DISCOUNT_FILE, filtered);
  res.sendStatus(204);
});

/* ═════════ APPLY DISCOUNT ═════════ */
app.post("/api/apply-discount", async (req, res) => {
  const { ruleId } = req.body;
  if (typeof ruleId !== "string") {
    return res.status(400).json({ error: "ruleId is required" });
  }

  try {
    // read existing
    const list = (await readJSON(TAKEN_FILE)) || [];
    // append new
    list.push({ ruleId, takenAt: new Date().toISOString() });
    // write back
    await writeJSON(TAKEN_FILE, list);
    res.json({ success: true });
  } catch (err) {
    console.error("[apply-discount]", err);
    res.status(500).json({ error: "Failed to record discount" });
  }
});

/* ═════════ APPLY DISCOUNT ═════════ */
app.post("/api/apply-discount", async (req, res) => {
  const { ruleId } = req.body;
  if (typeof ruleId !== "string") {
    return res.status(400).json({ error: "ruleId is required" });
  }
  try {
    const taken = (await readJSON(TAKEN_FILE)) || [];
    taken.push({ ruleId, takenAt: new Date().toISOString() });
    await writeJSON(TAKEN_FILE, taken);
    res.json({ success: true });
  } catch (err) {
    console.error("[apply-discount]", err);
    res.status(500).json({ error: "Failed to record discount" });
  }
});

/* ═════════ SEARCH TRACKING ═════════ */
app.post("/api/search", async (req, res) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ error: "Product required" });
  const data = JSON.parse(await fsp.readFile(SEARCH_FILE, "utf8"));
  data[product] = (data[product] || 0) + 1;
  await fsp.writeFile(SEARCH_FILE, JSON.stringify(data, null, 2), "utf8");
  res.json({ message: "Search recorded" });
});

app.get("/api/search/top", async (_req, res) => {
  const data = JSON.parse(await fsp.readFile(SEARCH_FILE, "utf8"));
  const sorted = Object.entries(data).sort(([, a], [, b]) => b - a);
  res.json({ topSearches: sorted.length ? [sorted[0][0]] : [] });
});
// ───────── PRODUCT-LOCATIONS API ─────────

// GET all products from current layout with their shelf info
app.get("/api/product-locations", async (_req, res) => {
  const layout = await readJSON(LAYOUT_FILE);
  if (!layout) return res.status(404).json({ error: "No layout found" });

  const out = [];
  for (const shelf of layout.shelves) {
    for (const p of shelf.products) {
      out.push({
        productId: p.productId,
        quantity: p.qty,
        shelfId: shelf.id,
        shelfType: shelf.type,
        shelfLabel: shelf.label,
        zone: shelf.zone,
      });
    }
  }
  res.json(out);
});

// POST update a product’s shelf & quantity
app.post("/api/product-locations", async (req, res) => {
  const { productId, shelfId, qty } = req.body;
  if (!productId || !shelfId || typeof qty !== "number") {
    return res
      .status(400)
      .json({ error: "productId, shelfId and numeric qty required" });
  }

  // load layout
  const layout = await readJSON(LAYOUT_FILE);
  if (!layout) return res.status(404).json({ error: "Layout not found" });

  // remove from any shelf
  layout.shelves.forEach((s) => {
    s.products = s.products.filter((p) => p.productId !== productId);
  });

  // if qty>0, add to target shelf
  if (qty > 0) {
    const target = layout.shelves.find((s) => s.id === shelfId);
    if (!target) return res.status(404).json({ error: "Shelf not found" });
    target.products.push({ productId, qty });
  }

  // save updated layout
  await writeJSON(LAYOUT_FILE, layout);
  res.json({ success: true });
});

/* ═════════ SAVE CART ───────────── */
app.post("/api/save-cart", async (req, res) => {
  const cart = req.body;
  if (!Array.isArray(cart)) {
    return res
      .status(400)
      .json({ success: false, message: "Expected array of cart items" });
  }

  // 1) Apply active discounts
  const rules = (await readJSON(DISCOUNT_FILE)) || [];
  const activeRules = rules.filter((r) => r.active);
  const discountedCart = cart.map((item) => {
    const rule = activeRules.find(
      (r) =>
        (r.condition.type === "product" && r.condition.value === item.id) ||
        (r.condition.type === "category" && r.condition.value === item.category)
    );
    if (!rule) return item;

    const out = { ...item };
    switch (rule.action.type) {
      case "percentage":
        out.price = +(out.price * (1 - rule.action.value / 100)).toFixed(2);
        break;
      case "fixed-amount":
        out.price = +Math.max(0, out.price - rule.action.value).toFixed(2);
        break;
      case "buy-one-get-one":
        out.quantity = out.quantity + 1;
        break;
    }
    out.discountApplied = rule.id;
    return out;
  });

  // 2) Compute today's path: year/month/week/day
  const now = new Date();
  const year = now.getFullYear().toString();
  const monthName = now
    .toLocaleString("default", { month: "long" })
    .toLowerCase();
  const dayOfMonth = now.getDate();
  const week = `week${Math.floor((dayOfMonth - 1) / 7) + 1}`;
  const weekday = now
    .toLocaleString("default", { weekday: "long" })
    .toLowerCase();

  const cartDir = path.join(DATA_DIR, "cart", year, monthName, week, weekday);
  await fsp.mkdir(cartDir, { recursive: true });

  // 3) Write the cart JSON
  const fileName = `cart-${Date.now()}.json`;
  const fullPath = path.join(cartDir, fileName);
  await fsp.writeFile(
    fullPath,
    JSON.stringify(discountedCart, null, 2),
    "utf8"
  );

  res.json({
    success: true,
    message: "Cart saved",
    path: fullPath.replace(DATA_DIR + path.sep, ""),
  });
});
// ------------chatbot-------------------------------------------------
const axios = require("axios");

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are Leo, a friendly and helpful AI chatbot for MapMyStore. Always assist the customer in a kind, fun, and helpful way.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(
      "[groq-chat-error]",
      err?.response?.data || err.message || err
    );
    res.status(500).json({ error: "Leo is having a thinking error 🧠💥" });
  }
});

/* ═════════ START SERVER ═════════ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅  API ready at http://localhost:${PORT}`)
);
