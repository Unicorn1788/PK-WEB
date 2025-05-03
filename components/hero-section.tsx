"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"

export default function HeroSection() {
  // State to control when animations start (prevents animation on page refresh)
  const [animationReady, setAnimationReady] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Set animation ready after component mounts
  useEffect(() => {
    setAnimationReady(true)
  }, [])

  // Animation variants for heading text
  const headingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const wordVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  // Split heading into words for animation
  const headingWords = ["Stake.", "Earn.", "Rule."]

  // Animation for the gradient background of the heading
  const gradientVariants = {
    hidden: {
      opacity: 0,
      backgroundPosition: "200% center",
    },
    visible: {
      opacity: 1,
      backgroundPosition: "0% center",
      transition: {
        duration: 2,
        ease: "easeOut",
        delay: 1.2,
      },
    },
  }

  // Handle start staking action
  const handleStartStaking = () => {
    const stakingSection = document.getElementById("staking-section")
    if (stakingSection) {
      const offsetPosition = stakingSection.offsetTop - 80
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-16 sm:py-20 overflow-hidden font-sans">
      {/* Modern Background Style */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424]" />

        {/* Modern grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes for modern look */}
        <div className="absolute top-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/10 blur-[80px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/10 blur-[60px]" />
        <div className="absolute top-[40%] right-[15%] w-[20vw] h-[20vw] rounded-full bg-[#a58af8]/5 blur-[100px]" />

        {/* Modern geometric elements */}
        <div className="absolute inset-0">
          {/* Circles */}
          <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full border border-[#a58af8]/20" />
          <div className="absolute top-[25%] right-[30%] w-3 h-3 rounded-full border border-[#facc15]/20" />
          <div className="absolute bottom-[20%] left-[40%] w-4 h-4 rounded-full border border-[#a58af8]/20" />

          {/* Lines */}
          <div className="absolute top-[10%] left-[10%] w-[10vw] h-[1px] bg-gradient-to-r from-[#a58af8]/0 via-[#a58af8]/20 to-[#a58af8]/0 transform rotate-45" />
          <div className="absolute bottom-[20%] right-[15%] w-[15vw] h-[1px] bg-gradient-to-r from-[#facc15]/0 via-[#facc15]/20 to-[#facc15]/0 transform -rotate-45" />

          {/* Rectangles */}
          <div className="absolute top-[40%] left-[5%] w-8 h-8 border border-[#a58af8]/10 transform rotate-45" />
          <div className="absolute bottom-[30%] right-[10%] w-12 h-12 border border-[#facc15]/10 transform rotate-12" />
        </div>

        {/* Animated elements */}
        <div className="absolute inset-0">
          {/* Floating gradient orbs */}
          <motion.div
            animate={{
              x: ["-10%", "10%"],
              y: ["-5%", "5%"],
            }}
            transition={{
              x: { duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
              y: { duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            }}
            className="absolute top-[20%] left-[30%] w-[20vw] h-[20vw] rounded-full bg-[#a58af8]/5 blur-[80px]"
          />
          <motion.div
            animate={{
              x: ["5%", "-5%"],
              y: ["7%", "-7%"],
            }}
            transition={{
              x: { duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
              y: { duration: 22, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            }}
            className="absolute bottom-[20%] right-[20%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/5 blur-[100px]"
          />
        </div>

        {/* Modern glassmorphism overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,1,24,0.4)_70%,rgba(10,1,24,0.8)_100%)]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full grid md:grid-cols-2 items-center gap-8 md:gap-12">
        {/* Right Content (Image on top in mobile) */}
        <div className="order-1 md:order-2 flex justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="relative w-64 h-64 md:w-80 md:h-80"
          >
            {!imageError ? (
              <img
                src="/images/polking-bb.svg"
                alt="Polking Hero"
                width={480}
                height={640}
                className="object-contain drop-shadow-[0_0_15px_rgba(165,138,248,0.5)]"
                onError={() => {
                  console.error("Hero image failed to load")
                  setImageError(true)
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0f0c1a] rounded-full border-2 border-[#a58af8]">
                <div className="text-[#facc15] text-4xl font-bold">POL</div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Left Content (Text & Button below image on mobile) */}
        <div className="order-2 md:order-1 space-y-6 text-center md:text-left">
          {/* Animated heading */}
          <div className="relative">
            {/* Brand name with gradient animation */}
            <motion.h1
              initial="hidden"
              animate={animationReady ? "visible" : "hidden"}
              variants={gradientVariants}
              className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 bg-gradient-to-r from-white via-[#a58af8] to-[#facc15] text-transparent bg-clip-text bg-[length:200%_auto]"
            >
              Polking
            </motion.h1>

            {/* Animated tagline words */}
            <motion.div
              className="flex flex-wrap gap-x-3 justify-center md:justify-start"
              initial="hidden"
              animate={animationReady ? "visible" : "hidden"}
              variants={headingVariants}
            >
              {headingWords.map((word, index) => (
                <motion.span
                  key={index}
                  variants={wordVariants}
                  className="text-2xl md:text-3xl font-bold text-white inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Description with fade in */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={animationReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="text-lg text-white/80"
          >
            Stake like a king. Rise through the ranks. Reign with rewards. Built on Polygon, ruled by you.
          </motion.p>

          {/* Start Staking Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={animationReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 1.8 }}
            className="flex justify-center md:justify-start"
          >
            <div className="relative group">
              {/* Button glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>

              {/* Main button */}
              <button
                onClick={handleStartStaking}
                className="relative flex items-center gap-2 px-8 py-4 bg-[#0f0824] rounded-2xl leading-none"
              >
                <span className="relative flex items-center gap-2">
                  {/* Icon with animated background */}
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#a58af8] to-[#facc15] p-1.5">
                    <TrendingUp className="w-full h-full text-[#0f0824]" />
                  </span>

                  {/* Text with gradient */}
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15]">
                    Start Staking
                  </span>
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
