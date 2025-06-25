// src/pages/customer/MapNavigation.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout, Position } from '../../types';

const PAVER      = 32;
const AISLE_COLOR = '#00D3FF';
const ENDCAP_COLOR = '#FFB547';
const ISLAND_COLOR = '#8B5CF6';
const CHECKOUT_COLOR = '#EF4444';
const ROAD_FILL  = '#b4b8bd';
const ROAD_EDGE  = '#2f2f2f';

export default function MapNavigation() {
  const [layout, setLayout]     = useState<Layout | null>(null);
  const [scale, setScale]       = useState(1);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [panning, setPanning]   = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // block native Ctrl+wheel zoom
  useEffect(() => {
    const stop = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    window.addEventListener('wheel', stop, { passive: false });
    return () => window.removeEventListener('wheel', stop);
  }, []);

  // block native Ctrl+plus/minus zoom
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['+', '=', '-'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', blockKeys, { passive: false });
    return () => window.removeEventListener('keydown', blockKeys);
  }, []);

  // load layout
  useEffect(() => {
    fetch('/api/layout')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setLayout)
      .catch(() => {/* no layout yet */});
  }, []);

  // zoom handler
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = 1 - e.deltaY / 600;
    const next   = Math.min(3, Math.max(0.4, scale * factor));
    if (next === scale) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const px   = e.clientX - rect.left - offset.x;
    const py   = e.clientY - rect.top  - offset.y;
    const z    = next / scale;

    setOffset({
      x: offset.x + px - px * z,
      y: offset.y + py - py * z
    });
    setScale(next);
  };

  // pan handlers
  const startPan = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-draggable]')) return;
    if (e.button !== 0) return;
    e.preventDefault();
    setPanning(true);
    panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    document.body.style.cursor = 'grabbing';
  };
  const doPan = (e: React.MouseEvent) => {
    if (!panning) return;
    setOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  };
  const endPan = () => {
    setPanning(false);
    document.body.style.cursor = 'default';
  };

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading map…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-glass backdrop-blur-md border-b border-glass p-4 flex items-center">
        <Link to="/customer/home">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="ml-4 text-lg font-bold">Store Map</h1>
      </div>

      {/* Canvas Container */}
      <div
        className="relative flex-1 overflow-hidden bg-[#0C1C33]"
        onWheel={onWheel}
        onMouseDown={startPan}
        onMouseMove={doPan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Blueprint grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent 0 19px, #153055 19px 20px),
              repeating-linear-gradient(90deg, transparent 0 19px, #153055 19px 20px),
              repeating-linear-gradient(0deg, transparent 0 99px, #1d3b63 99px 100px),
              repeating-linear-gradient(90deg, transparent 0 99px, #1d3b63 99px 100px)
            `,
            backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px'
          }}
        />
        {/* Subtle noise overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAGUlEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAACAf8YBAAB+fAsGAAAAAElFTkSuQmCC")',
          }}
        />

        {/* Pan/zoom surface */}
        <div
          ref={canvasRef}
          className="relative w-full h-full z-10 overflow-visible"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: 'transform 80ms ease-out',
          }}
        >
          {/* Zones */}
          {layout.zones.map(z => (
            <div
              key={z.id}
              data-draggable
              className="absolute border-2 border-dashed"
              style={{
                left: z.x, top: z.y,
                width: z.width, height: z.height,
                borderColor: z.color,
                backgroundColor: `${z.color}33`
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none"
                style={{ color: z.color }}
              >
                {z.name}
              </div>
            </div>
          ))}

          {/* Roads */}
          {layout.roads.map(r => (
            <div
              key={r.id}
              className="absolute"
              style={{
                left: r.x, top: r.y,
                width: r.width, height: r.height,
                backgroundColor: ROAD_FILL,
                border: `2px solid ${ROAD_EDGE}`,
                boxSizing: 'border-box'
              }}
            />
          ))}

          {/* Shelves */}
          {layout.shelves.map(s => {
            const fill =
              s.type === 'aisle'    ? AISLE_COLOR :
              s.type === 'endcap'   ? ENDCAP_COLOR :
              s.type === 'island'   ? ISLAND_COLOR :
              s.type === 'checkout' ? CHECKOUT_COLOR :
              AISLE_COLOR;
            return (
              <div
                key={s.id}
                data-draggable
                className="absolute cursor-pointer flex items-center justify-center"
                style={{
                  left:            s.x,
                  top:             s.y,
                  width:           s.width,
                  height:          s.height,
                  backgroundColor: fill + '33',
                  border:          `2px solid ${fill}`,
                  borderRadius:    '4px',
                  boxSizing:       'border-box'
                }}
              >
                <span className="text-[10px] text-white pointer-events-none">
                  {s.label}
                </span>
              </div>
            );
          })}

          {/* (Optional) User Position & Destination Pin */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
}
