require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { z } = require('zod');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-prod';

const DATA_DIR = path.join(__dirname, 'data');
const LAYOUT_FILE = path.join(DATA_DIR, 'currentLayout.json');
const BEACON_FILE = path.join(DATA_DIR, 'beacons.json');
const SEARCH_FILE = path.join(DATA_DIR, 'searchCounts.json');

// Ensure data directory and search file exist
(async () => {
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    await fsp.access(SEARCH_FILE);
  } catch {
    await fsp.writeFile(SEARCH_FILE, JSON.stringify({}), 'utf8');
  }
})();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Helpers
async function readJSON(file) {
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}
async function writeJSON(file, data) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Zod layout schema ───
const productOnShelf = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive(),
});
const shelfSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['aisle', 'endcap', 'island', 'checkout']),
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

// ─────────────────────────────────────
// 🔐 AUTH
// ─────────────────────────────────────
app.post('/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !['admin', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'fullName, email, password and valid role required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = role === 'admin'
      ? await prisma.admin.create({ data: { fullName, email, password: hashed } })
      : await prisma.customer.create({ data: { fullName, email, password: hashed } });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !['admin', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'email, password and valid role required' });
  }
  try {
    const repo = role === 'admin' ? prisma.admin : prisma.customer;
    const user = await repo.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (role === 'customer') {
      await prisma.customer.update({
        where: { email },
        data: { isActive: true }
      });
    }

    const token = jwt.sign({ userId: user.id, role }, JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, fullName: user.fullName, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Active Customers Count ───
app.get('/api/customers/count', async (req, res) => {
  try {
    const total = await prisma.customer.count();
    res.json({ total });
  } catch (err) {
    console.error('Error fetching customer count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Health Check ───
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ─────────────────────────────────────
// 📦 LAYOUT + BEACONS
// ─────────────────────────────────────
app.get('/api/layout', async (_req, res) => {
  const layout = await readJSON(LAYOUT_FILE);
  if (!layout) return res.sendStatus(404);
  res.json(layout);
});

app.put('/api/layout', async (req, res) => {
  const parsed = layoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    await writeJSON(LAYOUT_FILE, parsed.data);
    const beacons = parsed.data.shelves.map(s => ({
      id: s.id,
      name: s.label,
      type: s.type === 'checkout' ? 'qr' : 'ble',
      zoneId: s.zone,
      status: 'online',
      x: s.x,
      y: s.y,
      batteryLevel: undefined,
    }));
    await writeJSON(BEACON_FILE, beacons);
    res.sendStatus(204);
  } catch (err) {
    console.error('[layout-save]', err);
    res.status(500).json({ error: 'Failed to save layout' });
  }
});

// ─── Beacons GET / DELETE ───
app.get('/api/beacons', async (_req, res) => {
  res.json(await readJSON(BEACON_FILE) || []);
});

app.delete('/api/beacons/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const list = await readJSON(BEACON_FILE) || [];
    const next = list.filter(b => b.id !== id);
    if (next.length === list.length) return res.sendStatus(404);
    await writeJSON(BEACON_FILE, next);
    res.sendStatus(204);
  } catch (err) {
    console.error('[beacon-delete]', err);
    res.status(500).json({ error: 'Failed to delete beacon' });
  }
});

// ─────────────────────────────────────
// 🔍 SEARCH TRACKING (Top Search)
// ─────────────────────────────────────
app.post('/api/search', async (req, res) => {
  const { product } = req.body;
  if (!product) return res.status(400).json({ error: 'Product is required' });

  try {
    const data = JSON.parse(await fsp.readFile(SEARCH_FILE, 'utf-8'));
    data[product] = (data[product] || 0) + 1;
    await fsp.writeFile(SEARCH_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.status(200).json({ message: 'Search recorded' });
  } catch (err) {
    console.error('[search]', err);
    res.status(500).json({ error: 'Failed to record search' });
  }
});

app.get('/api/search/top', async (_req, res) => {
  try {
    const data = JSON.parse(await fsp.readFile(SEARCH_FILE, 'utf-8'));
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a);
    const topSearches = sorted.length > 0 ? [sorted[0][0]] : [];
    res.json({ topSearches });
  } catch (err) {
    console.error('[top-searches]', err);
    res.status(500).json({ error: 'Failed to load top searches' });
  }
});

// ─────────────────────────────────────
// 🛒 Save Cart
// ─────────────────────────────────────
app.post('/api/save-cart', async (req, res) => {
  const cart = req.body;
  if (!Array.isArray(cart)) return res.status(400).json({ success: false, message: 'Expected array of cart items' });

  try {
    const fileName = `cart-${Date.now()}.json`;
    await fsp.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(cart, null, 2), 'utf8');
    res.json({ success: true, message: 'Cart saved', file: fileName });
  } catch (err) {
    console.error('[save-cart]', err);
    res.status(500).json({ success: false, message: 'Failed to save cart' });
  }
});

// ─────────────────────────────────────
// 🚀 Start Server
// ─────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
