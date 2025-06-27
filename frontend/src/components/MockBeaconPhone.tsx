import React, { useEffect, useRef, useState } from 'react';

interface Props {
  /** called every 100 ms with the phone’s world-coords (x / y, px) */
  onMove: (pos: { x: number; y: number }) => void;
}

/** Blue draggable rectangle that pretends to be a Bluetooth phone */
export default function MockBeaconPhone({ onMove }: Props) {
  const ref          = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const [pos,  setPos ] = useState({ x: 80, y: 80 });   // initial viewport coords

  /* broadcast to parent */
  useEffect(() => {
    const id = setInterval(() => onMove(pos), 100);
    return () => clearInterval(id);
  }, [pos, onMove]);

  /* mouse events */
  const start = (e: React.MouseEvent) => { e.preventDefault(); setDrag(true); };
  const move  = (e: MouseEvent)       => { if (drag) setPos({ x: e.clientX - 20, y: e.clientY - 40 }); };
  const stop  = () => setDrag(false);

  useEffect(() => {
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   stop);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', stop); };
  });

  return (
    <div
      ref={ref}
      onMouseDown={start}
      style={{
        position: 'fixed',
        left: pos.x, top: pos.y,
        width: 40, height: 80,
        background: '#3b82f6',
        borderRadius: 6,
        cursor: 'grab',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 10,
        userSelect: 'none',
      }}
    >
      PHONE
    </div>
  );
}
