/**
 * Tip Card Component
 * Displays pro tips for workshop participants
 */

interface TipCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function TipCard({ icon, title, description }: TipCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
