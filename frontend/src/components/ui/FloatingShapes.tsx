import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Bubble {
  id: number;
  size: number;
  baseX: number;
  baseY: number;
}

const generateBubbles = (count = 24): Bubble[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: 60 + Math.random() * 60,
    baseX: Math.random() * window.innerWidth,
    baseY: Math.random() * window.innerHeight,
  }));

export const FloatingShapes: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  useEffect(() => {
    setBubbles(generateBubbles());

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      {/* Background layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/40 via-gray-200/40 to-white/40 backdrop-blur-[2px]" />

      {bubbles.map((bubble) => (
        <BubbleElement key={bubble.id} bubble={bubble} mouseRef={mouseRef} />
      ))}
    </div>
  );
};

const BubbleElement: React.FC<{
  bubble: Bubble;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ bubble, mouseRef }) => {
  const x = useMotionValue(bubble.baseX);
  const y = useMotionValue(bubble.baseY);

  const springX = useSpring(x, { stiffness: 40, damping: 20 });
  const springY = useSpring(y, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const animate = () => {
      const mouse = mouseRef.current;
      const dx = x.get() - mouse.x;
      const dy = y.get() - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        const angle = Math.atan2(dy, dx);
        const offset = 120;
        x.set(x.get() + Math.cos(angle) * offset);
        y.set(y.get() + Math.sin(angle) * offset);
      } else {
        // Gentle return to base position
        x.set(x.get() + Math.sin(Date.now() / 1000 + bubble.id) * 0.5);
        y.set(y.get() + Math.cos(Date.now() / 1000 + bubble.id) * 0.5);
      }

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [x, y, mouseRef, bubble.id]);

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        width: bubble.size,
        height: bubble.size,
      }}
      className="absolute rounded-full backdrop-blur-2xl shadow-xl z-[1]"
    >
      <div className="w-full h-full rounded-full bg-gradient-to-br from-sky-400/80 via-sky-300/60 to-teal-300/50 border border-white/30" />
    </motion.div>
  );
};

export default FloatingShapes;
