"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode // Komponen fallback opsional
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Anda bisa mencatat error ke service reporting eksternal di sini
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // Render UI fallback jika ada error
      // Jika fallback tidak disediakan, render null (menyembunyikan error)
      return this.props.fallback !== undefined ? this.props.fallback : null
    }

    // Render children jika tidak ada error
    return this.props.children
  }
}

export default ErrorBoundary
