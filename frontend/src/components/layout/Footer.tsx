/**
 * Footer Component
 * Page footer with links and copyright
 */

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and copyright */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} GraymatterLab. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors-fast"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors-fast"
            >
              Support
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors-fast"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors-fast"
            >
              Terms
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
