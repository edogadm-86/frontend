import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      className={cn(
        'card p-6',
        onClick && 'cursor-pointer hover:shadow-card-hover',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};