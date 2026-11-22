import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'navy' | 'gray' | 'red' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'lime', className, children, ...props }) => {
  const variants = {
    lime: 'bg-lime/10 text-lime border-lime/30',
    navy: 'bg-navy-950 text-offWhite border-charcoal-border',
    gray: 'bg-charcoal text-offWhite-muted border-charcoal-border',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
