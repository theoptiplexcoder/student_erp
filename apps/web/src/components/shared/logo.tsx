import React from 'react';
import Image from 'next/image';
import { cn } from '@student-erp/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

export function Logo({ className, size = 28, showText = true, subtitle }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div className="relative flex shrink-0 items-center justify-center">
        <Image
          src="/logo.svg"
          alt="Student ERP Logo"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col truncate leading-tight">
          <span className="font-display text-foreground text-base font-bold tracking-tight">
            Student ERP
          </span>
          {subtitle && (
            <span className="text-muted-foreground truncate text-[10px] font-medium">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
