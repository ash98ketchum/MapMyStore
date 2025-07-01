import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Position, Road, Beacon } from '../../types';
import { mockProducts } from '../../data/mockData';

/*── Configuration ─────────────────────────────────────────*/
const BEACON_RADIUS = 80;  // px around beacon to trigger stop
const STEP_DELAY    = 500; // ms per step

/*── Color constants ────────────────────────────────────────*/
const AISLE     = '#00D3FF';
const ENDCAP    = '#FFB547';
const ISLAND    = '#8B5CF6';
const CHECKOUT  = '#EF4444';
const ROAD_FILL = '#b4b8bd';
const ROAD_EDGE = '#2f2f2f';
const PATH_DONE = '#00E5FF55';
const PATH_NEXT = '#00E5FF';

/*── Helpers ───────────────────────────────────────────────*/
const centre = (r: Road): Position => ({
  x: Math.round(r.x + r.width / 2),
  y: Math.round(r.y + r.height / 2),
});
const key = (p: Position) => `${p.x}|${p.y}`;
const eq  = (a: Position, b: Position) => a.x === b.x && a.y === b.y;

/*── Stop type ─────────────────────────────────────────────*/
type Stop = {
  index: number;
  name:  string;
  type:  'beacon' | 'destination';
};

export default function MapNavigation() {
  /* Layout & beacons */
  const [layout,  setLayout]  = useState<Layout | null>(null);
  const [beacons, setBeacons] = useState<Beacon[]>([]);

  /* Search UI */
  const [query,   setQuery]   = useState('');
  const [sug,     setSug]     = useState<typeof mockProducts>([]);
  const [showSug, setShowSug] = useState(false);

  /* Pan & zoom */
  const [scale,   setScale]   = useState(1);
  const [offset,  setOffset]  = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const pan0 = useRef({ x: 0, y: 0 });
  const canvas = useRef<HTMLDivElement>(null);

  /* Path, stops, avatar */
  const [dest,           setDest]           = useState<Position | null>(null);
  const [path,           setPath]           = useState<Position[]>([]);
  const [stops,          setStops]          = useState<Stop[]>([]);
  const [currentStopIdx, setCurrentStopIdx] = useState(0);
  const [currentPathIdx, setCurrentPathIdx] = useState(0);
  const [avatar,         setAvatar]         = useState<Position | null>(null);
  const [isWalking,      setIsWalking]      = useState(false);

  /* Pop-up state */
  const [popup, setPopup] = useState<{
    visible: boolean;
    name:    string;
    type:    'beacon' | 'destination';
  }>({ visible: false, name: '', type: 'beacon' });

  /*── Fetch layout + active beacons ─────────────────────────*/
  useEffect(() => {
    fetch('/api/layout')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setLayout)
      .catch(() => {});
    fetch('/api/beacons')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((b: Beacon[]) => setBeacons(b.filter(x => x.status === 'online')))
      .catch(() => {});
  }, []);

  /*── Position avatar at entrance ──────────────────────────*/
  useEffect(() => {
    if (!layout) return;
    const entrances = layout.zones.filter(z =>
      z.name.toLowerCase().includes('entrance')
    );
    const targetX = entrances.length
      ? entrances.reduce((s, z) => s + z.x + z.width/2, 0) / entrances.length
      : 0;
    let best = layout.roads[0];
    layout.roads.forEach(r => {
      const cc = centre(r), bb = centre(best);
      if (
        Math.abs(cc.x - targetX) < Math.abs(bb.x - targetX) ||
        (Math.abs(cc.x - targetX) === Math.abs(bb.x - targetX) && cc.y > bb.y)
      ) {
        best = r;
      }
    });
    setAvatar(centre(best));
  }, [layout]);

  /*── Autocomplete suggestions ─────────────────────────────*/
  useEffect(() => {
    if (!query.trim()) { setSug([]); return; }
    const q = query.toLowerCase();
    setSug(mockProducts.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6));
  }, [query]);

  /*── Early return if not ready ────────────────────────────*/
  if (!layout || !avatar) {
    return <div className="flex items-center justify-center h-full text-white">Loading…</div>;
  }

  /*── Neighbours & closest road-centre ─────────────────────*/
  const centres = layout.roads.map(centre);
  const neigh = (p: Position) =>
    centres.filter(q =>
      (Math.abs(q.x - p.x) === layout.roads[0].width && q.y === p.y) ||
      (Math.abs(q.y - p.y) === layout.roads[0].height && q.x === p.x)
    );
  const closest = (p: Position) =>
    centres.reduce((best, cc) =>
      Math.hypot(cc.x - p.x, cc.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y)
        ? cc : best
    );

  /*── jumpTo: compute full path + stops ─────────────────────*/
  const jumpTo = (pid: string) => {
    const shelf = layout.shelves.find(s =>
      s.products.some(p => p.productId === pid)
    );
    if (!shelf) { alert('Item unavailable'); return; }

    const cx = shelf.x + shelf.width/2;
    const cy = shelf.y + shelf.height/2;
    setDest({ x: Math.round(cx), y: Math.round(cy) });

    // recenter
    const vw = canvas.current!.parentElement!.clientWidth;
    const vh = canvas.current!.parentElement!.clientHeight;
    setOffset({ x: vw/2 - cx*scale, y: vh/2 - cy*scale });

    // BFS path
    const start = closest(avatar);
    const goal  = closest({ x: cx, y: cy });
    const prev  = new Map<string, Position|undefined>();
    prev.set(key(start), undefined);
    const Q = [start];
    while (Q.length) {
      const cur = Q.shift()!;
      if (eq(cur, goal)) break;
      neigh(cur).forEach(n => {
        if (!prev.has(key(n))) {
          prev.set(key(n), cur);
          Q.push(n);
        }
      });
    }
    if (!prev.has(key(goal))) {
      alert('No path'); return;
    }
    const rev: Position[] = [];
    for (let p: Position|undefined = goal; p; p = prev.get(key(p))) {
      rev.push(p);
    }
    const fullPath = rev.reverse();
    setPath(fullPath);

    // build stops with detection radius
    const beaconStops: Stop[] = beacons
      .map(b => ({
        index: fullPath.findIndex(pt =>
          Math.hypot(pt.x - b.x, pt.y - b.y) <= BEACON_RADIUS
        ),
        name:  b.name,
        type:  'beacon' as const
      }))
      .filter(s => s.index !== -1)
      .sort((a, b) => a.index - b.index);

    const destinationStop: Stop = {
      index: fullPath.length - 1,
      name:  'destination',
      type:  'destination'
    };

    setStops([...beaconStops, destinationStop]);
    setCurrentPathIdx(0);
    setCurrentStopIdx(0);
  };

  /*── handleMove: kick off walking ─────────────────────────*/
  const handleMove = () => {
    if (!path.length || !stops.length) {
      alert('Choose a product first'); return;
    }
    setIsWalking(true);
    stepToStop(0);
  };

  /*── stepToStop: walk segment, pause at each stop ────────*/
  const stepToStop = (stopPtr: number) => {
    if (stopPtr >= stops.length) {
      setIsWalking(false);
      return;
    }
    const targetIdx = stops[stopPtr].index;
    const walk = () => {
      setCurrentPathIdx(idx => {
        const next = idx + 1;
        setAvatar(path[next]);
        if (next >= targetIdx) {
          setIsWalking(false);
          setPopup({ visible: true, name: stops[stopPtr].name, type: stops[stopPtr].type });
        } else {
          setTimeout(walk, STEP_DELAY);
        }
        return next;
      });
    };
    setTimeout(walk, STEP_DELAY);
  };

  /*── onConfirm: resume or finish ──────────────────────────*/
  const onConfirm = () => {
    setPopup({ ...popup, visible: false });
    if (popup.type === 'beacon') {
      const nxt = currentStopIdx + 1;
      setCurrentStopIdx(nxt);
      setIsWalking(true);
      stepToStop(nxt);
    } else {
      setIsWalking(false);
    }
  };

  /*── Pan/zoom handlers ────────────────────────────────────*/
  const wheel = (e: React.WheelEvent) => {
    if (e.cancelable) e.preventDefault();
    const next = Math.min(3, Math.max(0.4, scale*(1 - e.deltaY/600)));
    if (next === scale) return;
    const rect = canvas.current!.getBoundingClientRect();
    const px = e.clientX - rect.left - offset.x;
    const py = e.clientY - rect.top  - offset.y;
    const z  = next / scale;
    setOffset({ x: offset.x + px - px*z, y: offset.y + py - py*z });
    setScale(next);
  };
  const panStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setPanning(true);
    pan0.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    document.body.style.cursor = 'grabbing';
  };
  const panMove = (e: React.MouseEvent) => {
    if (panning) setOffset({ x: e.clientX - pan0.current.x, y: e.clientY - pan0.current.y });
  };
  const panEnd = () => {
    setPanning(false);
    document.body.style.cursor = 'default';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative z-50 bg-glass backdrop-blur-md border-b border-glass p-4">
        <div className="flex items-center mb-3">
          <Link to="/customer/home"><ArrowLeft className="h-6 w-6 text-white"/></Link>
          <h1 className="ml-4 text-lg font-bold text-white">Store Map</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={e=>{ setQuery(e.target.value); setShowSug(true); }}
              onFocus={()=>setShowSug(true)}
              placeholder="Search products…"
              className="w-full px-3 py-2 rounded-lg bg-glass border border-glass text-white placeholder-gray-400 focus:border-accent"
            />
            {showSug && sug.length>0 && (
              <div className="absolute top-full left-0 mt-1 w-full max-h-40 overflow-auto bg-gray-800 rounded-lg shadow-lg z-60">
                {sug.map(p=>(
                  <div
                    key={p.id}
                    onMouseDown={()=>jumpTo(p.id)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent hover:text-white cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-gray-300"/><span className="text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!isWalking && path.length>0 && stops.length>0 && (
            <button
              onClick={handleMove}
              className="px-4 py-2 rounded-lg bg-accent text-primary font-medium flex items-center gap-2 shadow-glow"
            >
              <Navigation className="w-4 h-4"/> Move
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div
        className="flex-1 relative overflow-hidden bg-[#0C1C33]"
        onWheel={wheel}
        onMouseDown={panStart} onMouseMove={panMove}
        onMouseUp={panEnd} onMouseLeave={panEnd}
        onContextMenu={e=>e.preventDefault()}
      >
        {/* blueprint grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,transparent 0 19px,#153055 19px 20px),
            repeating-linear-gradient(90deg,transparent 0 19px,#153055 19px 20px),
            repeating-linear-gradient(0deg,transparent 0 99px,#1d3b63 99px 100px),
            repeating-linear-gradient(90deg,transparent 0 99px,#1d3b63 99px 100px)
          `
        }}/>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAGUlEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAACAf8YBAAB+fAsGAAAAAElFTkSuQmCC")'
        }}/>

        {/* pan/zoom surface */}
        <div
          ref={canvas}
          className="relative w-full h-full z-10 overflow-visible"
          style={{
            transform:`translate(${offset.x}px,${offset.y}px) scale(${scale})`,
            transformOrigin:'0 0', transition:'transform 80ms ease-out'
          }}
        >
          {/* zones */}
          {layout.zones.map(z=>(
            <div key={z.id} className="absolute border-2 border-dashed" style={{
              left:z.x, top:z.y, width:z.width, height:z.height,
              borderColor:z.color, background:`${z.color}33`
            }}>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none"
                   style={{ color:z.color }}>{z.name}</div>
            </div>
          ))}

          {/* roads */}
          {layout.roads.map(r=>(
            <div key={r.id} className="absolute" style={{
              left:r.x, top:r.y, width:r.width, height:r.height,
              background:ROAD_FILL, border:`2px solid ${ROAD_EDGE}`, boxSizing:'border-box'
            }}/>
          ))}

          {/* walked */}
          {path.length>1 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ overflow:'visible' }}>
              <polyline points={path.slice(0,currentPathIdx+1).map(p=>`${p.x},${p.y}`).join(' ')}
                        stroke={PATH_DONE} strokeWidth={4} fill="none"/>
            </svg>
          )}
          {/* remaining */}
          {path.length>1 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ overflow:'visible' }}>
              <polyline points={path.slice(currentPathIdx).map(p=>`${p.x},${p.y}`).join(' ')}
                        stroke={PATH_NEXT} strokeWidth={4} fill="none" strokeDasharray="8 6"/>
            </svg>
          )}

          {/* shelves */}
          {layout.shelves.map(s=>{
            const fill = s.type==='aisle'?AISLE
                      : s.type==='endcap'?ENDCAP
                      : s.type==='island'?ISLAND
                      : CHECKOUT;
            return (
              <div key={s.id} className="absolute flex items-center justify-center" style={{
                left:s.x, top:s.y, width:s.width, height:s.height,
                background:`${fill}33`, border:`2px solid ${fill}`,
                borderRadius:4, boxSizing:'border-box'
              }}>
                <span className="text-[10px] text-white pointer-events-none">{s.label}</span>
              </div>
            );
          })}

          {/* beacon dots (debug) */}
          {beacons.map(b=>(
            <div key={b.id} className="absolute pointer-events-none" style={{
              left:b.x-6, top:b.y-6, width:12, height:12,
              borderRadius:'50%', background:'#f59e0b'
            }}/>
          ))}

          {/* avatar */}
          <div className="absolute animate-breathe pointer-events-none" style={{
            left:avatar.x-16, top:avatar.y-48, width:32, height:48
          }}>
            <svg width="32" height="48" viewBox="0 0 32 48">
              <circle cx="16" cy="8" r="6" fill="#FFC4A3"/>
              <rect x="12" y="14" width="8" height="18" rx="4" fill="#4A90E2"/>
              <rect x="4"  y="16" width="4" height="12" rx="2" fill="#4A90E2"/>
              <rect x="24" y="16" width="4" height="12" rx="2" fill="#4A90E2"/>
              <rect x="12" y="32" width="4" height="12" rx="2" fill="#333"/>
              <rect x="16" y="32" width="4" height="12" rx="2" fill="#333"/>
            </svg>
          </div>

          {/* destination pin */}
          {dest && (
            <div className="absolute pointer-events-none" style={{
              left:dest.x-12, top:dest.y-24, width:24, height:32
            }}>
              <svg width="24" height="32" viewBox="0 0 24 32" style={{
                filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
              }}>
                <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 19 9 19s9-12.25 9-19C21 4.03 16.97 0 12 0z" fill="#EF4444"/>
                <circle cx="12" cy="9" r="4" fill="#fff"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up confirmation */}
      <AnimatePresence>
        {popup.visible && (
          <motion.div
            key="popup"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0,        opacity: 1 }}
            exit   ={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 flex items-end max-w-xs pointer-events-none"
          >
            {/* Character */}
            <motion.img
              src="/walker.png"
              alt="Guide"
              className="w-16 h-16 pointer-events-auto"
              animate={{ y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', repeatDelay: 1 }}
            />
            {/* Bubble */}
            <div className="ml-2 bg-white text-gray-800 p-3 rounded-lg shadow-lg pointer-events-auto">
              <p className="text-sm leading-snug">
                {popup.type === 'beacon'
                  ? `I have reached ${popup.name}; have you?`
                  : 'You’ve reached your destination successfully!'}
              </p>
              <button
                onClick={onConfirm}
                className="mt-2 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 focus:outline-none"
              >
                Yes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes breathe {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-3px) scale(1.03); }
        }
        .animate-breathe { animation: breathe 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
