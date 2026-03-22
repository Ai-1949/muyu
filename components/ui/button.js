'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * 按钮变体（shadcn/ui 风格，适配禅意配色）
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-zen-wood to-zen-woodLight text-zen-paper shadow-zen hover:opacity-95',
        outline:
          'border border-zen-wood/25 bg-zen-paper/80 text-zen-ink hover:bg-zen-paper',
        ghost: 'text-zen-ink hover:bg-zen-ink/5',
        secondary: 'bg-zen-ink/5 text-zen-ink hover:bg-zen-ink/10',
        destructive: 'bg-zen-temple text-white hover:bg-zen-templeDeep',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * 通用按钮
 * @param {object} props
 * @param {string} [props.className]
 * @param {'default'|'outline'|'ghost'|'secondary'|'destructive'} [props.variant]
 * @param {'default'|'sm'|'lg'|'icon'} [props.size]
 * @param {boolean} [props.asChild] - 使用 Radix Slot 合并到子元素
 */
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
