"use client"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, ExternalLink } from "lucide-react"

export default function FlagCounter() {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Check if iframe loaded successfully
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIframeLoaded(true)
    }

    const handleError = () => {
      setIframeError(true)
    }

    iframe.addEventListener("load", handleLoad)
    iframe.addEventListener("error", handleError)

    return () => {
      iframe.removeEventListener("load", handleLoad)
      iframe.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0118] to-[#120630] -z-10" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-2"
          >
            <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#a58af8]/10 border border-[#a58af8]/20">
              <Globe className="w-4 h-4 text-[#a58af8]" />
              <span className="text-sm font-medium text-[#a58af8]">Global Community</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-[#a58af8] to-[#facc15] text-transparent bg-clip-text"
          >
            Our Global Presence
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-white/70"
          >
            Join our growing community of stakers from around the world. Polking is building a global ecosystem of
            crypto enthusiasts.
          </motion.p>
        </div>

        {/* Flag Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#0f0824]/50 backdrop-blur-sm border border-[#a58af8]/10 rounded-2xl p-4 md:p-6 shadow-lg"
        >
          <div className="flex flex-col items-center">
            {/* Flag Counter Iframe */}
            <div className="relative w-full h-[250px] md:h-[300px] mb-4 overflow-hidden rounded-lg bg-[#0f0824] border border-[#a58af8]/30">
              {!iframeError ? (
                <iframe
                  ref={iframeRef}
                  src="https://s11.flagcounter.com/count2/Polking/bg_0F0824/txt_FFFFFF/border_A58AF8/columns_6/maxflags_60/viewers_Polking+Community/labels_1/pageviews_0/flags_0/"
                  title="Flag Counter"
                  className={`w-full h-full ${iframeLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
                  style={{ border: "none" }}
                  onError={() => setIframeError(true)}
                ></iframe>
              ) : null}

              {/* Loading or Error State */}
              {(!iframeLoaded || iframeError) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Globe className="w-16 h-16 text-[#a58af8] mb-4" />
                  {iframeError ? (
                    <>
                      <p className="text-white/80 text-center mb-3">Unable to load global statistics</p>
                      <a
                        href="https://s11.flagcounter.com/count2/Polking/bg_0F0824/txt_FFFFFF/border_A58AF8/columns_6/maxflags_60/viewers_Polking+Community/labels_1/pageviews_0/flags_0/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#a58af8]/20 rounded-lg border border-[#a58af8]/30 text-[#a58af8] text-sm hover:bg-[#a58af8]/30 transition-colors"
                      >
                        <span>View Flag Counter</span>
                        <ExternalLink size={14} />
                      </a>
                    </>
                  ) : (
                    <p className="text-white/80 text-center">Loading global statistics...</p>
                  )}
                </div>
              )}
            </div>

            {/* Caption */}
            <p className="text-white/60 text-sm text-center">
              Polking community members span across the globe, united by a passion for decentralized finance.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
