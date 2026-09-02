import DOMPurify from 'dompurify';

export function sanitizeHtml(value: string | undefined): string {
  if (!value) return '';
  return DOMPurify.sanitize(value);
}