"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Toast, type ToastType, type ToastAction } from "@/components/toast"
import { AnimatePresence, motion } from "framer-motion"
import { v4 as uuidv4 } from "uuid"

export interface Toast {
  type: ToastType
  title: string
  message?: string
  description?: string
  duration?: number
  action?: ToastAction
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

interface ToastContextType {
  showToast: (props: {
    type: ToastType
    title: string
    message?: string
    duration?: number
    action?: ToastAction
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
  }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
  position?: string
}

// Maximum number of toasts to show at once
const MAX_TOASTS = 3

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    ({
      type,
      title,
      message,
      duration,
      action,
      position = "bottom-right",
    }: {
      type: ToastType
      title: string
      message?: string
      duration?: number
      action?: ToastAction
      position?: string
    }) => {
      const id = uuidv4()
      setToasts((prev) => {
        // Remove oldest toast if we've reached the maximum
        const newToasts = prev.length >= MAX_TOASTS ? prev.slice(1) : prev
        return [...newToasts, { id, type, title, message, duration, action, position }]
      })
    },
    [],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || "bottom-right"
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(toast)
    return acc
  }, {} as Record<string, ToastItem[]>)

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Render toasts for each position */}
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed z-50 flex flex-col space-y-2 pointer-events-none ${
            position === "top-right"
              ? "top-0 right-0 p-4 items-end"
              : position === "top-left"
              ? "top-0 left-0 p-4 items-start"
              : position === "bottom-right"
              ? "bottom-0 right-0 p-4 items-end"
              : position === "bottom-left"
              ? "bottom-0 left-0 p-4 items-start"
              : position === "top-center"
              ? "top-0 left-1/2 -translate-x-1/2 p-4 items-center"
              : "bottom-0 left-1/2 -translate-x-1/2 p-4 items-center"
          }`}
        >
          <AnimatePresence>
            {positionToasts.map((toast) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto"
              >
                <Toast
                  id={toast.id}
                  type={toast.type}
                  title={toast.title}
                  message={toast.message}
                  duration={toast.duration}
                  action={toast.action}
                  onClose={removeToast}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
