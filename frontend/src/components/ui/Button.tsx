import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------
 * Button
 *  – variant : visual style  (adds "destructive")
 *  – size    : sm | md | lg | icon
 *              "icon" = 32×32 square, no text label by default
 * ------------------------------------------------------------------ */

/** Base props that a <motion.button> already accepts */
type MotionButtonProps = HTMLMotionProps<'button'>;

export interface ButtonProps extends MotionButtonProps {
  /** visible label (ignored for `size="icon"`) */
  children: React.ReactNode;
  /** colour scheme */
  variant?: 'primary' | 'secondary' | 'accent' | 'highlight' | 'destructive';
  /** dimensions */
  size?:    'sm' | 'md' | 'lg' | 'icon';
  /** optional Lucide icon displayed left of the label */
  icon?:    LucideIcon;
}

/* ----- utility class maps ---------------------------------------- */
const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:     'bg-accent hover:bg-accent-600 text-primary shadow-glow',
  secondary:   'bg-glass hover:bg-white/20 text-white border border-glass',
  accent:      'bg-accent-500 hover:bg-accent-600 text-white',
  highlight:   'bg-highlight hover:bg-highlight-600 text-primary shadow-highlight-glow',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm:   'px-3 py-2   text-sm',
  md:   'px-4 py-2.5 text-sm',
  lg:   'px-6 py-3   text-base',
  icon: 'p-2 w-8 h-8 flex items-center justify-center',
};

export default function Button({
  children,
  variant = 'primary',
  size    = 'md',
  icon:   Icon,
  className = '',
  disabled  = false,
  type = 'button',           // keep normal <button> semantics
  ...rest                     // all other motion / HTML props
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={[
        'inline-flex items-center justify-center space-x-2 font-medium rounded-xl',
        'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...rest}      
    >
      {Icon && <Icon className="h-4 w-4" />}
      {size !== 'icon' && <span>{children}</span>}
    </motion.button>
  );
}
