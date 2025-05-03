"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { FaTelegramPlane } from "react-icons/fa"
import { SiX, SiGithub } from "react-icons/si"
import { IoDocumentTextOutline } from "react-icons/io5"
import LanguageSelector from "./language-selector"

const FooterSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Show button when page is scrolled down with proper window checks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="relative bg-gradient-to-b from-[#0a0118] to-black text-white">
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a58af8]/50 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-16 h-16 mb-3">
            {!imageError ? (
              <img
                src="/images/polking-logo.png"
                alt="Polking Logo"
                width={64}
                height={64}
                className="object-contain"
                onError={() => {
                  console.error("Footer logo failed to load")
                  setImageError(true)
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0f0c1a] rounded-full border-2 border-[#a58af8]">
                <span className="text-[#facc15] text-xl font-bold">POL</span>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#eab308] to-[#a58af8] mb-1">
            Polking
          </h3>

          <p className="text-white/60 text-sm text-center max-w-xs">
            Built on Polygon. Reign with rewards. Stake like a king.
          </p>
        </div>

        {/* Language Selector - Added here */}
        <div className="mb-6">
          <LanguageSelector variant="footer" />
        </div>

        {/* Social Icons */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {[
            { icon: <FaTelegramPlane className="w-5 h-5" />, label: "Telegram" },
            { icon: <SiX className="w-5 h-5" />, label: "X" },
            { icon: <SiGithub className="w-5 h-5" />, label: "GitHub" },
            { icon: <IoDocumentTextOutline className="w-5 h-5" />, label: "Docs" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="relative group"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-10 h-10 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center relative overflow-hidden">
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#a58af8]/0 via-[#a58af8]/30 to-[#a58af8]/0"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />

                <span className="relative z-10 text-white/80 group-hover:text-white transition-colors">
                  {item.icon}
                </span>
              </div>

              <span className="sr-only">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-white/40 text-xs">
          Built with vision and secured with code — © {new Date().getFullYear()} Polking.
        </div>

        {/* Back to top button */}
        <motion.button
          onClick={scrollToTop}
          className={`fixed right-6 bottom-6 w-10 h-10 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center shadow-lg z-50 ${
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          animate={{
            y: isVisible ? [0, -5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 text-[#a58af8]" />
        </motion.button>
      </div>
    </footer>
  )
}

export default FooterSection
