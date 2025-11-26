import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getStoredTheme, setStoredTheme } from '@utils/storage'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const stored = getStoredTheme()
    if (stored) return stored

    // Check system preference
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : defaultTheme
    }

    return defaultTheme
  })

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    root.setAttribute('data-theme', theme)

    // Also set class for Tailwind dark mode
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setStoredTheme(newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
