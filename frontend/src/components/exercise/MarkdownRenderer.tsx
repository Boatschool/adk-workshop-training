/**
 * Markdown Renderer Component
 * Renders markdown content with proper styling
 */

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // For now, render raw HTML content (assumes pre-rendered markdown from API)
  // In a production app, you'd use a library like react-markdown or marked
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
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
