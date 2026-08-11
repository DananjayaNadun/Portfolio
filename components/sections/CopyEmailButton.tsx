'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

/** How long the confirmation holds before reverting. */
const CONFIRM_MS = 1600;

type CopyEmailButtonProps = {
  email: string;
};

/**
 * Copies the address without making anyone select it by hand.
 *
 * The address is already visible next to this control, so the button is an
 * accelerator rather than the only route — if the clipboard API is unavailable
 * or blocked, nothing is lost.
 *
 * The result is announced through a polite live region. A purely visual
 * checkmark tells a screen-reader user nothing, and "did that work?" is exactly
 * the moment feedback matters.
 */
export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const handleCopy = useCallback(async () => {
    window.clearTimeout(timeoutRef.current);
    try {
      await navigator.clipboard.writeText(email);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    timeoutRef.current = window.setTimeout(() => setStatus('idle'), CONFIRM_MS);
  }, [email]);

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'inline-flex h-12 items-center gap-2 rounded-full border px-5 text-[0.9375rem] font-medium',
          'transition-colors duration-(--dur-fast) ease-(--ease-standard)',
          status === 'copied'
            ? 'border-(--color-jade-400)/40 text-(--color-jade-300)'
            : 'border-(--border-subtle) text-(--text-primary) hover:border-(--border-interactive) hover:bg-(--hover-fill-subtle)'
        )}
      >
        {status === 'copied' ? <CheckIcon /> : <CopyIcon />}
        {status === 'copied' ? 'Copied' : status === 'failed' ? 'Press to select' : 'Copy address'}
      </button>

      <span aria-live="polite" className="sr-only">
        {status === 'copied' && `${email} copied to clipboard`}
        {status === 'failed' && 'Could not copy automatically. Select the address to copy it.'}
      </span>
    </>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 5V3.5A1.5 1.5 0 008.5 2h-5A1.5 1.5 0 002 3.5v5A1.5 1.5 0 003.5 10H5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M3 8l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
