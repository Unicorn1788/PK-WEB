"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import ConnectWalletButton from "@/components/connect-wallet-button"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { openWalletModal, isConnected } = useWallet()

  useEffect(() => setMounted(true), [])

  // Handle scroll events for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gradient-to-r from-[#0d0d22]/90 to-[#1a0f2e]/90 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
        {/* Logo with Image */}
        <a href="/" className="flex items-center gap-2 group z-20">
          <div className="relative">
            {/* Animated glow effect */}
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="absolute inset-0 rounded-full bg-[#a58af8]/30 blur-md -z-10"
            />
            <div className="relative h-9 w-9">
              {!imageError ? (
                <img
                  src="/images/polking-logo.png"
                  alt="POLKING"
                  width={36}
                  height={36}
                  className="object-contain"
                  onError={() => {
                    console.error("Navbar logo failed to load")
                    setImageError(true)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0f0c1a] rounded-full border border-[#a58af8]">
                  <span className="text-[#facc15] text-xs font-bold">POL</span>
                </div>
              )}
            </div>
          </div>
          <span className="text-xl font-bold tracking-wide bg-gradient-to-r from-white via-[#a58af8] to-[#facc15] bg-clip-text text-transparent">
            POLKING
          </span>
        </a>

        {/* Wallet Connection */}
        <div className="flex items-center">
          {mounted && <ConnectWalletButton />}
        </div>
      </div>
    </header>
  )
}
