import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * 文本输入框（禅意边框与聚焦环）
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-zen-wood/20 bg-white/90 px-3 py-2 text-sm text-zen-ink shadow-sm transition-all duration-200',
        'placeholder:text-zen-mist/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold/35',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
