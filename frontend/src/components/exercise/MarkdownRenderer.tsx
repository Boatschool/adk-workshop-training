/**
 * Markdown Renderer Component
 * Renders markdown content with proper styling and XSS sanitization
 */

import { useMemo } from 'react'
import DOMPurify from 'dompurify'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * DOMPurify configuration for strict HTML sanitization.
 * Only allows safe tags and attributes for markdown content.
 */
const DOMPURIFY_CONFIG = {
  // Allow only safe HTML tags for markdown content
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'figure', 'figcaption',
    'div', 'span', 'section', 'article',
    'dl', 'dt', 'dd', 'sub', 'sup', 'mark', 'abbr',
  ],
  // Allow only safe attributes
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'name',
    'target', 'rel', 'width', 'height', 'loading',
    'colspan', 'rowspan', 'scope',
    'aria-label', 'aria-describedby', 'role',
  ],
  // Only allow safe URI schemes - anchored regex prevents whitespace/javascript bypass
  // Matches:
  // - Absolute URLs: https://, http://, mailto:, tel:
  // - Anchor links: #section
  // - Absolute paths: /path/to/page
  // - Relative paths: ./lesson-1, ../images/diagram.png
  // - Bare relative paths: images/photo.jpg (no colon before first slash)
  // Blocks: javascript:, data:, vbscript:, and any scheme with leading whitespace
  ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):|^[#/.]|^[^:]*$/i,
  // Prevent DOM clobbering attacks
  SANITIZE_DOM: true,
  // Remove dangerous content
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
}

/**
 * Sanitizes HTML content using DOMPurify with strict allowlist.
 * This properly handles entity decoding, xlink: attributes, srcset, and other XSS vectors
 * that regex-based sanitizers miss.
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG) as string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Memoize sanitization to avoid re-running on every render
  const sanitizedContent = useMemo(() => sanitizeHtml(content), [content])

  return (
    <div
      className={`prose prose-gray dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-p:text-gray-600 dark:prose-p:text-gray-300
        prose-a:text-primary-600 dark:prose-a:text-primary-400
        prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-100
        prose-li:text-gray-600 dark:prose-li:text-gray-300
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
