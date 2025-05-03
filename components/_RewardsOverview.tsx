"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Gauge, Wallet, CreditCard, TrendingUp } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { useWalletClient, usePublicClient } from 'wagmi'
import PK_RYO_ABI from "@/app/contracts/PK_RYO.json"
import { toast } from "sonner"
import { QueryDBResult, useQueryDB } from "./QueryDB"

const RewardsOverview = () => {
  const queryDBResult = useQueryDB({ filter: "all" });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { openWalletModal, isConnected, address } = useWallet()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [LiveRewards, setLiveRewards] = useState("0.0000")
  const [isClaiming, setIsClaiming] = useState(false)

  // Get data from props instead of using hook
  const {
    data: { allStakes = [] } = {},
    loading = false,
    totalUnclaimed = 0,
    rewardsPerSecond = 0
  } = queryDBResult || { data: { allStakes: [] } };

  // Calculate total rewards
  const totalPassiveRewards = allStakes.reduce((sum, stake) => sum + stake.claimed, 0);
  const totalActiveRewards = allStakes.reduce((sum, stake) => sum + stake.rewardsClaimed, 0);
  const totalWithdrawnPK = (totalPassiveRewards + totalActiveRewards) * 0.3;
  const totalWithdrawnPOL = (totalPassiveRewards + totalActiveRewards) * 0.7;

  // Update live rewards based on rewardsPerSecond
  useEffect(() => {
    if (!rewardsPerSecond) return
    setLiveRewards(totalUnclaimed.toFixed(4))
    const interval = setInterval(() => {
      setLiveRewards(prev => {
        const newValue = Number(prev) + rewardsPerSecond
        return newValue.toFixed(8)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [totalUnclaimed, rewardsPerSecond])

  // Handle claim rewards
  const handleClaimRewards = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet.")
      openWalletModal()
      return
    }

    if (!walletClient || !publicClient) {
      toast.error("Wallet connection not fully ready. Please wait or reconnect.")
      return
    }

    const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
    if (!CONTRACT_ADDRESS) {
      toast.error("Contract address is not configured.")
      return
    }

    setIsClaiming(true)
    const loadingToast = toast.loading("Preparing claim transaction...")

    try {
      // Send the transaction directly
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PK_RYO_ABI,
        functionName: 'claim',
        account: address as `0x${string}`,
      })

      toast.dismiss(loadingToast)
      const confirmationToast = toast.loading("Processing transaction...")

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      toast.dismiss(confirmationToast)
      if (receipt.status === 'success') {
        toast.success("Rewards claimed successfully!")
        // Reset live rewards after successful claim
        setLiveRewards("0.0000")
      } else {
        toast.error("Claim transaction failed. Please check transaction status.")
      }

    } catch (error: any) {
      toast.dismiss(loadingToast)
      let errorMessage = "Claim failed. Please try again.";
      if (error.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error.message) {
        const match = error.message.match(/^(.*?)\n/)
        if (match && match[1]) {
          errorMessage = match[1]
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsClaiming(false)
    }
  }

  // Only use the mounted check to conditionally render JSX
  if (!mounted) return null;

  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424] text-white px-4 sm:px-6 md:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes */}
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/10 blur-[60px]" />

        {/* Animated elements */}
        <motion.div
          animate={{
            x: ["-5%", "5%"],
            y: ["-3%", "3%"],
          }}
          transition={{
            x: { duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            y: { duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
          }}
          className="absolute top-[30%] left-[20%] w-[20vw] h-[20vw] rounded-full bg-[#a58af8]/5 blur-[80px]"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 relative inline-block">
            <span className="text-gradient-gold">Rewards Overview</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Stay updated with your real-time earnings and claimed rewards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]"
        >
          {/* Stats Grid - 2x2 layout with equal heights */}
          <div className="grid grid-cols-2 gap-3 mb-5 mt-1">
            {/* Passive Rewards */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Passive Rewards</p>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-white">{totalPassiveRewards.toFixed(4)} POL</p>
              </div>
            </div>

            {/* Active Rewards */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Active Rewards</p>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-white">{totalActiveRewards.toFixed(4)} POL</p>
              </div>
            </div>

            {/* Total Withdrawn PK */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Total Withdrawn PK</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-[#a58af8]">{totalWithdrawnPK.toFixed(4)} POL</p>
              </div>
            </div>

            {/* Total Withdrawn POL */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Total Withdrawn POL</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-[#a58af8]">{totalWithdrawnPOL.toFixed(4)} POL</p>
              </div>
            </div>
          </div>

          {/* Live Rewards Section - Lighter and centered */}
          <div className="bg-[#0f0c1a]/40 rounded-xl p-4 border border-[#a58af8]/30 mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gauge className="text-[#a58af8] w-5 h-5" />
              <h3 className="text-base font-semibold text-white/80">Live Rewards</h3>
            </div>

            <div className="relative">
              <p className="text-2xl font-bold text-[#a58af8]">{LiveRewards} POL</p>
              <div className="absolute -inset-1 bg-[#a58af8]/5 blur-md rounded-full -z-10"></div>
            </div>

            <p className="text-xs text-white/40">Updated every 10 seconds</p>
          </div>

          {/* Claim Button */}
          <div className="relative group">
            {/* Button glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>

            {/* Main button */}
            <button
              onClick={handleClaimRewards}
              disabled={isClaiming || !isConnected} // Disable while claiming or not connected
              className="relative w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0f0824] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15] text-base">
                {isClaiming ? "Claiming..." : !isConnected ? "Connect Wallet to Claim" : "Claim Rewards"}
              </span>

              {/* Animated border line */}
              {!isClaiming && isConnected && (
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] group-hover:w-[calc(100%-20px)] -translate-x-1/2 transition-all duration-300"></span>
              )}
            </button>
          </div>
        </motion.div>

        {/* --- TESTING QUERYDB OUTPUT --- */}
        <div className="bg-black/60 text-white p-4 rounded-xl mt-8">
          <h4 className="font-bold mb-2">QueryDB Test Output</h4>
          {loading ? (
            <div>Loading stakes...</div>
          ) : (
            <>
              <div>Total Unclaimed: {totalUnclaimed}</div>
              <div>Rewards Per Second: {rewardsPerSecond}</div>
              <div>Stakes Count: {allStakes.length}</div>
              <pre className="text-xs max-h-40 overflow-auto">{JSON.stringify(allStakes, null, 2)}</pre>
            </>
          )}
        </div>
        {/* --- END TESTING --- */}
      </div>
    </section>
  )
}

export default RewardsOverview
