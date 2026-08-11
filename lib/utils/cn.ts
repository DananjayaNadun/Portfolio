type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Joins class names, dropping falsy values.
 *
 * Deliberately not `tailwind-merge`: with a token-driven system, components
 * don't fight each other over conflicting utilities, so the extra dependency
 * and its runtime parse would buy nothing.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];

  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }

  return out.join(' ');
}
