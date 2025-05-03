"use client"

import { useCallback, useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { logError, parseWalletError, ErrorSeverity } from "@/lib/error-logger"

interface UseWalletErrorHandlerOptions {
  onError?: (message: string) => void
  captureRejections?: boolean
}

export function useWalletErrorHandler(options: UseWalletErrorHandlerOptions = {}) {
  const { address, chainId } = useWallet()
  const [lastError, setLastError] = useState<Error | null>(null)
  const [isHandlingError, setIsHandlingError] = useState(false)

  const handleError = useCallback(
    (error: unknown, context?: Record<string, unknown>) => {
      setIsHandlingError(true)

      try {
        // Parse the error
        const { message, category, severity } = parseWalletError(error)

        // Skip user rejections if captureRejections is false
        if (!options.captureRejections && severity === ErrorSeverity.INFO && message.includes("rejected")) {
          return
        }

        // Log the error
        logError(message, category, severity, error, context, address, chainId)

        // Set the last error
        if (error instanceof Error) {
          setLastError(error)
        } else {
          setLastError(new Error(message))
        }

        // Call the onError callback if provided
        if (options.onError) {
          options.onError(message)
        }
      } finally {
        setIsHandlingError(false)
      }
    },
    [address, chainId, options],
  )

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  return {
    handleError,
    lastError,
    isHandlingError,
    clearError,
  }
}
