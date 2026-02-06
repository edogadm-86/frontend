import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'gradient' | 'stat';
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  onClick, 
  variant = 'default',
  hover = true,
  glow = false
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300';
  
  const variants = {
  default:
    'bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-700/30 shadow-lg',
  glass:
    'bg-white/10 dark:bg-gray-900/30 backdrop-blur-md border-white/20 dark:border-gray-700/30 shadow-xl',
  gradient:
    'bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/70 dark:to-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-700/30 shadow-lg',
  stat:
    'bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/70 dark:to-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-700/30 shadow-lg',
};


  const hoverEffects = hover
  ? 'hover:shadow-2xl hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-gray-900/70'
  : '';

  const clickableEffects = onClick ? 'cursor-pointer' : '';
  const glowEffects = glow ? 'glow-effect' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        hoverEffects,
        clickableEffects,
        glowEffects,
        'p-6',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};