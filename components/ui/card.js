import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * 卡片容器：新中式留白与柔和阴影
 */
function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zen-ink/8 bg-white/70 shadow-zen backdrop-blur-sm transition-all duration-300',
        className,
      )}
      {...props}
    />
  );
}

/**
 * 卡片头部区域
 */
function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-4', className)} {...props} />;
}

/**
 * 卡片标题
 */
function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('font-serif text-lg font-semibold leading-none tracking-tight text-zen-ink', className)}
      {...props}
    />
  );
}

/**
 * 卡片描述
 */
function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-zen-mist', className)} {...props} />;
}

/**
 * 卡片主体
 */
function CardContent({ className, ...props }) {
  return <div className={cn('p-4 pt-0', className)} {...props} />;
}

/**
 * 卡片底部
 */
function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-4 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
