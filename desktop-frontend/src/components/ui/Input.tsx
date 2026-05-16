import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-[#c1c7d3] mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c1f] text-gray-900 dark:text-[#e2e2e6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] focus:border-transparent placeholder-gray-400 dark:placeholder-[#414751] transition-all',
          error && 'border-red-500 dark:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
