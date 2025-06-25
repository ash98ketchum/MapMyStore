/* ------------------------------------------------------------------
 *  Single-layout JSON API
 *  – GET  /api/layout   → return saved layout   (404 if none)
 *  – PUT  /api/layout   → validate & overwrite
 *  – GET  /api/health   → { ok: true }
 * ------------------------------------------------------------------ */

const express = require('express');
const cors    = require('cors');
const fs      = require('fs/promises');
const path    = require('node:path');
const { z }   = require('zod');

/* -------- paths -------------------------------------------------- */
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'currentLayout.json');

/* -------- zod schema -------------------------------------------- */
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
  name:       z.string().min(1),
  createdAt:  z.number().int(),
  scale:      z.number(),
  offset:     z.object({ x: z.number(), y: z.number() }),
  shelves:    z.array(shelfSchema),
  zones:      z.array(zoneSchema),
  roads:      z.array(roadSchema),
});

/* -------- helper fns -------------------------------------------- */
async function readLayout() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, 'utf8')); }
  catch { return null; }
}

async function writeLayout(layout) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(layout, null, 2), 'utf8');
}

/* -------- express setup ----------------------------------------- */
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// health-check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// GET layout
app.get('/api/layout', async (_req, res) => {
  const layout = await readLayout();
  if (!layout) return res.sendStatus(404);
  res.json(layout);
});

// PUT layout
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🗺️  Layout API running  →  http://localhost:${PORT}`)
);
