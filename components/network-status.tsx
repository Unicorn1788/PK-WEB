"use client"

import { useWallet } from "@/context/wallet-context"
import { AlertCircle } from "lucide-react"

export default function NetworkStatus() {
  const { isConnected, isWrongNetwork, chainId, switchToPolygon } = useWallet()

  if (!isConnected) return null

  // If connected to Polygon, show nothing
  if (!isWrongNetwork) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-amber-500/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center gap-2 max-w-xs sm:max-w-md">
      <AlertCircle className="w-5 h-5 text-black flex-shrink-0" />
      <div className="text-sm text-black">Please switch to Polygon Mainnet</div>
      <button
        onClick={switchToPolygon}
        className="ml-2 px-3 py-1 bg-black text-white text-xs rounded-md hover:bg-black/80 transition-colors"
      >
        Switch Network
      </button>
    </div>
  )
}
