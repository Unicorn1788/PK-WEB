"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, ExternalLink } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
  onClose: (id: string) => void
  children?: React.ReactNode
}

export function Toast({ id, type, title, message, duration = 5000, action, onClose, children }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // Allow animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onClose, mounted])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }

  const colors = {
    success: "bg-green-500/10 border-green-500/30",
    error: "bg-red-500/10 border-red-500/30",
    warning: "bg-amber-500/10 border-amber-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
  }

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${colors[type]}`}
    >
      {icons[type]}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="text-sm text-white/80">{message}</p>
        {children}
      </div>
            {action && (
                <button
                  onClick={action.onClick}
          className="ml-2 rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white hover:bg-white/20"
                >
                  {action.label}
                </button>
            )}
            <button
        onClick={() => onClose(id)}
        className="absolute right-2 top-2 rounded-full p-1 text-white/50 hover:text-white"
            >
        <X className="h-4 w-4" />
            </button>
    </motion.div>
  )
}
