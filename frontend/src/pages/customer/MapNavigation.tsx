import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Package, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Position, Road, Beacon } from '../../types';
import { mockProducts } from '../../data/mockData';

/* ------- colours -------- */
const AISLE='#00D3FF',ENDCAP='#FFB547',ISLAND='#8B5CF6',CHECKOUT='#EF4444';
const ROAD_FILL='#b4b8bd',ROAD_EDGE='#2f2f2f';

/* ------- helpers -------- */
const centre=(r:Road)=>({x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)});
const key   =(p:Position)=>`${p.x}|${p.y}`;
const eq    =(a:Position,b:Position)=>a.x===b.x&&a.y===b.y;

export default function MapNavigation(){
  /* ------ constant beacons list (from BeaconManager) ------ */
  const beacons:Beacon[]=JSON.parse(localStorage.getItem('beacons')||'[]');

  /* ------ state (order fixed) ----------------------------- */
  const [layout, setLayout]=useState<Layout|null>(null);
  const [scale , setScale ]=useState(1);
  const [offset, setOffset]=useState({x:0,y:0});
  const [panning,setPanning]=useState(false);

  const [query , setQuery ]=useState('');
  const [sug   , setSug   ]=useState<typeof mockProducts>([]);
  const [showSug,setShowSug]=useState(false);

  const [dest  , setDest  ]=useState<Position|null>(null);
  const [avatar, setAvatar]=useState<Position|null>(null);
  const [path  , setPath  ]=useState<Position[]>([]);
  const [walking,setWalking]=useState(false);

  const [nearest, setNearest]=useState<{id:string;rssi:number}|null>(null);

  const pan0   =useRef({x:0,y:0});
  const canvas =useRef<HTMLDivElement>(null);

  /* ----- effects ----------------------------------------- */

  /* 1 fetch layout */
  useEffect(()=>{ fetch('/api/layout').then(r=>r.ok?r.json():Promise.reject()).then(setLayout).catch(()=>{}); },[]);

  /* 2 pick entrance start */
  useEffect(()=>{
    if(!layout)return;
    const entrances=layout.zones.filter(z=>z.name.toLowerCase().includes('entrance'));
    const tgtX=entrances.length?entrances.map(z=>z.x+z.width/2).reduce((a,b)=>a+b,0)/entrances.length:0;
    let best=layout.roads[0];
    layout.roads.forEach(r=>{
      const cc=centre(r),cb=centre(best);
      if(Math.abs(cc.x-tgtX)<Math.abs(cb.x-tgtX)||(Math.abs(cc.x-tgtX)===Math.abs(cb.x-tgtX)&&cc.y>cb.y)) best=r;
    });
    setAvatar(centre(best));
  },[layout]);

  /* 3 suggestions */
  useEffect(()=>{ if(!query.trim()){setSug([]);return;}
    setSug(mockProducts.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).slice(0,6));
  },[query]);

  /* 4 block ctrl zoom */
  useEffect(()=>{
    const wheel=(e:WheelEvent)=>{ if(e.ctrlKey||e.metaKey)e.preventDefault(); };
    const key  =(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&&['+','-','=','?'].includes(e.key))e.preventDefault(); };
    window.addEventListener('wheel',wheel,{passive:false});
    window.addEventListener('keydown',key,{passive:false});
    return()=>{window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);};
  },[]);

  /* 5 walking interval */
  useEffect(()=>{
    if(!walking||path.length===0)return;
    let i=0; const id=setInterval(()=>{ i++; if(i>=path.length){clearInterval(id);setWalking(false);} else setAvatar(path[i]); },200);
    return()=>clearInterval(id);
  },[walking,path]);

  /* 6 BLE scan -> nearest beacon */
  useEffect(()=>{
    if(!('bluetooth'in navigator)||beacons.length===0)return;
    let abort=false;
    navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
      .then(()=>{
        navigator.bluetooth.addEventListener('advertisementreceived',ev=>{
          if(abort)return;
          const match=beacons.find(b=>b.id===ev.device.id);
          if(!match)return;
          const rssi=ev.rssi??-100;
          setNearest(n=>!n||rssi>n.rssi?{id:ev.device.id,rssi}:n);
        });
      })
      .catch(console.warn);
    return()=>{abort=true;};
  },[beacons]);

  /* 7 auto-walk to shelf of nearest beacon */
  useEffect(()=>{
    if(!layout||!avatar||!nearest||walking)return;
    const meta=beacons.find(b=>b.id===nearest.id);
    if(!meta)return;
    const shelf=layout.shelves.find(s=>s.id===meta.zoneId);
    if(!shelf)return;
    const goal:{x:number;y:number}={x:Math.round(shelf.x+shelf.width/2),y:Math.round(shelf.y+shelf.height/2)};
    /* BFS to goal */
    const centres=layout.roads.map(centre);
    const neigh =(p:Position)=>centres.filter(q=>
      (Math.abs(q.x-p.x)===layout.roads[0].width&&q.y===p.y)||
      (Math.abs(q.y-p.y)===layout.roads[0].height&&q.x===p.x));
    const closest=(p:Position)=>centres.reduce((best,cc)=>
      Math.hypot(cc.x-p.x,cc.y-p.y)<Math.hypot(best.x-p.x,best.y-p.y)?cc:best);
    const start=closest(avatar), goalRoad=closest(goal);
    const prev=new Map<string,Position|undefined>(); prev.set(key(start),undefined);
    const q=[start];
    while(q.length){
      const cur=q.shift()!;
      if(eq(cur,goalRoad))break;
      neigh(cur).forEach(n=>{if(!prev.has(key(n))){prev.set(key(n),cur);q.push(n);}});
    }
    if(!prev.has(key(goalRoad)))return;
    const rev:Position[]=[]; for(let s:Position|undefined=goalRoad;s;s=prev.get(key(s)))rev.push(s);
    setPath(rev.reverse()); setWalking(true);
  },[nearest,layout,avatar,walking,beacons]);

  /* ---------- early load ---------- */
  if(!layout||!avatar) return <div className="flex h-full items-center justify-center text-white">Loading…</div>;

  /* ---------- derived helpers ---------- */
  const centres=layout.roads.map(centre);
  const neigh =(p:Position)=>centres.filter(q=>
    (Math.abs(q.x-p.x)===layout.roads[0].width&&q.y===p.y)||
    (Math.abs(q.y-p.y)===layout.roads[0].height&&q.x===p.x));
  const closestRoad=(p:Position)=>centres.reduce((best,cc)=>
    Math.hypot(cc.x-p.x,cc.y-p.y)<Math.hypot(best.x-p.x,best.y-p.y)?cc:best);

  const pathKeys=new Set(path.map(p=>key(p)));

  /* ---------- UI handlers ---------- */
  const wheel=(e:React.WheelEvent)=>{e.preventDefault();
    const next=Math.min(3,Math.max(0.4,scale*(1-e.deltaY/600)));
    if(next===scale)return;
    const rect=canvas.current!.getBoundingClientRect();
    const px=e.clientX-rect.left-offset.x, py=e.clientY-rect.top-offset.y;
    const z=next/scale;
    setOffset({x:offset.x+px-px*z,y:offset.y+py-py*z}); setScale(next);
  };
  const panStart=(e:React.MouseEvent)=>{if((e.target as HTMLElement).closest('[data-draggable]')||e.button!==0)return;
    setPanning(true); pan0.current={x:e.clientX-offset.x,y:e.clientY-offset.y}; document.body.style.cursor='grabbing';};
  const panMove=(e:React.MouseEvent)=>{ if(panning)setOffset({x:e.clientX-pan0.current.x,y:e.clientY-pan0.current.y});};
  const panEnd =()=>{setPanning(false); document.body.style.cursor='default';};

  const jumpTo=(pid:string)=>{
    const shelf=layout.shelves.find(s=>s.products.some(p=>p.productId===pid));
    if(!shelf){alert('Item unavailable');return;}
    const cx=shelf.x+shelf.width/2, cy=shelf.y+shelf.height/2;
    const vw=canvas.current!.parentElement!.clientWidth, vh=canvas.current!.parentElement!.clientHeight;
    setOffset({x:vw/2-cx*scale,y:vh/2-cy*scale});
    setDest({x:Math.round(cx),y:Math.round(cy)}); setQuery(''); setShowSug(false); setPath([]);
  };
  const handleMove=()=>{
    if(!dest){alert('Pick a product');return;}
    const start=closestRoad(avatar), goal=closestRoad(dest);
    const prev=new Map<string,Position|undefined>(); prev.set(key(start),undefined);
    const q=[start];
    while(q.length){
      const cur=q.shift()!;
      if(eq(cur,goal))break;
      neigh(cur).forEach(n=>{if(!prev.has(key(n))){prev.set(key(n),cur);q.push(n);}});
    }
    if(!prev.has(key(goal))){alert('No path');return;}
    const rev:Position[]=[]; for(let s:Position|undefined=goal;s;s=prev.get(key(s)))rev.push(s);
    setPath(rev.reverse()); setWalking(true);
  };

  /* ---------- JSX ---------- */
  return(
  <div className="flex flex-col h-full">
    {/* header */}
    <div className="relative z-50 bg-glass backdrop-blur-md border-b border-glass p-4">
      <div className="flex items-center mb-3">
        <Link to="/customer/home"><ArrowLeft className="h-6 w-6 text-white"/></Link>
        <h1 className="ml-4 text-lg font-bold text-white">Store Map</h1>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input value={query} onChange={e=>{setQuery(e.target.value);setShowSug(true);}} onFocus={()=>setShowSug(true)}
                 placeholder="Search products…" className="w-full px-3 py-2 rounded-lg bg-glass border border-glass text-white placeholder-gray-400 focus:border-accent"/>
          {showSug&&sug.length>0&&(
            <div className="absolute top-full left-0 mt-1 w-full max-h-40 overflow-auto bg-gray-800 rounded-lg shadow-lg z-60">
              {sug.map(p=>(
                <div key={p.id} onMouseDown={()=>jumpTo(p.id)}
                     className="flex items-center gap-2 px-3 py-2 hover:bg-accent hover:text-white cursor-pointer">
                  <Package className="w-4 h-4 text-gray-300"/><span className="text-sm">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {dest&&<button onClick={handleMove}
            className="px-4 py-2 rounded-lg bg-accent text-primary font-medium flex items-center gap-2 shadow-glow">
            <Navigation className="w-4 h-4"/>Move</button>}
      </div>
    </div>

    {/* map */}
    <div className="flex-1 relative overflow-hidden bg-[#0C1C33]"
         onWheel={wheel} onMouseDown={panStart} onMouseMove={panMove} onMouseUp={panEnd} onMouseLeave={panEnd}
         onContextMenu={e=>e.preventDefault()}>
      {/* grid & noise */}
      <div className="absolute inset-0 pointer-events-none"
           style={{backgroundImage:`repeating-linear-gradient(0deg,transparent 0 19px,#153055 19px 20px),
                                     repeating-linear-gradient(90deg,transparent 0 19px,#153055 19px 20px),
                                     repeating-linear-gradient(0deg,transparent 0 99px,#1d3b63 99px 100px),
                                     repeating-linear-gradient(90deg,transparent 0 99px,#1d3b63 99px 100px)`,
                  backgroundSize:'20px 20px,20px 20px,100px 100px,100px 100px'}}/>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{backgroundImage:
             'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAGUlEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAACAf8YBAAB+fAsGAAAAAElFTkSuQmCC")'}}/>

      {/* zoom surface */}
      <div ref={canvas} className="relative w-full h-full z-10 overflow-visible"
           style={{transform:`translate(${offset.x}px,${offset.y}px) scale(${scale})`,transformOrigin:'0 0',transition:'transform 80ms ease-out'}}>

        {/* zones */}
        {layout.zones.map(z=>(
          <div key={z.id} className="absolute border-2 border-dashed"
               style={{left:z.x,top:z.y,width:z.width,height:z.height,borderColor:z.color,backgroundColor:`${z.color}33`}}>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none"
                 style={{color:z.color}}>{z.name}</div>
          </div>
        ))}

        {/* roads */}
        {layout.roads.map(r=>{
          const cc=centre(r),on=pathKeys.has(key(cc));
          return<div key={r.id} className="absolute"
                 style={{left:r.x,top:r.y,width:r.width,height:r.height,backgroundColor:on?'#4ade80':ROAD_FILL,
                         border:`2px solid ${on?'#4ade80':ROAD_EDGE}`,boxSizing:'border-box',
                         transition:'background 120ms,border-color 120ms'}}/>;
        })}

        {/* shelves */}
        {layout.shelves.map(s=>{
          const fill=s.type==='aisle'?AISLE:s.type==='endcap'?ENDCAP:s.type==='island'?ISLAND:CHECKOUT;
          return<div key={s.id} className="absolute flex items-center justify-center"
                 style={{left:s.x,top:s.y,width:s.width,height:s.height,backgroundColor:`${fill}33`,
                         border:`2px solid ${fill}`,borderRadius:4,boxSizing:'border-box'}}>
                   <span className="text-[10px] text-white pointer-events-none">{s.label}</span>
                 </div>;
        })}

        {/* avatar */}
        <div className="absolute animate-breathe pointer-events-none"
             style={{left:avatar.x-16,top:avatar.y-48,width:32,height:48}}>
          <svg width="32" height="48" viewBox="0 0 32 48">
            <circle cx="16" cy="8" r="6" fill="#FFC4A3"/>
            <rect x="12" y="14" width="8" height="18" rx="4" fill="#4A90E2"/>
            <rect x="4"  y="16" width="4" height="12" rx="2" fill="#4A90E2"/>
            <rect x="24" y="16" width="4" height="12" rx="2" fill="#4A90E2"/>
            <rect x="12" y="32" width="4" height="12" rx="2" fill="#333"/>
            <rect x="16" y="32" width="4" height="12" rx="2" fill="#333"/>
          </svg>
        </div>
      </div>
    </div>

    <style>{`@keyframes breathe{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-3px) scale(1.03);}}
             .animate-breathe{animation:breathe 2.4s ease-in-out infinite;}`}</style>
  </div>);
}
