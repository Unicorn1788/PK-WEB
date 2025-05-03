/**
 * Error logging utility for wallet connection and Web3 interactions
 */

// Error categories for better organization
export enum ErrorCategory {
  WALLET_CONNECTION = "wallet_connection",
  NETWORK_SWITCHING = "network_switching",
  TRANSACTION = "transaction",
  CONTRACT_INTERACTION = "contract_interaction",
  SIGNATURE = "signature",
  UNKNOWN = "unknown",
}

// Error severity levels
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Structured error object
export interface LoggedError {
  id: string
  timestamp: number
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  originalError?: unknown
  context?: Record<string, unknown>
  userAddress?: string
  chainId?: number
}

// Generate a unique error ID
function generateErrorId(): string {
  if (typeof window === 'undefined') {
    return 'server-error-id';
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Main error logging function
export function logError(
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  originalError?: unknown,
  context?: Record<string, unknown>,
  userAddress?: string,
  chainId?: number,
): LoggedError {
  const errorObj: LoggedError = {
    id: generateErrorId(),
    timestamp: typeof window === 'undefined' ? 0 : Date.now(),
    category,
    severity,
    message,
    originalError,
    context,
    userAddress,
    chainId,
  }

  // Log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.group(
      `%c${category.toUpperCase()} - ${severity.toUpperCase()}`,
      `color: ${getSeverityColor(severity)}; font-weight: bold;`,
    )
    console.log(`Message: ${message}`)
    if (originalError) console.error("Original error:", originalError)
    if (context) console.log("Context:", context)
    if (userAddress) console.log("User address:", userAddress)
    if (chainId) console.log("Chain ID:", chainId)
    console.log("Timestamp:", new Date(errorObj.timestamp).toISOString())
    console.log("Error ID:", errorObj.id)
    console.groupEnd()
  }

  // In production, you would send this to your error tracking service
  // Example: sendToErrorTrackingService(errorObj);

  return errorObj
}

// Helper to get color for console logging based on severity
function getSeverityColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.INFO:
      return "#3498db" // Blue
    case ErrorSeverity.WARNING:
      return "#f39c12" // Orange
    case ErrorSeverity.ERROR:
      return "#e74c3c" // Red
    case ErrorSeverity.CRITICAL:
      return "#8e44ad" // Purple
    default:
      return "#2c3e50" // Dark blue
  }
}

// Parse wallet connection errors to extract useful information
export function parseWalletError(error: unknown): {
  message: string
  category: ErrorCategory
  severity: ErrorSeverity
} {
  if (!error) {
    return {
      message: "Unknown wallet error",
      category: ErrorCategory.WALLET_CONNECTION,
      severity: ErrorSeverity.ERROR,
    }
  }

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error)

  // Categorize common wallet errors
  if (errorMessage.includes("rejected") || errorMessage.includes("user denied")) {
    return {
      message: "User rejected the connection request",
      category: ErrorCategory.WALLET_CONNECTION,
      severity: ErrorSeverity.INFO, // User action, not a technical error
    }
  }

  if (errorMessage.includes("already processing")) {
    return {
      message: "A wallet connection request is already in progress",
      category: ErrorCategory.WALLET_CONNECTION,
      severity: ErrorSeverity.WARNING,
    }
  }

  if (errorMessage.includes("not installed") || errorMessage.includes("not detected")) {
    return {
      message: "Wallet extension not installed or detected",
      category: ErrorCategory.WALLET_CONNECTION,
      severity: ErrorSeverity.WARNING,
    }
  }

  if (errorMessage.includes("network") || errorMessage.includes("chain")) {
    return {
      message: "Network or chain error",
      category: ErrorCategory.NETWORK_SWITCHING,
      severity: ErrorSeverity.ERROR,
    }
  }

  if (errorMessage.includes("timeout")) {
    return {
      message: "Connection request timed out",
      category: ErrorCategory.WALLET_CONNECTION,
      severity: ErrorSeverity.ERROR,
    }
  }

  // Default case
  return {
    message: `Wallet error: ${errorMessage.substring(0, 150)}${errorMessage.length > 150 ? "..." : ""}`,
    category: ErrorCategory.WALLET_CONNECTION,
    severity: ErrorSeverity.ERROR,
  }
}

// Store recent errors in memory (for debugging purposes)
const recentErrors: LoggedError[] = []
const MAX_STORED_ERRORS = 10

// Add error to recent errors list
export function storeRecentError(error: LoggedError): void {
  recentErrors.unshift(error)
  if (recentErrors.length > MAX_STORED_ERRORS) {
    recentErrors.pop()
  }
}

// Get recent errors
export function getRecentErrors(): LoggedError[] {
  return [...recentErrors]
}

// Clear recent errors
export function clearRecentErrors(): void {
  recentErrors.length = 0
}
