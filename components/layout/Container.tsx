import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const WIDTHS = {
  prose: 'max-w-(--container-prose)',
  default: 'max-w-(--container-default)',
  wide: 'max-w-(--container-wide)',
  full: 'max-w-(--container-full)',
} as const;

type ContainerProps = {
  children: ReactNode;
  size?: keyof typeof WIDTHS;
  className?: string;
};

/**
 * Horizontal measure and gutters.
 *
 * Beyond `full`, space is intentional darkness rather than stretched layout —
 * the composition stops growing and the surrounding room takes over.
 */
export function Container({ children, size = 'default', className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-(--gutter)', WIDTHS[size], className)}>{children}</div>
  );
}
