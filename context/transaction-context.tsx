"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Hash, TransactionReceipt } from "viem"
import { useToast } from "./toast-context"
import { usePublicClient } from "wagmi"
import type { TransactionDetails } from "@/lib/transaction"

// Types
type TransactionStatus = "pending" | "success" | "error"

// Utility functions
const formatTxHash = (hash: Hash) => `${hash.slice(0, 6)}...${hash.slice(-4)}`
const getExplorerTxUrl = (hash: Hash) => `https://polygonscan.com/tx/${hash}`
const formatGasCost = (gas: bigint) => `${Number(gas) / 1e18} MATIC`
const parseTransactionError = (error: Error) => error.message.split('\n')[0] || "Transaction failed"

interface TransactionContextType {
  transactions: TransactionDetails[]
  addTransaction: (hash: Hash, description: string, gasEstimate?: bigint) => void
  clearTransactions: () => void
  getTransaction: (hash: Hash) => TransactionDetails | undefined
  isPending: boolean
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

// Maximum number of transactions to keep in history
const MAX_TRANSACTION_HISTORY = 10

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionDetails[]>([])
  const { showToast } = useToast()
  const publicClient = usePublicClient()

  // Calculate if any transactions are pending
  const isPending = transactions.some((tx) => tx.status === "pending")

  // Add a new transaction to track
  const addTransaction = useCallback(
    (hash: Hash, description: string, gasEstimate?: bigint) => {
      const newTx: TransactionDetails = {
        hash,
        description,
        status: "pending",
        timestamp: Date.now(),
        gasEstimate,
      }

      setTransactions((prev) => {
        // Add new transaction at the beginning
        const updated = [newTx, ...prev]

        // Keep only the most recent transactions
        if (updated.length > MAX_TRANSACTION_HISTORY) {
          return updated.slice(0, MAX_TRANSACTION_HISTORY)
        }

        return updated
      })

      // Show pending transaction toast
      showToast({
        type: "info",
        title: "Transaction Submitted",
        message: `${description} - ${formatTxHash(hash)}${gasEstimate ? ` - Est. fee: ${formatGasCost(gasEstimate)}` : ""}`,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => window.open(getExplorerTxUrl(hash), "_blank"),
        },
      })

      return hash
    },
    [showToast],
  )

  // Get a transaction by hash
  const getTransaction = useCallback(
    (hash: Hash) => {
      return transactions.find((tx) => tx.hash === hash)
    },
    [transactions],
  )

  // Clear all transactions
  const clearTransactions = useCallback(() => {
    setTransactions([])
  }, [])

  // Update transaction status
  const updateTransactionStatus = useCallback(
    (hash: Hash, status: TransactionStatus, receipt?: TransactionReceipt, error?: Error) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.hash === hash ? { ...tx, status, receipt, error, timestamp: Date.now() } : tx)),
      )

      const tx = transactions.find((tx) => tx.hash === hash)
      if (!tx) return

      // Show appropriate toast based on status
      if (status === "success") {
        // Calculate actual gas used if receipt is available
        const gasCost = receipt
          ? formatGasCost(receipt.gasUsed * receipt.effectiveGasPrice)
          : tx.gasEstimate
            ? formatGasCost(tx.gasEstimate)
            : undefined

        showToast({
          type: "success",
          title: "Transaction Confirmed",
          message: `${tx.description} was successful${gasCost ? ` - Gas used: ${gasCost}` : ""}`,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => window.open(getExplorerTxUrl(hash), "_blank"),
          },
        })
      } else if (status === "error") {
        showToast({
          type: "error",
          title: "Transaction Failed",
          message: error ? parseTransactionError(error) : `${tx.description} failed`,
          duration: 8000,
          action: {
            label: "View",
            onClick: () => window.open(getExplorerTxUrl(hash), "_blank"),
          },
        })
      }
    },
    [transactions, showToast],
  )

  // Monitor pending transactions
  useEffect(() => {
    const pendingTxs = transactions.filter((tx) => tx.status === "pending")

    pendingTxs.forEach((tx) => {
      // Set up a listener for each pending transaction
      const checkTransaction = async () => {
        try {
          if (!publicClient) return

          const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash })

          if (receipt) {
            // Transaction confirmed
            updateTransactionStatus(tx.hash, receipt.status === "success" ? "success" : "error", receipt)
          }
        } catch (error) {
          console.error("Error checking transaction:", error)
        }
      }

      // Check immediately and then set up interval
      checkTransaction()
      const interval = setInterval(checkTransaction, 5000) // Check every 5 seconds

      return () => clearInterval(interval)
    })
  }, [transactions, updateTransactionStatus, publicClient])

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        clearTransactions,
        getTransaction,
        isPending,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransaction() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransaction must be used within a TransactionProvider")
  }
  return context
}
