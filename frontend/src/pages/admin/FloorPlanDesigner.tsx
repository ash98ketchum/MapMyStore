// -----------------------------------------------------------------------------
// Floor-plan Designer
// – Blueprint grid, smooth pan/zoom
// – Saves ONE layout to /api/layout (overwrites each time)
// – Loads that layout automatically on page refresh or server restart
// -----------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import DraggableBox from '../../components/floorplan/DraggableBox';
import Button from '../../components/ui/Button';
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Trash, Link2,
} from 'lucide-react';
import { Shelf, ShelfType, Zone, Road } from '../../types';
import { mockShelves, mockZones } from '../../data/mockData';

/* ─── constants ─── */
const PAVER   = 32;
const P_FILL  = '#b4b8bd';
const P_EDGE  = '#2f2f2f';

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

/* ─── helper: collect connected road tiles ─── */
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

/* ─── component ─── */
export default function FloorPlanDesigner() {
  /* shelves, zones, roads */
  const [shelves, setShelves] = useState<Shelf[]>(mockShelves);
  const [zones,   setZones]   = useState<Zone[]>(mockZones);
  const [roads,   setRoads]   = useState<Road[]>([]);

  /* counters for new IDs */
  const shelfN = useRef(mockShelves.length + 1);
  const zoneN  = useRef(1);

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

  /* ─── block browser’s ctrl+wheel zoom ─── */
  useEffect(() => {
    const stop = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };
    window.addEventListener('wheel', stop, { passive: false });
    return () => window.removeEventListener('wheel', stop);
  }, []);

  /* ─── LOAD saved layout on mount ─── */
  useEffect(() => {
    fetch('/api/layout')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(l => {
        setScale(l.scale);
        setOffset(l.offset);
        setShelves(l.shelves);
        setZones(l.zones);
        setRoads(l.roads);
      })
      .catch(() => {
        /* no saved layout yet: keep mock data */
      });
  }, []);

  /* ─── wheel-zoom ─── */
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

  /* ─── panning ─── */
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

  /* ─── create helpers ─── */
  const addShelf = (t: ShelfType) =>
    setShelves(a => [...a, {
      id:nanoid(), label:`#${shelfN.current++}`, type:t,
      x:80, y:80, width:120, height:40,
      zone:'unassigned', capacity:50, products:[],
    }]);

  const addZone = (name:string, color:string) =>
    setZones(a => [...a, {
      id:`zone-${zoneN.current++}`, name, color,
      x:100, y:100, width:180, height:140,
    }]);

  /* ─── first road tile ─── */
  const placeRoadStart = (e: React.MouseEvent) => {
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

  /* ─── extend road ─── */
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

  /* ─── update helpers ─── */
  const updShelf = (s:Shelf) => setShelves(a => a.map(t => t.id===s.id? s:t));
  const updZone  = (z:Zone)  => setZones  (a => a.map(t => t.id===z.id? z:t));
  const updRoad  = (r:Road)  => setRoads  (a => a.map(t => t.id===r.id? r:t));

  /* ─── delete helpers ─── */
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

  /* ─── SAVE layout (PUT /api/layout) ─── */
  const handleSaveLayout = async () => {
    const payload = {
      name      : 'Current Layout',
      createdAt : Date.now(),
      scale,
      offset,
      shelves,
      zones,
      roads,
    };
    try {
      const res = await fetch('/api/layout', {
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

  /* ─── JSX ─── */
  return (
    <div className="h-full flex overflow-hidden select-none">
      {/* ── Palette ── */}
      <aside className="w-64 bg-glass p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <h2 className="font-bold">Palette</h2>
        {Object.keys(shelfDefs).map(t => (
          <Button key={t} className="w-full" onClick={() => addShelf(t as ShelfType)}>
            + {shelfDefs[t as ShelfType].name}
          </Button>
        ))}
        <h3 className="font-semibold mt-2">Sections</h3>
        {zonePalette.map(z => (
          <Button key={z.name} variant="secondary" className="w-full"
                  onClick={() => addZone(z.name, z.color)}>
            + {z.name}
          </Button>
        ))}
        <Button variant={placingRoad ? 'primary' : 'secondary'} className="w-full mt-3"
                onClick={() => { setPlacingRoad(!placingRoad); clearSel('none'); }}>
          {placingRoad ? 'Cancel Path' : 'Add Path'}
        </Button>
        <Button variant="primary" className="w-full" onClick={handleSaveLayout}>
          Save Layout
        </Button>

        {/* D-pad & link */}
        {selRoadId && (
          <div className="grid grid-cols-3 gap-0.5 w-max mx-auto mt-3">
            <div />
            <Button variant="secondary" className="w-10 h-10 rounded-b-none"
                    onClick={() => extendRoad('up')}><ChevronUp size={18}/></Button>
            <div />
            <Button variant="secondary" className="w-10 h-10 rounded-r-none"
                    onClick={() => extendRoad('left')}><ChevronLeft size={18}/></Button>
            <Button variant="secondary" className="w-10 h-10"
                    onClick={() => setRoadGroup(collectRoad(selRoadId, roads))}>
              <Link2 size={16}/>
            </Button>
            <Button variant="secondary" className="w-10 h-10 rounded-l-none"
                    onClick={() => extendRoad('right')}><ChevronRight size={18}/></Button>
            <div />
            <Button variant="secondary" className="w-10 h-10 rounded-t-none"
                    onClick={() => extendRoad('down')}><ChevronDown size={18}/></Button>
            <div />
          </div>
        )}

        {(selShelf || selZoneId || selRoadId) && (
          <Button className="w-full mt-3 flex items-center justify-center gap-2
                             bg-red-600 hover:bg-red-700 text-white"
                  onClick={deleteSel}>
            <Trash size={16}/> Delete
          </Button>
        )}
      </aside>

      {/* ── Canvas wrapper ── */}
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

        {/* pan/zoom surface */}
        <div
          ref={canvasRef}
          className="relative w-full h-full overflow-visible z-10"
          onClick={placeRoadStart}
          style={{
            transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: 'transform 80ms ease-out',
          }}
        >
          {/* zones */}
          {zones.map(z => (
            <DraggableBox key={z.id} id={z.id} scale={scale} data-draggable="true"
              x={z.x} y={z.y} w={z.width} h={z.height}
              selected={selZoneId===z.id}
              onSelect={() => { setSelZoneId(z.id); clearSel('zone'); }}
              onChange={(id,nx,ny,nw,nh)=>updZone({ ...z,x:nx,y:ny,width:nw,height:nh })}
              style={{
                background:`${z.color}33`,
                border:`2px dashed ${selZoneId===z.id? '#38bdf8': z.color}`,
                zIndex:10,
              }}>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none"
                   style={{ color: selZoneId===z.id? '#38bdf8': z.color }}>
                {z.name}
              </div>
            </DraggableBox>
          ))}

          {/* shelves */}
          {shelves.map(s => (
            <DraggableBox key={s.id} id={s.id} scale={scale} data-draggable="true"
              x={s.x} y={s.y} w={s.width} h={s.height}
              selected={selShelf?.id===s.id}
              onSelect={()=>{ setSelShelf(s); clearSel('shelf'); }}
              onChange={(id,nx,ny,nw,nh)=>updShelf({ ...s,x:nx,y:ny,width:nw,height:nh })}
              style={{
                background:`linear-gradient(135deg, ${shelfDefs[s.type].color} 0%, #ffffff33 100%)`,
                zIndex:20,
              }}>
              <div className="absolute inset-0 flex items-center justify-center text-white/90 text-xs font-bold pointer-events-none">
                {s.label}
              </div>
            </DraggableBox>
          ))}

          {/* roads */}
          {roads.map(r => {
            const sel = selRoadId===r.id || roadGroup.includes(r.id);
            return (
              <DraggableBox key={r.id} id={r.id} scale={scale} data-draggable="true"
                x={r.x} y={r.y} w={r.width} h={r.height}
                selected={sel}
                onSelect={()=>{ setSelRoadId(r.id); setRoadGroup([]); clearSel('road'); }}
                onChange={(id,nx,ny)=>{
                  if (roadGroup.length>1) {
                    const dx = nx - r.x, dy = ny - r.y;
                    setRoads(list => list.map(t =>
                      roadGroup.includes(t.id)?{...t,x:t.x+dx,y:t.y+dy}:t));
                  } else updRoad({ ...r,x:nx,y:ny });
                }}
                style={{
                  background:P_FILL,
                  border:`3px solid ${P_EDGE}`,
                  borderRadius:4,
                  boxShadow: sel
                    ? '0 0 6px 2px #38bdf8, 0 2px 6px #0006'
                    : '0 2px 4px #0004',
                  transition:'box-shadow .15s',
                  zIndex:30,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* shelf side panel */}
      {selShelf && (
        <div className="w-72 bg-glass border-l border-glass p-4 space-y-3">
          <h3 className="font-bold">Shelf</h3>
          <label className="text-xs">Label</label>
          <input
            className="w-full bg-glass border border-glass px-2 py-1 rounded"
            value={selShelf.label}
            onChange={e=>updShelf({ ...selShelf, label:e.target.value })}
          />
          <Button variant="secondary" className="w-full" onClick={()=>setSelShelf(null)}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
