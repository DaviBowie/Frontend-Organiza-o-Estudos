import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500',
            'rounded-lg px-3.5 py-2.5 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60',
            'transition-colors duration-150',
            error && 'border-red-600 focus:ring-red-500/40 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
