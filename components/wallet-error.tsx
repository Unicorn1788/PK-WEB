"use client"

import type React from "react"

import { AlertCircle, XCircle, WifiOff, ShieldAlert, HelpCircle } from "lucide-react"
import { useState } from "react"

export type WalletErrorType = "rejected" | "unavailable" | "network" | "unsupported" | "timeout" | "unknown"

interface WalletErrorProps {
  type: WalletErrorType
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function WalletError({ type, message, onRetry, onDismiss, className = "" }: WalletErrorProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  // Default messages based on error type
  const defaultMessages: Record<WalletErrorType, string> = {
    rejected: "You rejected the connection request. Please approve the connection in your wallet.",
    unavailable: "Wallet not detected. Please install a wallet extension or open in a wallet browser.",
    network: "Network connection issue. Please check your internet connection and try again.",
    unsupported: "This wallet or chain is not supported by this application.",
    timeout: "Connection request timed out. Please try again.",
    unknown: "An unknown error occurred while connecting to your wallet.",
  }

  // Icons based on error type
  const icons: Record<WalletErrorType, React.ReactNode> = {
    rejected: <XCircle className="w-5 h-5 text-red-400" />,
    unavailable: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    network: <WifiOff className="w-5 h-5 text-red-400" />,
    unsupported: <AlertCircle className="w-5 h-5 text-amber-400" />,
    timeout: <AlertCircle className="w-5 h-5 text-amber-400" />,
    unknown: <HelpCircle className="w-5 h-5 text-amber-400" />,
  }

  // Colors based on error type
  const colors: Record<WalletErrorType, { bg: string; border: string }> = {
    rejected: { bg: "bg-red-500/10", border: "border-red-500/30" },
    unavailable: { bg: "bg-amber-500/10", border: "border-amber-500/30" },
    network: { bg: "bg-red-500/10", border: "border-red-500/30" },
    unsupported: { bg: "bg-amber-500/10", border: "border-amber-500/30" },
    timeout: { bg: "bg-amber-500/10", border: "border-amber-500/30" },
    unknown: { bg: "bg-amber-500/10", border: "border-amber-500/30" },
  }

  const displayMessage = message || defaultMessages[type]
  const { bg, border } = colors[type]

  return (
    <div className={`p-3 rounded-lg ${bg} ${border} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <p className="text-sm text-white/90 mb-2">{displayMessage}</p>
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs px-3 py-1.5 bg-[#a58af8]/20 hover:bg-[#a58af8]/30 rounded-lg text-[#a58af8] transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
