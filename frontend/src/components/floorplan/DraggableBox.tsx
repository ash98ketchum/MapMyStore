// -----------------------------------------------------------------------------
// Scale-aware draggable + resizable box
// -----------------------------------------------------------------------------

import React, { useRef } from 'react';

type Props = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;                          // <= NEW (from parent canvas)
  selected: boolean;
  style?: React.CSSProperties;
  onSelect?: (id: string) => void;
  onChange?: (id: string, nx: number, ny: number, nw: number, nh: number) => void;
  children?: React.ReactNode;
};

export default function DraggableBox({
  id, x, y, w, h, scale,
  selected, style = {},
  onSelect, onChange, children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  /* drag ------------------------------------------------------------------ */
  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;            // left-click only
    e.stopPropagation();
    onSelect?.(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const ox = x, oy = y;

    const move = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      onChange?.(id, ox + dx, oy + dy, w, h);
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  /* resize (bottom-right corner only to keep code small) ------------------- */
  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const ow = w, oh = h;

    const move = (ev: MouseEvent) => {
      const dw = (ev.clientX - startX) / scale;
      const dh = (ev.clientY - startY) / scale;
      onChange?.(id, x, y, Math.max(20, ow + dw), Math.max(20, oh + dh));
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  return (
    <div
      ref={ref}
      className={`absolute ${selected ? 'ring-2 ring-sky-400' : ''}`}
      style={{ left: x, top: y, width: w, height: h, ...style }}
      onMouseDown={startDrag}
    >
      {children}
      {/* resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute w-2 h-2 right-0 bottom-0 bg-white border border-gray-400 cursor-se-resize"
        style={{ transform: 'translate(50%,50%)' }}
      />
    </div>
  );
}
