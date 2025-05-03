"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { polygon } from "wagmi/chains"
import { POLYGON_CHAIN_ID } from "@/lib/constants"
import type { WalletErrorType } from "@/components/wallet-error"
import { useToast } from "./toast-context"
import { ethers } from "ethers"
import { JsonRpcProvider } from "ethers"

// Import the error logging utilities at the top of the file
import { logError, parseWalletError, ErrorSeverity, type LoggedError } from "@/lib/error-logger"

// Update the WalletError type to include more details
type WalletError = {
  type: WalletErrorType
  message: string
  errorId?: string
  details?: string
}

type WalletContextType = {
  isWalletModalOpen: boolean
  openWalletModal: (callbackAction?: () => void) => void
  closeWalletModal: () => void
  pendingAction: (() => void) | null
  clearPendingAction: () => void
  address: string | undefined
  isConnected: boolean
  isConnecting: boolean
  isDisconnecting: boolean
  isWrongNetwork: boolean
  connect: () => void
  disconnect: () => void
  switchToPolygon: () => void
  chainId: number | undefined
  error: WalletError | null
  clearError: () => void
  retryConnection: () => void
  isPersistenceEnabled: boolean
  togglePersistence: () => void
  recentErrors: LoggedError[]
  clearRecentErrors: () => void
  provider: ethers.BrowserProvider | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Local storage keys
const PERSISTENCE_ENABLED_KEY = "polking:wallet-persistence-enabled"

// In the WalletProvider function, add recentErrors state
export function WalletProvider({ children }: { children: ReactNode }) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [error, setError] = useState<WalletError | null>(null)
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(false)
  const [recentErrors, setRecentErrors] = useState<LoggedError[]>([])
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const { showToast } = useToast()

  // Wagmi hooks
  const { address, isConnected, isConnecting: connecting } = useAccount()
  const { disconnect: wagmiDisconnect, isPending: isDisconnecting } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingNetwork, error: switchError } = useSwitchChain()

  // Check if connected to the wrong network
  const isWrongNetwork = isConnected && chainId !== Number(POLYGON_CHAIN_ID)
  const isConnecting = connecting

  // Initialize persistence setting from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const persistenceEnabled = localStorage.getItem(PERSISTENCE_ENABLED_KEY) === "true"
      setIsPersistenceEnabled(persistenceEnabled)
    }
  }, [])

  // Toggle persistence setting
  const togglePersistence = useCallback(() => {
    const newValue = !isPersistenceEnabled
    setIsPersistenceEnabled(newValue)
    if (typeof window !== "undefined") {
      localStorage.setItem(PERSISTENCE_ENABLED_KEY, newValue.toString())
    }
  }, [isPersistenceEnabled])

  // Update the error handling for network switching
  useEffect(() => {
    if (switchError) {
      const { message, category, severity } = parseWalletError(switchError)

      // Log the error
      const loggedError = logError(
        message,
        category,
        severity,
        switchError,
        { action: "switchNetwork", targetChainId: POLYGON_CHAIN_ID },
        address,
        chainId,
      )

      // Update recent errors
      setRecentErrors((prev) => [loggedError, ...prev.slice(0, 9)])

      // Set the error state
      setError({
        type: severity === ErrorSeverity.INFO ? "rejected" : "network",
        message,
        errorId: loggedError.id,
        details: switchError.message,
      })

      showToast({
        type: "error",
        title: "Network Switch Failed",
        message: message,
        duration: 5000,
      })
    }
  }, [switchError, showToast, address, chainId])

  // Show success toast when connected
  useEffect(() => {
    let hasShownConnectedToast = false;
    if (isConnected && address && !hasShownConnectedToast) {
      hasShownConnectedToast = true;
      // Only show toast if this is a new connection, not on page load
      if (document.visibilityState === 'visible') {
        showToast({
          type: "success",
          title: "Wallet Connected",
          message: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
          duration: 3000,
        })
      }
    }
    return () => {
      hasShownConnectedToast = false;
    }
  }, [isConnected, address, showToast])

  // Show warning toast when on wrong network
  useEffect(() => {
    if (isWrongNetwork) {
      showToast({
        type: "warning",
        title: "Wrong Network",
        message: "Please switch to Polygon Mainnet to use all features",
        duration: 5000,
        action: {
          label: "Switch",
          onClick: () => switchToPolygon(),
        },
      })
    }
  }, [isWrongNetwork, showToast])

  // Open wallet modal
  const openWalletModal = useCallback(
    (callbackAction?: () => void) => {
      if (callbackAction) {
        setPendingAction(() => callbackAction)
      }

      if (isConnected) {
        // If already connected, execute the callback action
        if (callbackAction) {
          callbackAction()
          setPendingAction(null)
        }
      } else {
        // Open the modal
        setIsWalletModalOpen(true)
      }

      // Clear any previous errors
      setError(null)
    },
    [isConnected],
  )

  // Close wallet modal
  const closeWalletModal = useCallback(() => {
    setIsWalletModalOpen(false)
  }, [])

  // Clear pending action
  const clearPendingAction = useCallback(() => {
    setPendingAction(null)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Update the connect function to include better error logging
  const connect = useCallback(() => {
    // Clear any previous errors
    setError(null)

    try {
      // In a real implementation, this would use the wallet connection logic
      // For now, we'll just open the modal
      setIsWalletModalOpen(true)
    } catch (err) {
      // Log the connection error
      const { message, category, severity } = parseWalletError(err)

      const loggedError = logError(message, category, severity, err, { action: "connect" }, undefined, chainId)

      // Update recent errors
      setRecentErrors((prev) => [loggedError, ...prev.slice(0, 9)])

      // Set the error state
      setError({
        type: severity === ErrorSeverity.INFO ? "rejected" : "unknown",
        message,
        errorId: loggedError.id,
        details: err instanceof Error ? err.message : String(err),
      })
    }
  }, [chainId])

  // Retry last connection attempt
  const retryConnection = useCallback(() => {
    connect()
  }, [connect])

  // Disconnect wallet
  const disconnect = useCallback(() => {
    wagmiDisconnect()
    // Clear any errors on disconnect
    setError(null)

    // Show toast notification for disconnect
    showToast({
      type: "info",
      title: "Wallet Disconnected",
      duration: 3000,
    })
  }, [wagmiDisconnect, showToast])

  // Switch to Polygon network
  const switchToPolygon = useCallback(() => {
    // Clear any previous errors
    setError(null)

    if (switchChain) {
      switchChain({ chainId: polygon.id })
      showToast({
        type: "success",
        title: "Network Switched",
        message: "Successfully switched to Polygon Mainnet",
        duration: 3000,
      })
    }
  }, [switchChain, showToast])

  // Auto-switch to Polygon if on wrong network
  useEffect(() => {
    if (isWrongNetwork && isConnected) {
      // Automatically prompt to switch to Polygon
      switchToPolygon()
    }
  }, [isWrongNetwork, isConnected, switchToPolygon])

  // Execute pending action when connected
  useEffect(() => {
    if (isConnected && !isWrongNetwork && pendingAction) {
      pendingAction()
      clearPendingAction()
    }
  }, [isConnected, isWrongNetwork, pendingAction, clearPendingAction])

  // Add a function to clear recent errors
  const clearRecentErrors = useCallback(() => {
    setRecentErrors([])
  }, [])

  // Initialize provider when connected
  useEffect(() => {
    if (isConnected && typeof window !== 'undefined' && window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider)
      setProvider(newProvider)
    } else {
      setProvider(null)
    }
  }, [isConnected])

  // Include recentErrors and clearRecentErrors in the context value
  return (
    <WalletContext.Provider
      value={{
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        pendingAction,
        clearPendingAction,
        address,
        isConnected,
        isConnecting,
        isDisconnecting,
        isWrongNetwork,
        connect,
        disconnect,
        switchToPolygon,
        chainId,
        error,
        clearError,
        retryConnection,
        isPersistenceEnabled,
        togglePersistence,
        recentErrors,
        clearRecentErrors,
        provider
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

const rpcProvider = new JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_URL as string);
