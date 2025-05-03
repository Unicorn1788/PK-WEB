import type { Hash, TransactionReceipt } from "viem"
import { POLYGON_EXPLORER_URL } from "@/lib/constants"

export type TransactionStatus = "pending" | "success" | "error" | "cancelled"

export interface TransactionDetails {
  hash: Hash
  description: string
  status: TransactionStatus
  receipt?: TransactionReceipt
  error?: Error
  timestamp: number
  gasEstimate?: bigint // Added gas estimate
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: Hash): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(hash: Hash): string {
  return `${POLYGON_EXPLORER_URL}/tx/${hash}`
}

/**
 * Get a user-friendly message based on transaction status
 */
export function getTransactionStatusMessage(status: TransactionStatus): string {
  switch (status) {
    case "pending":
      return "Your transaction is being processed"
    case "success":
      return "Transaction confirmed successfully"
    case "error":
      return "Transaction failed"
    case "cancelled":
      return "Transaction was cancelled"
    default:
      return "Unknown transaction status"
  }
}

/**
 * Get estimated confirmation time based on current network conditions
 * This is a placeholder - in a real app, you might want to get this from a gas API
 */
export function getEstimatedConfirmationTime(): string {
  // For now, just return a static estimate
  return "~30 seconds"
}

/**
 * Parse error message from transaction error
 */
export function parseTransactionError(error: any): string {
  // Handle common error types
  if (typeof error === "string") return error

  if (error?.message) {
    // Extract the most relevant part of the error message
    const message = error.message

    if (message?.includes("user rejected")) {
      return "Transaction was rejected"
    }

    if (message?.includes("insufficient funds")) {
      return "Insufficient funds for transaction"
    }

    if (message?.includes("gas required exceeds allowance")) {
      return "Gas required exceeds allowance"
    }

    // Return the error message, truncated if too long
    return typeof message === 'string' && message.length > 100 ? `${message.substring(0, 100)}...` : message || "Unknown error occurred"
  }

  return "Unknown error occurred"
}
