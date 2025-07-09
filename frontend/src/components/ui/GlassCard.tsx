import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      className={`relative bg-white/30 backdrop-blur-2xl border border-blue/50 rounded-3xl shadow-[0_12px_50px_rgba(0,0,0,0.04)] p-8 text-lg transition-all duration-300 ${className}`}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
    >
      {/* Glassy background floaters (visible and subtle) */}
      <div className="absolute -top-10 -left-10 h-24 w-24 bg-blue-200/30 rounded-full opacity-5 blur-md z-0"></div>
      <div className="absolute -bottom-10 -right-10 h-20 w-20 bg-blue-100/30 rounded-2xl opacity-5 blur-md z-0"></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
