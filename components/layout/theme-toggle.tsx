'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Set initial theme from document (pre-set by ThemeScript) after mount
  useEffect(() => {
    setMounted(true)
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')
    }
  }, [])

  // Apply theme changes and persist
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      window.localStorage.setItem('theme', theme)
    } catch {}
  }, [mounted, theme])

  const title = mounted ? (theme === 'dark' ? 'Switch to light' : 'Switch to dark') : 'Toggle theme'

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
      className="p-2 rounded-lg hover:bg-surface/50 text-text/80 hover:text-text transition-colors"
      title={title}
    >
      {mounted ? (
        theme === 'dark' ? (
          // Sun icon (show when dark to switch to light)
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 0 1-1v-1a1 1 0 1 0-2 0v1a1 1 0 0 0 1 1Zm0-18a1 1 0 0 0 1-1V2a1 1 0 1 0-2 0v1a1 1 0 0 0 1 1Zm10 7h-1a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2ZM3 12a1 1 0 0 0-1-1H1a1 1 0 1 0 0 2h1a1 1 0 0 0 1-1Zm15.657 6.243-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0-1.414-1.414ZM5.636 6.05l-.707-.707A1 1 0 1 0 3.515 6.757l.707.707A1 1 0 0 0 5.636 6.05Zm13.02-1.414.707-.707A1 1 0 0 0 17.243 2.1l-.707.707A1 1 0 1 0 18.657 4.636ZM6.05 18.364l-.707.707A1 1 0 1 0 6.757 20.485l.707-.707A1 1 0 1 0 6.05 18.364Z" />
          </svg>
        ) : (
          // Moon icon (show when light to switch to dark)
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M21.752 15.002A9.718 9.718 0 0 1 12.75 22C7.365 22 3 17.635 3 12.25a9.718 9.718 0 0 1 6.998-9.002.75.75 0 0 1 .832 1.06 8.218 8.218 0 0 0-.78 3.49c0 4.548 3.702 8.25 8.25 8.25 1.219 0 2.376-.265 3.49-.78a.75.75 0 0 1 .962.734Z" />
          </svg>
        )
      ) : (
        // Fallback icon during SSR/initial hydration to avoid mismatch
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <circle cx="12" cy="12" r="6" />
        </svg>
      )}
    </button>
  )
}
