import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, glow = false, children, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-card rounded-2xl p-6 transition-all duration-200 border border-charcoal-border',
          glow && 'glow-lime border-lime/30',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
