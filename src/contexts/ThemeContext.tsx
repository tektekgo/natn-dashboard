import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'natn-theme'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      return stored || defaultTheme
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (theme === 'system') {
      return getSystemTheme()
    }
    return theme
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remove both classes first
    root.classList.remove('light', 'dark')

    // Determine effective theme
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
    setResolvedTheme(effectiveTheme)

    // Add the appropriate class
    root.classList.add(effectiveTheme)
  }, [theme])

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = getSystemTheme()
        setResolvedTheme(systemTheme)
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
