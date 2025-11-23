/**
 * Markdown Renderer Component
 * Renders markdown content with proper styling and XSS sanitization
 */

import { useMemo } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Basic HTML sanitizer to prevent XSS attacks.
 * Removes script tags, event handlers, and dangerous attributes.
 * For production, consider using DOMPurify library.
 */
function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, 'href="#"')

  // Remove data: URLs in src attributes (can be used for XSS)
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*data:[^"'>\s]*/gi, 'src=""')

  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed|form)[^>]*>.*?<\/\1>/gi, '')
  sanitized = sanitized.replace(/<(iframe|object|embed|form)[^>]*\/?>/gi, '')

  // Remove style tags (can contain expressions in older browsers)
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  return sanitized
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
