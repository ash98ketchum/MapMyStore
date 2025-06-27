// index.js

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const fs      = require('fs/promises');
const path    = require('path');
const { z }   = require('zod');

const app        = express();
const prisma     = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-prod';
const DATA_DIR   = path.join(__dirname, 'data');
const DATA_FILE  = path.join(DATA_DIR, 'currentLayout.json');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

/** Helper: read saved layout **/
async function readLayout() {
  try {
    const txt = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

/** Helper: write new layout **/
async function writeLayout(layout) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(layout, null, 2), 'utf8');
}

/** Zod schemas for layout validation **/
const productOnShelf = z.object({
  productId: z.string().min(1),
  qty:       z.number().int().positive(),
});
const shelfSchema = z.object({
  id:        z.string(),
  label:     z.string(),
  type:      z.enum(['aisle', 'endcap', 'island', 'checkout']),
  x:         z.number(),
  y:         z.number(),
  width:     z.number(),
  height:    z.number(),
  zone:      z.string(),
  capacity:  z.number(),
  products:  z.array(productOnShelf),
});
const zoneSchema = z.object({
  id:     z.string(),
  name:   z.string(),
  x:      z.number(),
  y:      z.number(),
  width:  z.number(),
  height: z.number(),
  color:  z.string(),
});
const roadSchema = z.object({
  id:     z.string(),
  x:      z.number(),
  y:      z.number(),
  width:  z.number(),
  height: z.number(),
});
const layoutSchema = z.object({
  name:      z.string().min(1),
  createdAt: z.number().int(),
  scale:     z.number(),
  offset:    z.object({ x: z.number(), y: z.number() }),
  shelves:   z.array(shelfSchema),
  zones:     z.array(zoneSchema),
  roads:     z.array(roadSchema),
});

/** AUTH — Sign Up **/
app.post('/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !['admin','customer'].includes(role)) {
    return res.status(400).json({ error: 'fullName, email, password and valid role required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = (role === 'admin')
      ? await prisma.admin.create({ data: { fullName, email, password: hashed } })
      : await prisma.customer.create({ data: { fullName, email, password: hashed } });
    res.status(201).json({ id: user.id, email: user.email });
  
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** AUTH — Sign In **/
app.post('/signin', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !['admin','customer'].includes(role)) {
    return res.status(400).json({ error: 'email, password and valid role required' });
  }

  try {
    const repo = (role === 'admin') ? prisma.admin : prisma.customer;
    const user = await repo.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role }, JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, fullName: user.fullName, email: user.email });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** HEALTH-CHECK **/
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/** LAYOUT — GET **/
app.get('/api/layout', async (_req, res) => {
  const layout = await readLayout();
  if (!layout) return res.sendStatus(404);
  res.json(layout);
});

/** LAYOUT — PUT **/
app.put('/api/layout', async (req, res) => {
  const parsed = layoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  try {
    await writeLayout(parsed.data);
    res.sendStatus(204);
  } catch (err) {
    console.error('[layout-save]', err);
    res.status(500).json({ error: 'Failed to save layout' });
  }
});

/** SAVE CART **/
app.post('/api/save-cart', async (req, res) => {
  const cart = req.body;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ success: false, message: 'Expected array of cart items' });
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const fileName = `cart-${Date.now()}.json`;
    await fs.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(cart, null, 2), 'utf8');
    res.json({ success: true, message: 'Cart saved', file: fileName });
  } catch (err) {
    console.error('[save-cart]', err);
    res.status(500).json({ success: false, message: 'Failed to save cart' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
