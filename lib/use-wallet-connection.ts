"use client"

import { useState, useCallback, useEffect } from "react"
import { useAccount } from "wagmi"

export function useWalletConnection() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [mounted, setMounted] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    // Strict window check for production
    if (typeof window === 'undefined') return
    setMounted(true)
  }, [])

  const connect = useCallback(async () => {
    // Additional safety check
    if (typeof window === 'undefined' || !mounted) return false

    setIsConnecting(true)
    setError(null)

    try {
      // In a real implementation, this would use the wallet connection logic
      // For now, we'll just return a promise that resolves immediately
      return true
    } catch (err) {
      console.error("Error connecting wallet:", err)
      const error = err instanceof Error ? err : new Error("Failed to connect wallet")
      setError(error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [mounted])

  // Return consistent state during SSR and initial client render
  if (!mounted) {
    return {
      connect,
      isConnecting: false,
      isConnected: false,
      error: null,
    }
  }

  return {
    connect,
    isConnecting,
    isConnected,
    error,
  }
}
