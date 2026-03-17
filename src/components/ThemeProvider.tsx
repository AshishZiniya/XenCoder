'use client'

import React, { createContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  mounted: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Set mounted on client
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
    })
    
    return () => cancelAnimationFrame(id)
  }, [])

  // Apply dark theme permanently
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
    
    // Clean up any existing theme from localStorage
    localStorage.removeItem('theme')
  }, [mounted])

  const value = {
    theme: 'dark' as Theme,
    resolvedTheme: 'dark' as const,
    mounted,
    setTheme: () => {},
    toggleTheme: () => {},
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
