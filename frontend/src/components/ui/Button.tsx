import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

type MotionButtonProps = HTMLMotionProps<'button'>;

export interface ButtonProps extends MotionButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'highlight' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode | LucideIcon;
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:     'bg-blue-500 hover:bg-blue-600 text-white shadow-glow',
  secondary:   'bg-white/20 hover:bg-white/30 text-white border border-white/40',
  accent:      'bg-cyan-500 hover:bg-cyan-600 text-white',
  highlight:   'bg-yellow-400 hover:bg-yellow-500 text-primary shadow-highlight-glow',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm:   'px-4 py-2 text-base',
  md:   'px-5 py-2.5 text-base',
  lg:   'px-6 py-3 text-lg',
  icon: 'p-2 w-10 h-10 flex items-center justify-center',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;

    const IconComponent = icon as LucideIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={[
        'inline-flex items-center justify-center space-x-2 font-semibold rounded-xl',
        'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {renderIcon()}
      {size !== 'icon' && <span>{children}</span>}
    </motion.button>
  );
}
