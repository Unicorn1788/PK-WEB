"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket, Star, Link2, Globe, CheckCircle2 } from "lucide-react"

// Roadmap data with icons and completion status
const roadmap = [
  {
    quarter: "Q1 2024",
    title: "Launch POL Token",
    description: "Token deployment, website launch, and community onboarding.",
    icon: <Rocket className="w-full h-full text-[#a58af8]" />,
    isCompleted: true,
  },
  {
    quarter: "Q2 2024",
    title: "Staking Platform",
    description: "Launch staking, referral, and rewards dashboard with realtime tracking.",
    icon: <Star className="w-full h-full text-[#a58af8]" />,
    isCompleted: false,
  },
  {
    quarter: "Q3 2024",
    title: "CEX Listings & Audit",
    description: "Apply for centralized exchange listings and complete smart contract audit.",
    icon: <Link2 className="w-full h-full text-[#a58af8]" />,
    isCompleted: false,
  },
  {
    quarter: "Q4 2024",
    title: "NFT Integration",
    description: "Introduce NFT-based achievements and collectibles for stakers and top affiliates.",
    icon: <Star className="w-full h-full text-[#a58af8]" />,
    isCompleted: false,
  },
  {
    quarter: "Q1 2025",
    title: "Cross-chain Expansion",
    description: "Launch support on additional EVM chains and cross-chain staking options.",
    icon: <Globe className="w-full h-full text-[#a58af8]" />,
    isCompleted: false,
  },
]

const RoadmapSection = () => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  // Toggle expanded item
  const toggleExpand = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-br from-black via-[#0b0614] to-[#0c0717] text-white px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes */}
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/5 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/5 blur-[60px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 relative inline-block">
            <span className="text-gradient-gold">Polking Roadmap</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            From token birth to cross-chain domination, follow our journey to Web3 conquest.
          </p>
        </div>

        {/* Desktop Timeline (horizontal stepped) - Hidden on mobile */}
        <div className="hidden md:block relative mb-8">
          {/* Horizontal connecting line */}
          <div className="absolute top-[40px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#a58af8]/20 via-[#a58af8] to-[#a58af8]/20" />

          {/* Timeline steps */}
          <div className="flex justify-between relative">
            {roadmap.map((item, index) => (
              <div key={index} className="flex flex-col items-center relative">
                {/* Icon with glow effect */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                    item.isCompleted
                      ? "bg-gradient-to-br from-[#a58af8] to-[#facc15]"
                      : "bg-[#0f0c1a] border border-[#a58af8]"
                  }`}
                  onClick={() => toggleExpand(index)}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 5px rgba(165,138,248,0.3)",
                        "0 0 15px rgba(165,138,248,0.6)",
                        "0 0 5px rgba(165,138,248,0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="w-6 h-6"
                  >
                    {item.icon}
                  </motion.div>

                  {/* Completed checkmark */}
                  {item.isCompleted && (
                    <div className="absolute -bottom-1 -right-1 bg-[#0f0c1a] rounded-full p-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#facc15]" />
                    </div>
                  )}
                </motion.div>

                {/* Quarter tag */}
                <div className="mt-3 px-3 py-1 bg-[#0f0c1a] border border-[#a58af8]/30 rounded-full text-xs text-[#a58af8]">
                  {item.quarter}
                </div>

                {/* Title (only visible on hover/click) */}
                <AnimatePresence>
                  {expandedItem === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: 10, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[80px] w-[200px] bg-[#0f0c1a]/90 backdrop-blur-sm border border-[#a58af8]/30 rounded-lg p-3 shadow-[0_0_20px_rgba(165,138,248,0.2)] z-20"
                    >
                      <h3 className="font-semibold text-sm text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-white/70">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline (vertical) - Hidden on desktop */}
        <div className="md:hidden">
          <div className="relative pl-8">
            {/* Vertical connecting line */}
            <div className="absolute top-0 bottom-0 left-4 w-[2px] bg-gradient-to-b from-[#a58af8]/20 via-[#a58af8] to-[#a58af8]/20" />

            {roadmap.map((item, index) => (
              <div key={index} className="mb-4 last:mb-0 relative">
                {/* Connecting dot */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 5px rgba(165,138,248,0.3)",
                      "0 0 10px rgba(165,138,248,0.6)",
                      "0 0 5px rgba(165,138,248,0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className={`absolute left-4 top-4 w-[10px] h-[10px] rounded-full -translate-x-[5px] ${
                    item.isCompleted ? "bg-[#facc15]" : "bg-[#a58af8]"
                  }`}
                />

                {/* Card */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleExpand(index)}
                  className={`bg-[#0f0c1a]/70 backdrop-blur-sm rounded-lg border transition-all duration-300 ${
                    expandedItem === index
                      ? "border-[#a58af8] shadow-[0_0_20px_rgba(165,138,248,0.3)]"
                      : "border-[#a58af8]/30"
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-center p-3">
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center p-1.5 mr-3 ${
                        item.isCompleted
                          ? "bg-gradient-to-br from-[#a58af8] to-[#facc15]"
                          : "bg-[#0f0c1a] border border-[#a58af8]/50"
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        {/* Quarter tag */}
                        <div className="px-2 py-0.5 bg-[#0f0c1a] border border-[#a58af8]/30 rounded-full text-[10px] text-[#a58af8]">
                          {item.quarter}
                        </div>

                        {/* Completed indicator */}
                        {item.isCompleted && (
                          <div className="flex items-center gap-1 text-[10px] text-[#facc15]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm text-white mt-1">{item.title}</h3>
                    </div>
                  </div>

                  {/* Expandable description */}
                  <AnimatePresence>
                    {expandedItem === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-3 pb-3 overflow-hidden"
                      >
                        <div className="pt-2 border-t border-[#a58af8]/10">
                          <p className="text-xs text-white/70">{item.description}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RoadmapSection
