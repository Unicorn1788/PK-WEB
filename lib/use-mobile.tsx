"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with false to match server-side rendering
  const [isMobile, setIsMobile] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Strict window check for production
    if (typeof window === 'undefined') {
      return
    }

    setMounted(true)
    const checkMobile = () => {
      // Additional safety check
      if (typeof window === 'undefined') return
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkMobile()

    // Add event listener with safety check
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener("change", checkMobile)
      return () => mql.removeEventListener("change", checkMobile)
    }
  }, [])

  // Return false during SSR and initial client render
  return mounted ? isMobile : false
}
