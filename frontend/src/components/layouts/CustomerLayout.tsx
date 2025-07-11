import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Chatbot from '../ui/Chatbot';

/**
 * Pages that need the whole viewport (no outer scroll/padding),
 * e.g. interactive maps, launch screens, camera, full‑screen charts …
 * Add more routes here as you create new full‑screen experiences.
 */
const FULLSCREEN_ROUTES = [
  '/customer/map',
  '/customer/store-map',
  '/customer/navigation',
];

const CustomerLayout = () => {
  const { pathname } = useLocation();

  const isStartup    = pathname.includes('/startup');
  const isFullscreen = FULLSCREEN_ROUTES.some(p => pathname.startsWith(p));

  /* ------------------------------------------------------------------
   * Custom “drag to scroll” only when the outer shell is scrollable.
   * (MapNavigation does its own panning, so we disable it there.)
   * ------------------------------------------------------------------ */
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFullscreen) return;               // nothing to wire up
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false, startY = 0, startTop = 0;

    const down = (e: MouseEvent) => {
      isDown   = true;
      startY   = e.pageY;
      startTop = el.scrollTop;
      el.style.cursor = 'grabbing';
    };
    const move = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const dy = (e.pageY - startY) * 1.5;
      el.scrollTop = startTop - dy;
    };
    const up = () => {
      isDown = false;
      el.style.cursor = 'default';
    };

    el.addEventListener('mousedown', down);
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseup',   up);
    el.addEventListener('mouseleave', up);

    return () => {
      el.removeEventListener('mousedown', down);
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseup',   up);
      el.removeEventListener('mouseleave', up);
    };
  }, [isFullscreen]);

  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      {/* Phone shell -------------------------------------------------- */}
      <div className="relative w-[390px] h-[844px] rounded-[2.5rem] border-[6px] border-gray-800 shadow-xl overflow-hidden bg-black">

        {/* Notch ------------------------------------------------------ */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-30" />

        {/* App screen ------------------------------------------------- */}
        <div className="absolute inset-0 z-10">
          {/* Full‑screen pages bypass the scroll wrapper entirely */}
          {isFullscreen ? (
            <Outlet />
          ) : (
            <div
              ref={scrollRef}
              className="h-full w-full overflow-y-auto !scrollbar-hide !scroll-smooth !select-none touch-pan-y"
            >
              {isStartup ? (
                <Outlet />                                  // no padding
              ) : (
                <div className="min-h-full flex flex-col pt-8 px-4">
                  <Outlet />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chatbot only when it won’t block the main content ---------- */}
        {!isStartup && !isFullscreen && <Chatbot />}
      </div>
    </div>
  );
};

export default CustomerLayout;
