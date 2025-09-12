import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  loading = false,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500 text-white hover:from-blueblue-600 hover:to-light-bluelight-blue-600 focus:ring-blueblue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blueblue-300 bg-white/80 backdrop-blur-sm text-blueblue-700 hover:bg-blueblue-50 hover:border-blueblue-400 focus:ring-blueblue-500 shadow-md hover:shadow-lg',
    ghost: 'text-gray-700 hover:bg-white/80 hover:backdrop-blur-sm focus:ring-gray-500 hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-red-600 focus:ring-purple-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-gray-700 hover:bg-white/30 focus:ring-blueblue-500 shadow-lg hover:shadow-xl',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <div className={cn('flex items-center space-x-2', loading && 'opacity-0')}>
        {icon && <span>{icon}</span>}
        <span>{children}</span>
      </div>
    </button>
  );
};