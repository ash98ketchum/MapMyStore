const express = require('express');
const fs      = require('fs');
const path    = require('node:path');
const { z }   = require('zod');

/* file path */
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'currentLayout.json');

/* schema */
const layoutSchema = z.object({
  name:       z.string().min(1),
  createdAt:  z.number().int(),
  scale:      z.number(),
  offset:     z.object({ x: z.number(), y: z.number() }),
  shelves:    z.array(z.any()),
  zones:      z.array(z.any()),
  roads:      z.array(z.any()),
});

/* helpers */
function writeLayout(layout) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(layout, null, 2), 'utf8');
}
function readLayout() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return null; }
}

/* express */
const app = express();
app.use(express.json({ limit: '1mb' }));

/* GET  /api/layout  – read the single layout */
app.get('/api/layout', (_req, res) => {
  const layout = readLayout();
  if (!layout) return res.sendStatus(404);
  res.json(layout);
});

/* PUT /api/layout  – create or replace */
app.put('/api/layout', (req, res) => {
  const parsed = layoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  writeLayout(parsed.data);
  res.sendStatus(204);          // no content, success
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Single-layout API ready → http://localhost:${PORT}`)
);
