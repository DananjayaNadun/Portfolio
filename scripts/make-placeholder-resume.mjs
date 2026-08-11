/**
 * Writes a clearly-labelled placeholder PDF to public/resume.pdf.
 *
 * The nav, hero and contact section all link to a resume. Without a file there,
 * the single highest-intent action on the site — the one a recruiter takes to
 * put you in their tracking system — returns a 404, which is worse than the
 * link not existing.
 *
 * This is a stand-in, and it says so on its only page. Replace it with the real
 * document; nothing in the app needs to change.
 *
 *   node scripts/make-placeholder-resume.mjs
 */

import { writeFileSync } from 'node:fs';

const LINES = [
  ['Resume placeholder', 22, 700],
  ['This file is a stand-in generated during development.', 12, 660],
  ['Replace public/resume.pdf with the real document.', 12, 642],
  ['No application code needs to change.', 12, 624],
];

const content =
  'BT\n' +
  LINES.map(
    ([text, size, y]) => `/F1 ${size} Tf\n1 0 0 1 64 ${y} Tm\n(${String(text).replace(/[()\\]/g, '\\$&')}) Tj`
  ).join('\n') +
  '\nET\n';

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
  `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];

let pdf = '%PDF-1.4\n';
const offsets = [0];

objects.forEach((body, index) => {
  offsets.push(pdf.length);
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefStart = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let i = 1; i <= objects.length; i += 1) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

writeFileSync('public/resume.pdf', pdf, 'latin1');
console.log(`wrote public/resume.pdf (${pdf.length} bytes) — placeholder, replace before launch`);
