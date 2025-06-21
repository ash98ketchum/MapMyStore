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
      className={`bg-glass backdrop-blur-md border border-glass rounded-xl shadow-glass ${className}`}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;