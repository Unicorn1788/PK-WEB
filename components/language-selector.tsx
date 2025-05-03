"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Check, ChevronDown } from "lucide-react"

// Language options with their codes and names
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "ru", name: "Русский" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
]

interface LanguageSelectorProps {
  variant?: "desktop" | "mobile" | "footer"
}

export default function LanguageSelector({ variant = "desktop" }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside with proper window checks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle language change
  const changeLanguage = (language: (typeof languages)[0]) => {
    setSelectedLanguage(language)
    setIsOpen(false)
    // Here you would typically implement actual language change functionality
    // For example: i18n.changeLanguage(language.code)
    console.log(`Language changed to ${language.name} (${language.code})`)
  }

  // Mobile variant
  if (variant === "mobile") {
    return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-[#a58af8]/10 transition-colors"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
          <Globe className="w-4 h-4 text-[#a58af8]" />
          <span>{selectedLanguage.name}</span>
          <ChevronDown className={`w-4 h-4 ml-auto text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 mt-1 w-full rounded-xl bg-[#0f0c1a]/95 backdrop-blur-md border border-[#a58af8]/30 shadow-lg shadow-black/50 z-50 overflow-hidden"
              >
                <div className="py-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#a58af8]/20 scrollbar-track-transparent">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language)}
                      className={`flex items-center justify-between w-full px-4 py-2 text-sm transition-colors ${
                        selectedLanguage.code === language.code
                          ? "bg-[#a58af8]/20 text-white"
                          : "text-white/70 hover:bg-[#a58af8]/10 hover:text-white"
                      }`}
                    >
                      <span>{language.name}</span>
                      {selectedLanguage.code === language.code && <Check className="w-3.5 h-3.5 text-[#a58af8]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    )
  }

  // Desktop variant (default)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0f0824]/80 border border-[#a58af8]/30 hover:border-[#a58af8]/60 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 text-[#a58af8]" />
        <span className="text-xs text-white/80">{selectedLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-40 rounded-xl bg-[#0f0c1a]/95 backdrop-blur-md border border-[#a58af8]/30 shadow-lg shadow-black/50 z-50 overflow-hidden"
          >
            <div className="py-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#a58af8]/20 scrollbar-track-transparent">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm transition-colors ${
                    selectedLanguage.code === language.code
                      ? "bg-[#a58af8]/20 text-white"
                      : "text-white/70 hover:bg-[#a58af8]/10 hover:text-white"
                  }`}
                >
                  <span>{language.name}</span>
                  {selectedLanguage.code === language.code && <Check className="w-3.5 h-3.5 text-[#a58af8]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}