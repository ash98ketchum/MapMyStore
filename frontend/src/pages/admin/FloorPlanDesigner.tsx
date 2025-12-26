// -----------------------------------------------------------------------------
// Floor-plan Designer
// – Blueprint grid with pan / zoom
// – ONE persisted layout  (PUT /api/layout, GET /api/layout)
// – Per-type auto-increment labels (Aisle 1, End Cap 1 …)
// – Each shelf’s `zone` is kept in-sync automatically
// -----------------------------------------------------------------------------

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import DraggableBox from '../../components/floorplan/DraggableBox';
import Button       from '../../components/ui/Button';
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Trash, Link2, X,
} from 'lucide-react';
import {
  Shelf, ShelfType, Zone, Road,
} from '../../types';
import {
  mockShelves, mockZones, mockProducts,
} from '../../data/mockData';
import { api } from '../../config.ts';
/* ──────────────────────────────────────────────────────────
 *  Visual constants
 * ────────────────────────────────────────────────────────── */
const PAVER   = 32;            // size of a single “road” tile
const P_FILL  = '#b4b8bd';     // road fill
const P_EDGE  = '#2f2f2f';     // road stroke

const shelfDefs: Record<ShelfType, { name: string; color: string }> = {
  aisle:    { name: 'Aisle',    color: '#00D3FF' },
  endcap:   { name: 'End Cap',  color: '#FFB547' },
  island:   { name: 'Island',   color: '#8B5CF6' },
  checkout: { name: 'Checkout', color: '#EF4444' },
};

const zonePalette = [
  { name: 'Entrance',        color: '#00D3FF' },
  { name: 'Grocery',         color: '#10B981' },
  { name: 'Snacks',          color: '#FACC15' },
  { name: 'Electronics',     color: '#8B5CF6' },
  { name: 'Health & Beauty', color: '#EF4444' },
];

/* ──────────────────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────────────────── */

/** Return the zone-id whose rectangle contains the centre of (x,y,w,h). */
function zoneForRect(
  x: number, y: number, w: number, h: number, zones: Zone[],
): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const z  = zones.find(q =>
    cx >= q.x && cx <= q.x + q.width &&
    cy >= q.y && cy <= q.y + q.height,
  );
  return z ? z.id : 'unassigned';
}

/** DFS to gather an entire connected path of road tiles. */
function collectRoad(start: string, list: Road[]): string[] {
  const map = new Map(list.map(p => [p.id, p]));
  const out = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    const p = map.get(id);
    if (!p) continue;
    for (const q of list) {
      if (out.has(q.id)) continue;
      const touching =
        (Math.abs(q.x - p.x) === PAVER && q.y === p.y) ||
        (Math.abs(q.y - p.y) === PAVER && q.x === p.x);
      if (touching) stack.push(q.id);
    }
  }
  return [...out];
}

/* ──────────────────────────────────────────────────────────
 *  Component
 * ────────────────────────────────────────────────────────── */
export default function FloorPlanDesigner() {
  /* shelves, zones, roads */
  const [shelves, setShelves] = useState<Shelf[]>(mockShelves);
  const [zones,   setZones]   = useState<Zone[]>(mockZones);
  const [roads,   setRoads]   = useState<Road[]>([]);

  /* per-type counters for clean labels */
  const shelfCounters = useRef<Record<ShelfType, number>>({
    aisle: 1, endcap: 1, island: 1, checkout: 1,
  });
  useEffect(() => {
    const c = { ...shelfCounters.current };
    shelves.forEach(s => { c[s.type] = Math.max(c[s.type], c[s.type] + 1); });
    shelfCounters.current = c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  /* selections */
  const [selShelf,   setSelShelf]   = useState<Shelf|null>(null);
  const [selZoneId,  setSelZoneId]  = useState<string|null>(null);
  const [selRoadId,  setSelRoadId]  = useState<string|null>(null);
  const [roadGroup,  setRoadGroup]  = useState<string[]>([]);

  /* first road placement flag */
  const [placingRoad, setPlacingRoad] = useState(false);

  /* pan & zoom */
  const [scale,  setScale]  = useState(1);           // 0.4 → 3
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  /* ─── block browser ctrl+wheel zoom ─── */
  useEffect(() => {
    const stop = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };
    window.addEventListener('wheel', stop, { passive: false });
    return () => window.removeEventListener('wheel', stop);
  }, []);

  /* ─── LOAD saved layout on mount ─── */
  useEffect(() => {
    fetch(api('/api/layout'))
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(l => {
        setScale(l.scale);
        setOffset(l.offset);
        setShelves(l.shelves);
        setZones(l.zones);
        setRoads(l.roads);
      })
      .catch(() => {/* no saved layout yet */});
  }, []);

  /* ────────────────────────────────────────────────────────
   *  Create helpers
   * ──────────────────────────────────────────────────────── */

  const addShelf = (t: ShelfType) =>
    setShelves(a => {
      const label = `${shelfDefs[t].name} ${shelfCounters.current[t]++}`;
      const x = 80, y = 80, w = 120, h = 40;
      return [...a, {
        id:nanoid(), type:t, label,
        x, y, width:w, height:h,
        zone: zoneForRect(x, y, w, h, zones),     // ← auto-assign
        capacity:50, products: [],
      }];
    });

  const addZone = (name: string, color: string) =>
    setZones(a => {
      const z = {
        id: `zone-${nanoid()}`, name, color,
        x: 100, y: 100, width: 180, height: 140,
      };

      /* re-label any shelves whose centres fall into the new zone */
      setShelves(s =>
        s.map(sh =>
          zoneForRect(sh.x, sh.y, sh.width, sh.height, [...a, z]) !== sh.zone
            ? { ...sh, zone: z.id }
            : sh,
        ),
      );
      return [...a, z];
    });

  /* ────────────────────────────────────────────────────────
   *  Update helpers
   * ──────────────────────────────────────────────────────── */

  const updShelf = (s: Shelf) => setShelves(a => a.map(t => (t.id === s.id ? s : t)));
  const updZone  = (z: Zone)  => setZones  (a => a.map(t => (t.id === z.id ? z : t)));
  const updRoad  = (r: Road)  => setRoads  (a => a.map(t => (t.id === r.id ? r : t)));

  /* When a shelf is dragged/resized, recalc its zone. */
  const onShelfChange = (
    orig: Shelf,
    nx: number, ny: number, nw: number, nh: number,
  ) => {
    const zid = zoneForRect(nx, ny, nw, nh, zones);
    updShelf({ ...orig, x: nx, y: ny, width: nw, height: nh, zone: zid });
  };

  /* ────────────────────────────────────────────────────────
   *  Delete / clear selection helpers (unchanged)
   * ──────────────────────────────────────────────────────── */
  const deleteSel = () => {
    if (selShelf)          { setShelves(shelves.filter(s => s.id!==selShelf.id)); setSelShelf(null); }
    else if (selZoneId)    { setZones  (zones.filter(z  => z.id!==selZoneId));    setSelZoneId(null);}
    else if (roadGroup.length) {
      setRoads(roads.filter(r => !roadGroup.includes(r.id)));
      setSelRoadId(null); setRoadGroup([]);
    } else if (selRoadId)  {
      setRoads(roads.filter(r => r.id!==selRoadId)); setSelRoadId(null);
    }
  };

  const clearSel = (keep:'shelf'|'zone'|'road'|'none') => {
    if (keep!=='shelf') setSelShelf(null);
    if (keep!=='zone')  setSelZoneId(null);
    if (keep!=='road')  { setSelRoadId(null); setRoadGroup([]); }
  };

  /* ────────────────────────────────────────────────────────
   *  Pan / zoom handlers (unchanged)
   * ──────────────────────────────────────────────────────── */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = 1 - e.deltaY / 600;
    const next   = Math.min(3, Math.max(0.4, scale * factor));
    if (next === scale) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left - offset.x;
    const py = e.clientY - rect.top  - offset.y;
    const z  = next / scale;
    setOffset({ x: offset.x + px - px*z, y: offset.y + py - py*z });
    setScale(next);
  };
  const startPan = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-draggable="true"]')) return;
    if (e.button !== 0) return;
    e.preventDefault();
    setPanning(true);
    panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    document.body.style.cursor = 'grabbing';
  };
  const doPan  = (e: React.MouseEvent) =>
    panning && setOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  const endPan = () => { setPanning(false); document.body.style.cursor = 'default'; };

  /* ────────────────────────────────────────────────────────
   *  Road placement helpers (unchanged)
   * ──────────────────────────────────────────────────────── */
    const placeRoadStart = (e: React.MouseEvent) => {
      console.log('canvas clicked:', placingRoad);
      if (!placingRoad || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const wx = (e.clientX - rect.left - offset.x) / scale;
    const wy = (e.clientY - rect.top  - offset.y) / scale;
    const r:Road = { id:nanoid(), x:wx-PAVER/2, y:wy-PAVER/2, width:PAVER, height:PAVER };
    setRoads(a => [...a,r]);
    setSelRoadId(r.id); setRoadGroup([]);
    setPlacingRoad(false);
    setSelShelf(null); setSelZoneId(null);
  };
  const extendRoad = (dir:'left'|'right'|'up'|'down') => {
    if (!selRoadId) return;
    const base = roads.find(r => r.id===selRoadId)!;
    const r:Road = {
      id:nanoid(),
      x: dir==='left'? base.x-PAVER : dir==='right'? base.x+PAVER : base.x,
      y: dir==='up'?   base.y-PAVER : dir==='down'?  base.y+PAVER : base.y,
      width:PAVER, height:PAVER,
    };
    setRoads(a => [...a,r]);
    setSelRoadId(r.id); setRoadGroup([]);
  };

  /* ────────────────────────────────────────────────────────
   *  SAVE layout (PUT /api/layout)
   * ──────────────────────────────────────────────────────── */
  const handleSaveLayout = async () => {
    /* final sweep – ensure every shelf’s zone field is correct */
    const fixedShelves = shelves.map(s => ({
      ...s,
      zone: zoneForRect(s.x, s.y, s.width, s.height, zones),
    }));
    setShelves(fixedShelves);

    const payload = {
      name      : 'Current Layout',
      createdAt : Date.now(),
      scale,
      offset,
      shelves   : fixedShelves,
      zones,
      roads,
    };

    try {
      const res = await fetch(api('/api/layout'), {
        method : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Layout saved!');
    } catch (err:any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  /* ────────────────────────────────────────────────────────
   *  Shelf side-panel state (unchanged)
   * ──────────────────────────────────────────────────────── */
  const [query, setQuery] = useState('');
  const suggestions = useMemo(() => (
    query.trim()
      ? mockProducts.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()))
      : []
  ), [query]);

  const addProdToShelf = (prodId: string) => {
    if (!selShelf) return;
    const target = shelves.find(s => s.id === selShelf.id)!;
    const existing = target.products.find(p => p.productId === prodId);
    let newProds;
    if (existing) {
      newProds = target.products.map(p =>
        p.productId === prodId ? { ...p, qty: p.qty + 1 } : p,
      );
    } else {
      newProds = [...target.products, { productId: prodId, qty: 1 }];
    }
    updShelf({ ...target, products: newProds });
    setSelShelf({ ...target, products: newProds });
    setQuery('');
  };
  const setQty = (prodId:string, qty:number) => {
    if (!selShelf) return;
    const newProds = selShelf.products.map(p =>
      p.productId === prodId ? { ...p, qty } : p,
    );
    updShelf({ ...selShelf, products: newProds });
    setSelShelf({ ...selShelf, products: newProds });
  };
  const delProd = (prodId:string) => {
    if (!selShelf) return;
    const newProds = selShelf.products.filter(p => p.productId !== prodId);
    updShelf({ ...selShelf, products: newProds });
    setSelShelf({ ...selShelf, products: newProds });
  };

  /* ────────────────────────────────────────────────────────
   *  JSX
   * ──────────────────────────────────────────────────────── */
  return (
    <div className="h-full flex overflow-hidden select-none">
      <aside className="w-64 bg-white/20 backdrop-blur-2xl p-4 space-y-3 rounded-xl shadow-xl overflow-y-auto border border-white/30 relative z-20">
        <h2 className="font-extrabold text-gray-800 text-3xl mb-2">Palette</h2>

        {Object.keys(shelfDefs).map(t => (
          <Button
            key={t}
            className="w-full px-4 py-2 rounded-xl text-lg font-semibold text-black bg-gradient-to-r from-sky-500 to-blue-500 shadow-lg border border-white/30 backdrop-blur-md hover:brightness-110 transition duration-200"
            onClick={() => addShelf(t as ShelfType)}
          >
            + {shelfDefs[t as ShelfType].name}
          </Button>
        ))}

        <h3 className="font-bold text-black text-3xl mt-4">Sections</h3>
        {zonePalette.map(z => (
          <Button
            key={z.name}
            className={`w-full px-4 py-2 rounded-xl border border-white/20 backdrop-blur-md bg-white/50 shadow !text-black hover:!text-white hover:bg-sky/20 transition duration-200`}
            onClick={() => addZone(z.name, z.color)}
          >
            + {z.name}
          </Button>
        ))}

        <Button
          className={`w-full px-4 py-2 rounded-xl text-black/70 text-lg font-semibold mt-4 shadow-lg backdrop-blur-md transition duration-200 ${
            placingRoad
              ? 'bg-red-500 hover:bg-red-600 border border-white/30'
              : 'bg-green-700 text-white-50 border border-white/20 hover:bg-green-800 hover:text-white/80'
          }`}
          onClick={() => {
            setPlacingRoad(!placingRoad)
            clearSel('none')
          }}
        >
          {placingRoad ? 'Cancel Path' : 'Add Path'}
        </Button>

        <Button
          className="w-full px-4 py-2 mt-2 rounded-xl text-lg font-bold text-black bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg border border-white/30 backdrop-blur-md hover:brightness-110 transition duration-200"
          onClick={handleSaveLayout}
        >
          Save Layout
        </Button>

        {selRoadId && (
          <div className="grid grid-cols-3 gap-0.5 w-max mx-auto mt-3">
            <div />
            <Button
              className="w-10 h-10 bg-white/30 !text-black hover:!bg-gray-300 hover:!text-white !shadow rounded-b-none"
              variant="secondary"
              onClick={() => extendRoad('up')}
            >
              <ChevronUp size={18} />
            </Button>
            <div />

            <Button
              className="w-10 h-10 bg-white/30 !text-black hover:!bg-gray-300 hover:!text-white !shadow rounded-r-none"
              variant="secondary"
              onClick={() => extendRoad('left')}
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              className="w-10 h-10 bg-white/30 !text-black hover:!bg-gray-300 hover:!text-white !shadow"
              variant="secondary"
              onClick={() => setRoadGroup(collectRoad(selRoadId, roads))}
            >
              <Link2 size={16} />
            </Button>
            <Button
              className="w-10 h-10 bg-white/30 !text-black hover:!bg-gray-300 hover:!text-white !shadow rounded-l-none"
              variant="secondary"
              onClick={() => extendRoad('right')}
            >
              <ChevronRight size={18} />
            </Button>

            <div />
            <Button
              className="w-10 h-10 bg-white/30 !text-black hover:!bg-gray-300 hover:!text-white !shadow rounded-t-none"
              variant="secondary"
              onClick={() => extendRoad('down')}
            >
              <ChevronDown size={18} />
            </Button>
            <div />
          </div>
        )}


        {(selShelf || selZoneId || selRoadId) && (
          <Button
  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl !shadow"
  onClick={deleteSel}
>
  <Trash size={16} /> Delete
</Button>


        )}
      </aside>


      {/* ───────────────── Canvas wrapper ───────────────── */}
      <div
        className="flex-1 relative overflow-hidden bg-[#0C1C33]"
        onWheel={onWheel}
        onMouseDown={startPan}
        onMouseMove={doPan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onContextMenu={e => e.preventDefault()}
      >
        {/* blueprint grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg , transparent 0 19px , #153055 19px 20px),
              repeating-linear-gradient(90deg, transparent 0 19px , #153055 19px 20px),
              repeating-linear-gradient(0deg , transparent 0 99px , #1d3b63 99px 100px),
              repeating-linear-gradient(90deg, transparent 0 99px , #1d3b63 99px 100px)
            `,
            backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
          }}
        />
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAGUlEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAACAf8YBAAB+fAsGAAAAAElFTkSuQmCC")',
          }}
        />

        {/* pan / zoom surface */}
        <div
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full overflow-visible z-10"
          onClick={placeRoadStart}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: 'transform 80ms ease-out',
          }}
        >

          {/* ──────────── zones ──────────── */}
          {zones.map(z => (
            <DraggableBox
              key={z.id}
              id={z.id}
              scale={scale}
              data-draggable="true"
              x={z.x} y={z.y} w={z.width} h={z.height}
              selected={selZoneId === z.id}
              onSelect={() => { setSelZoneId(z.id); clearSel('zone'); }}
              onChange={(id, nx, ny, nw, nh) =>
                updZone({ ...z, x: nx, y: ny, width: nw, height: nh })
              }
              style={{
                background: `${z.color}33`,
                border: `2px dashed ${selZoneId === z.id ? '#38bdf8' : z.color}`,
                zIndex: 10,
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none"
                style={{ color: selZoneId === z.id ? '#38bdf8' : z.color }}
              >
                {z.name}
              </div>
            </DraggableBox>
          ))}

          {/* ──────────── shelves ──────────── */}
          {shelves.map(s => (
            <DraggableBox
              key={s.id}
              id={s.id}
              scale={scale}
              data-draggable="true"
              x={s.x} y={s.y} w={s.width} h={s.height}
              selected={selShelf?.id === s.id}
              onSelect={() => { setSelShelf(s); clearSel('shelf'); }}
              onChange={(id, nx, ny, nw, nh) => onShelfChange(s, nx, ny, nw, nh)}
              style={{
                background: `linear-gradient(135deg, ${shelfDefs[s.type].color} 0%, #ffffff33 100%)`,
                zIndex: 20,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white/90 text-xs font-bold pointer-events-none">
                {s.label}
              </div>
            </DraggableBox>
          ))}

          {/* ──────────── roads ──────────── */}
          {roads.map(r => {
            const sel = selRoadId === r.id || roadGroup.includes(r.id);
            return (
              <DraggableBox
                key={r.id}
                id={r.id}
                scale={scale}
                data-draggable="true"
                x={r.x} y={r.y} w={r.width} h={r.height}
                selected={sel}
                onSelect={() => { setSelRoadId(r.id); setRoadGroup([]); clearSel('road'); }}
                onChange={(id, nx, ny) => (
                  roadGroup.length > 1
                    ? setRoads(list => list.map(t =>
                        roadGroup.includes(t.id)
                          ? { ...t, x: t.x + nx - r.x, y: t.y + ny - r.y }
                          : t,
                      ))
                    : updRoad({ ...r, x: nx, y: ny })
                )}
                style={{
                  background: P_FILL,
                  border: `3px solid ${P_EDGE}`,
                  borderRadius: 4,
                  boxShadow: sel
                    ? '0 0 6px 2px #38bdf8, 0 2px 6px #0006'
                    : '0 2px 4px #0004',
                  transition: 'box-shadow .15s',
                  zIndex: 30,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ───────────────── Shelf side-panel ───────────────── */}
      {selShelf && (
        <div className="w-80 bg-white/90 border-l border-gray-200 text-black p-4 space-y-4 backdrop-blur-sm shadow-xl rounded-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Edit Shelf</h3>
            <Button
  size="icon"
  className="bg-red-600 hover:bg-red-700 text-white"
  icon={<X className="h-4 w-4" />}
  onClick={() => setSelShelf(null)}
/>

          </div>

          {/* label (rename) */}
          <label className="text-xs font-semibold">Label</label>
          <input
            className="w-full bg-glass border border-glass px-2 py-1 rounded"
            value={selShelf.label}
            onChange={e => {
              const updated = { ...selShelf, label: e.target.value };
              updShelf(updated);
              setSelShelf(updated);
            }}
          />

          {/* product search */}
          <div className="space-y-1">
            <label className="text-xs font-semibold">Add Item</label>
            <input
              className="w-full bg-glass border border-glass px-2 py-1 rounded"
              placeholder="Search product…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-glass border border-glass rounded text-sm shadow-lg">
                {suggestions.map(p => (
                  <div
                    key={p.id}
                    className="px-2 py-1 hover:bg-sky-600 hover:text-white cursor-pointer"
                    onClick={() => addProdToShelf(p.id)}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* current items */}
          <div>
            <h4 className="font-semibold text-sm mb-1">Items on Shelf</h4>
            {selShelf.products.length === 0
              ? <p className="text-xs text-gray-400">– empty –</p>
              : (
                <ul className="space-y-1 text-xs">
                  {selShelf.products.map(p => {
                    const prod = mockProducts.find(mp => mp.id === p.productId);
                    return (
                      <li key={p.productId} className="flex justify-between items-center">
                        <span>{prod?.name || p.productId}</span>
                        <span className="flex items-center gap-1">
                          <input
                            type="number" min={1}
                            value={p.qty}
                            onChange={e => setQty(p.productId, Math.max(1, +e.target.value))}
                            className="w-16 border border-gray-300 rounded px-1 py-0.5 text-right text-black bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <Button
  size="icon"
  className="bg-red-600 hover:bg-red-700 text-white"
  icon={<Trash size={12} />}
  onClick={() => delProd(p.productId)}
/>

                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
