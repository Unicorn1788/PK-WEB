"use client";


import { Wallet, LogOut, ChevronDown, Save, Coins } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import { useWalletErrorHandler } from "@/lib/use-wallet-error-handler"
import { useAppKit } from "@reown/appkit/react"
import { useWalletBalance } from "@/lib/use-wallet-balance"

interface ConnectWalletButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  showAddress?: boolean
  className?: string
}

export default function ConnectWalletButton({
  variant = "default",
  size = "md",
  showAddress = true,
  className = "",
}: ConnectWalletButtonProps) {
  const { address, isConnected, disconnect, isPersistenceEnabled, togglePersistence } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { handleError } = useWalletErrorHandler()
  const { open } = useAppKit()
  const { balances, isLoading } = useWalletBalance()

  // Format address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Button style based on variant and size
  const getButtonStyle = () => {
    let baseStyle = "flex items-center transition-all duration-300 "

    // Size styles
    if (size === "sm") {
      baseStyle += "text-xs px-3 py-1.5 gap-1.5 "
    } else if (size === "lg") {
      baseStyle += "text-base px-5 py-3 gap-2.5 "
    } else {
      baseStyle += "text-sm px-4 py-2 gap-2 "
    }

    // Variant styles
    if (variant === "outline") {
      baseStyle += "border border-[#a58af8]/30 hover:border-[#a58af8]/60 bg-transparent text-white rounded-full "
    } else if (variant === "ghost") {
      baseStyle += "bg-transparent hover:bg-[#a58af8]/10 text-white rounded-full "
    } else {
      baseStyle += "bg-[#0f0824] border border-[#a58af8]/30 hover:border-[#a58af8]/60 rounded-full "
    }

    return baseStyle + className
  }

  // Handle connect click with error handling (now uses Reown AppKit)
  const handleConnect = () => {
    try {
      open()
    } catch (error) {
      handleError(error, { component: "ConnectWalletButton", action: "connect" })
    }
  }

  // Handle disconnect with error handling
  const handleDisconnect = () => {
    try {
      disconnect()
      setIsDropdownOpen(false)
    } catch (error) {
      handleError(error, { component: "ConnectWalletButton", action: "disconnect" })
    }
  }

  if (!isConnected) {
    return (
      <button onClick={handleConnect} className={getButtonStyle()}>
        <Wallet className={`${size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-[#a58af8]`} />
        <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15]">
          Connect Wallet
        </span>
      </button>
    )
  }

  if (showAddress) {
    return (
      <div className="relative">
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={getButtonStyle()}>
          <div
            className={`${size === "sm" ? "w-5 h-5" : size === "lg" ? "w-7 h-7" : "w-6 h-6"} rounded-full bg-[#a58af8]/20 flex items-center justify-center`}
          >
            <Wallet
              className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} text-[#a58af8]`}
            />
          </div>
          <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15]">
            {formatAddress(address)}
          </span>
          <ChevronDown
            className={`${size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-[#a58af8] transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 rounded-lg bg-[#0f0c1a] border border-[#a58af8]/30 shadow-lg overflow-hidden z-50"
            >
              <div className="py-1">
                {/* Wallet Address */}
                <div className="px-4 py-2 border-b border-[#a58af8]/10">
                  <p className="text-xs text-white/60 mb-1">Connected Wallet</p>
                  <p className="text-sm font-medium text-white break-all">{address}</p>
                </div>

                {/* Balances */}
                <div className="px-4 py-2 border-b border-[#a58af8]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-[#a58af8]" />
                    <span className="text-sm font-medium text-white">Balances</span>
                  </div>
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-[#a58af8]/10 rounded animate-pulse" />
                      <div className="h-4 bg-[#a58af8]/10 rounded animate-pulse" />
                    </div>
                  ) : balances.length === 0 ? (
                    <p className="text-xs text-white/60">No balances found</p>
                  ) : (
                    <div className="space-y-2">
                      {balances.map((token) => (
                        <div key={token.symbol} className="flex justify-between items-center">
                          <span className="text-sm text-white/80">{token.symbol}</span>
                          <span className="text-sm font-medium text-white">{token.balance}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Session Persistence */}
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2 text-[#a58af8]" />
                    <span className="text-sm text-white">Save Session</span>
                  </div>
                  <button
                    onClick={() => {
                      togglePersistence()
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      isPersistenceEnabled ? "bg-[#a58af8]" : "bg-[#a58af8]/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPersistenceEnabled ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#a58af8]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2 text-[#a58af8]" />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Simple connected button without address
  return (
    <div className="flex gap-2">
      <button className={getButtonStyle()}>
        <div
          className={`${size === "sm" ? "w-5 h-5" : size === "lg" ? "w-7 h-7" : "w-6 h-6"} rounded-full bg-[#a58af8]/20 flex items-center justify-center`}
        >
          <Wallet
            className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} text-[#a58af8]`}
          />
        </div>
        <span className="text-white">Connected</span>
      </button>

      <button
        onClick={handleDisconnect}
        className={`${size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2"} rounded-full bg-[#0f0824] border border-red-400/30 hover:border-red-400/60 transition-all duration-300`}
      >
        <LogOut className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} text-red-400`} />
      </button>
    </div>
  )
}
