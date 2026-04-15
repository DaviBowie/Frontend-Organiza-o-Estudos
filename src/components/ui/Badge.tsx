import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'amber' | 'teal' | 'red' | 'blue';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-400 border-slate-700',
    amber: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
    teal: 'bg-teal-900/30 text-teal-400 border-teal-800/40',
    red: 'bg-red-900/30 text-red-400 border-red-800/40',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
