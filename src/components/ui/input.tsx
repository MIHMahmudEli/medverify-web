import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 shadow-none transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-slate-800 focus-visible:ring-1 focus-visible:ring-slate-800 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
