'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollProgressBar } from '@/components/motion/ScrollProgressBar';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useFrame } from '@/hooks/useFrame';
import { cn } from '@/lib/utils/cn';
import type { SectionId } from '@/content/site';

type NavSection = { id: SectionId; label: string; index: string };

type NavigationProps = {
  sections: readonly NavSection[];
  name: string;
  resumeHref: string;
};

/** Distance after which the pill compresses to yield space to content. */
const COMPRESS_AT = 80;

export function Navigation({ sections, name, resumeHref }: NavigationProps) {
  const ids = useRef(sections.map((section) => section.id)).current;
  const activeId = useActiveSection(ids);

  const headerRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Compression is a data attribute written straight to the DOM rather than
   * React state. It crosses the threshold rarely, but routing it through state
   * would still re-render the nav on every crossing for a purely visual change
   * that CSS can express on its own.
   */
  useFrame(({ scrollY }) => {
    const header = headerRef.current;
    if (!header) return;
    const compressed = scrollY > COMPRESS_AT ? 'true' : 'false';
    if (header.dataset.compressed !== compressed) header.dataset.compressed = compressed;
  });

  const openMenu = useCallback(() => {
    dialogRef.current?.showModal();
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Native <dialog> supplies the focus trap, Escape handling, and background
  // inertness. Syncing state from the `close` event covers every path out,
  // including the Escape key we never wired ourselves.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      setMenuOpen(false);
      triggerRef.current?.focus();
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  return (
    <header ref={headerRef} className="group/nav" data-compressed="false">
      <ScrollProgressBar />

      {/* ---------------- Desktop: floating glass pill ---------------- */}
      <nav
        aria-label="Primary"
        className={cn(
          'fixed top-6 left-1/2 z-[80] hidden -translate-x-1/2 lg:flex',
          'items-center gap-1 rounded-full p-1.5',
          'border border-(--glass-border) bg-(--glass-bg) shadow-(--e3) backdrop-blur-[24px]',
          'transition-opacity duration-(--dur-base) ease-(--ease-standard)',
          'group-data-[compressed=true]/nav:opacity-90'
        )}
      >
        <ul className="flex items-center gap-1">
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative flex h-9 items-center rounded-full px-4 text-[0.9375rem]',
                    'transition-colors duration-(--dur-fast) ease-(--ease-standard)',
                    isActive
                      ? 'bg-(--hover-fill) text-(--text-primary)'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  )}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>

        <span className="mx-1 h-5 w-px bg-(--border-subtle)" aria-hidden="true" />

        <a
          href={resumeHref}
          download
          className={cn(
            'flex h-9 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-medium',
            'text-(--text-primary) transition-colors duration-(--dur-fast)',
            'hover:bg-(--hover-fill)'
          )}
        >
          Resume
          <DownloadIcon />
        </a>
      </nav>

      {/* ---------------- Mobile: bar + dialog menu ---------------- */}
      <div
        className={cn(
          'fixed inset-x-0 top-0 z-[80] flex h-15 items-center justify-between px-(--gutter) lg:hidden',
          'border-b border-transparent bg-transparent',
          'transition-colors duration-(--dur-base) ease-(--ease-standard)',
          'group-data-[compressed=true]/nav:border-(--border-subtle)',
          'group-data-[compressed=true]/nav:bg-(--glass-bg)',
          'group-data-[compressed=true]/nav:backdrop-blur-[24px]'
        )}
      >
        <a href="#hero" className="t-label text-(--text-primary)">
          {name}
        </a>

        <button
          ref={triggerRef}
          type="button"
          onClick={openMenu}
          aria-expanded={menuOpen}
          aria-controls="primary-menu"
          aria-label="Open navigation menu"
          className="-mr-2 flex size-11 items-center justify-center rounded-full text-(--text-primary)"
        >
          <MenuIcon />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        id="primary-menu"
        aria-label="Navigation"
        className={cn(
          'm-0 h-full max-h-none w-full max-w-none bg-(--surface-veil) p-0 text-(--text-primary)',
          'backdrop:bg-(--scrim-heavy) open:flex open:flex-col'
        )}
      >
        <div className="flex h-15 items-center justify-end px-(--gutter)">
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-(--text-primary)"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Primary" className="flex flex-1 flex-col justify-center px-(--gutter)">
          <ul className="flex flex-col gap-6">
            {sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={closeMenu}
                  aria-current={activeId === section.id ? 'true' : undefined}
                  className="t-display-2 flex items-baseline gap-5 text-(--text-primary)"
                  style={{ transitionDelay: `calc(${i} * var(--stagger))` }}
                >
                  <span className="t-label text-(--text-tertiary)" data-numeric>
                    {section.index}
                  </span>
                  {section.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={resumeHref}
            download
            onClick={closeMenu}
            className="mt-12 inline-flex h-13 w-fit items-center gap-2 rounded-full bg-(--text-primary) px-6 text-[0.9375rem] font-medium text-(--surface-void)"
          >
            Resume
            <DownloadIcon />
          </a>
        </nav>
      </dialog>
    </header>
  );
}

/* Icons are 1.5px stroke, rounded caps, from one set. Always aria-hidden —
   the accessible name lives on the control. */

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 6.5h14M3 13.5h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5v7m0 0L4.25 5.75M7 8.5l2.75-2.75M2 10.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
