/**
 * Code Block with Copy Button
 * Displays code with syntax highlighting and copy functionality
 */

import { CopyButton } from './CopyButton'
import { cn } from '@utils/cn'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  className?: string
}

export function CodeBlock({ code, language = 'bash', title, className }: CodeBlockProps) {
  return (
    <div className={cn('relative group', className)}>
      {title && (
        <div className="px-4 py-2 bg-gray-800 dark:bg-gray-900 rounded-t-lg border-b border-gray-700">
          <span className="text-xs font-medium text-gray-300">{title}</span>
        </div>
      )}
      <div className="relative">
        <pre className={cn(
          'p-4 bg-gray-900 dark:bg-black overflow-x-auto',
          title ? 'rounded-b-lg' : 'rounded-lg'
        )}>
          <code className={cn('text-sm text-gray-100', `language-${language}`)}>
            {code}
          </code>
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
      </div>
    </div>
  )
}
