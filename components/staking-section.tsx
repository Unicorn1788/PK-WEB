"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Clock, TrendingUp, Users, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import { useWalletBalance } from "@/lib/use-wallet-balance"
import PK_RYO_ABI from "@/app/contracts/PK_RYO.json"
import { toast } from "sonner"
import { useWalletClient, usePublicClient } from 'wagmi'
import { parseEther, isAddress, formatUnits } from 'viem'
import StakeContracts from "./stakecontracts"

// Contract address - replace with your actual contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

interface Plan {
  min: number;
  max: number;
  rate: number;
  days: number;
}

interface Plans {
  tier1: Plan;
  tier2: Plan;
  tier3: Plan;
}

interface StakingState {
  amount: string;
  contractType: string;
  isInputFocused: boolean;
  referrerAddress: string | null;
  isStaking: boolean;
  expandedCards: boolean[];
  minStake: number | null;
  maxStake: number | null;
  plans: Plans | null;
  mounted: boolean;
  shouldReload: boolean;
}

const StakingSection = () => {
  // Combined state
  const [state, setState] = useState<StakingState>({
    amount: "",
    contractType: "plan1",
    isInputFocused: false,
    referrerAddress: null,
    isStaking: false,
    expandedCards: Array(10).fill(false),
    minStake: Number(process.env.NEXT_PUBLIC_TIER1_MIN),
    maxStake: Number(process.env.NEXT_PUBLIC_TIER3_MAX),
    plans: {
      tier1: { 
        min: Number(process.env.NEXT_PUBLIC_TIER1_MIN), 
        max: Number(process.env.NEXT_PUBLIC_TIER1_MAX), 
        rate: Number(process.env.NEXT_PUBLIC_TIER1_RATE), 
        days: Number(process.env.NEXT_PUBLIC_TIER1_DAYS) 
      },
      tier2: { 
        min: Number(process.env.NEXT_PUBLIC_TIER2_MIN), 
        max: Number(process.env.NEXT_PUBLIC_TIER2_MAX), 
        rate: Number(process.env.NEXT_PUBLIC_TIER2_RATE), 
        days: Number(process.env.NEXT_PUBLIC_TIER2_DAYS) 
      },
      tier3: { 
        min: Number(process.env.NEXT_PUBLIC_TIER3_MIN), 
        max: Number(process.env.NEXT_PUBLIC_TIER3_MAX), 
        rate: Number(process.env.NEXT_PUBLIC_TIER3_RATE), 
        days: Number(process.env.NEXT_PUBLIC_TIER3_DAYS) 
      }
    },
    mounted: false,
    shouldReload: false
  })

  // External hooks
  const { openWalletModal, address, isConnected } = useWallet()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { balances, isLoading } = useWalletBalance()

  // Derived values
  const maticBalance = useMemo(() => 
    balances?.find(balance => balance.symbol === "MATIC")?.balance || "0", 
    [balances]
  )
  const userBalance = useMemo(() => parseFloat(maticBalance), [maticBalance])

  // Single mount effect
  useEffect(() => {
    setState(prev => ({ ...prev, mounted: true }))
    return () => setState(prev => ({ ...prev, mounted: false }))
  }, [])

  // Combined effects for referrer
  useEffect(() => {
    if (!state.mounted) return

    // Handle referrer
    const params = new URLSearchParams(window.location.search)
    const refFromUrl = params.get('ref')
    if (refFromUrl && isAddress(refFromUrl)) {
      setState(prev => ({ ...prev, referrerAddress: refFromUrl }))
    }
  }, [state.mounted])

  // Auto-detect tier based on amount
  useEffect(() => {
    if (!state.mounted || !state.plans) return
    const amountNumber = Number(state.amount)
    if (!isNaN(amountNumber)) {
      let newContractType = "plan1"
      if (amountNumber >= state.plans.tier3.min && amountNumber <= state.plans.tier3.max) {
        newContractType = "plan3"
      } else if (amountNumber >= state.plans.tier2.min && amountNumber < state.plans.tier3.min) {
        newContractType = "plan2"
      } else if (amountNumber >= state.plans.tier1.min && amountNumber < state.plans.tier2.min) {
        newContractType = "plan1"
      }
      setState(prev => ({ ...prev, contractType: newContractType }))
    }
  }, [state.amount, state.plans, state.mounted])

  // Derived plan details
  const currentPlan = useMemo(() => {
    if (!state.plans) return null
    const plan = state.plans[state.contractType.replace('plan', 'tier') as keyof Plans]
    const tierText = state.contractType === "plan1" ? "Tier 1" : state.contractType === "plan2" ? "Tier 2" : "Tier 3"
    return {
      tier: tierText,
      tierRange: `${plan.min} - ${plan.max} POL`,
      duration: `${plan.days} Days`,
      maxRewards: "300%",
      bestFor: state.contractType === "plan1" ? "New Stakers" : state.contractType === "plan2" ? "Intermediate" : "Advanced",
      minAmount: plan.min,
      maxAmount: plan.max
    }
  }, [state.plans, state.contractType])

  // Initialize state with default values
  useEffect(() => {
    if (!state.mounted) {
      setState(prev => ({
        ...prev,
        minStake: Number(process.env.NEXT_PUBLIC_TIER1_MIN || "1"),
        maxStake: Number(process.env.NEXT_PUBLIC_TIER3_MAX || "10000"),
        plans: {
          tier1: { 
            min: Number(process.env.NEXT_PUBLIC_TIER1_MIN || "1"), 
            max: Number(process.env.NEXT_PUBLIC_TIER1_MAX || "999"), 
            rate: Number(process.env.NEXT_PUBLIC_TIER1_RATE || "150"), 
            days: Number(process.env.NEXT_PUBLIC_TIER1_DAYS || "200") 
          },
          tier2: { 
            min: Number(process.env.NEXT_PUBLIC_TIER2_MIN || "1000"), 
            max: Number(process.env.NEXT_PUBLIC_TIER2_MAX || "2999"), 
            rate: Number(process.env.NEXT_PUBLIC_TIER2_RATE || "200"), 
            days: Number(process.env.NEXT_PUBLIC_TIER2_DAYS || "150") 
          },
          tier3: { 
            min: Number(process.env.NEXT_PUBLIC_TIER3_MIN || "3000"), 
            max: Number(process.env.NEXT_PUBLIC_TIER3_MAX || "10000"), 
            rate: Number(process.env.NEXT_PUBLIC_TIER3_RATE || "300"), 
            days: Number(process.env.NEXT_PUBLIC_TIER3_DAYS || "100") 
          }
        }
      }))
    }
  }, [state.mounted])

  // Helper functions
  const formatNumber = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || isNaN(Number(num))) return '0'
    return Math.floor(Number(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "")
    if (!/^\d*\.?\d*$/.test(raw)) return
    setState(prev => ({ ...prev, amount: raw }))
  }

  const handleMaxClick = () => {
    setState(prev => ({ ...prev, amount: Math.floor(userBalance).toString() }))
  }

  const handleStakeNow = async () => {
    if (state.isStaking) return

    if (!isConnected || !address) {
      toast.error("Please connect your wallet.")
      openWalletModal()
      return
    }

    if (state.referrerAddress === null) {
      toast.error("Referrer address is initializing. Please wait.")
      return
    }

    if (!isAddress(state.referrerAddress)) {
        toast.error("Invalid referrer address detected.")
        return
    }

    if (Number(state.amount) <= 0) {
      toast.error("Please enter a valid amount.")
      return
    }

    if (Number(state.amount) > userBalance) {
      toast.error("Insufficient balance.")
      return
    }

    if (!walletClient || !publicClient) {
      toast.error("Wallet connection not fully ready. Please wait or reconnect.")
      return
    }

    if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
        toast.error("Contract address configuration error.")
        return
    }

    setState(prev => ({ ...prev, isStaking: true }))
    const loadingToast = toast.loading("Preparing transaction...")

    try {
      const amountInWei = parseEther(state.amount)

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PK_RYO_ABI,
        functionName: 'stake',
        args: [state.referrerAddress as `0x${string}`],
        value: amountInWei,
        account: address as `0x${string}`,
      })

      toast.dismiss(loadingToast)
      const confirmationToast = toast.loading("Waiting for wallet confirmation...")

      const hash = await walletClient.writeContract(request)

      toast.dismiss(confirmationToast)
      const processingToast = toast.loading("Processing transaction...")

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      toast.dismiss(processingToast)
      if (receipt.status === 'success') {
          toast.success("Stake successful!")
          setState(prev => ({ ...prev, amount: "0" })) // Reset amount on success
      } else {
          toast.error("Transaction failed. Please check transaction status.")
      }
      
      // Trigger reload after transaction confirmation (success or failure)
      triggerReload();

    } catch (error: any) {
      toast.dismiss()
      let errorMessage = "Staking failed. Please try again.";
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
      setState(prev => ({ ...prev, isStaking: false }))
    }
  }

  const toggleCard = (index: number) => {
    if (!state.mounted) return
    setState(prev => {
      const newExpandedCards = [...prev.expandedCards]
      newExpandedCards[index] = !newExpandedCards[index]
      return { ...prev, expandedCards: newExpandedCards }
    })
  }

  const minStakeDisplay = state.minStake !== null ? state.minStake : null
  const maxStakeDisplay = state.maxStake !== null ? state.maxStake : null

  const amountNumber = Number(state.amount);
  const isAmountValid =
    state.amount !== "" &&
    !isNaN(amountNumber) &&
    state.minStake !== null &&
    state.maxStake !== null &&
    amountNumber >= state.minStake &&
    amountNumber <= state.maxStake;

  // Simple reload trigger function
  const triggerReload = () => {
    if (!state.mounted) return
    setState(prev => ({ ...prev, shouldReload: true }))
  }

  if (!state.mounted) {
    return null;
  }

  return (
    <section
      id="staking-section"
      className="relative py-12 sm:py-16 bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424] text-white px-4 sm:px-6 md:px-8"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-[10%] right-[5%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/10 blur-[60px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 relative inline-block">
            <span className="text-gradient-gold">Stake POL</span>
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Stake your POL and earn up to 300% total return over the staking period.
          </p>
        </div>

        {/* Wallet-dependent UI */}
        {state.mounted ? (
          <>
            {/* Main Staking Card */}
            <div
              className={`rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 ${
                state.isInputFocused
                  ? "bg-black/80 border border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                  : "bg-black/40 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]"
              }`}
            >
              {/* Current Tier Indicator */}
              <div className="mb-4 flex items-center justify-center">
                <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-full px-4 py-1.5 border border-[#a58af8]/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#a58af8]" />
                    <p className="text-white font-medium text-sm">{currentPlan?.tier}</p>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Tier Range */}
                <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-[#a58af8]" />
                    <p className="text-white/80 text-xs">Tier Range</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{currentPlan?.tierRange}</p>
                </div>
                 {/* Duration */}
                <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#a58af8]" />
                    <p className="text-white/80 text-xs">Duration</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{currentPlan?.duration}</p>
                </div>
                 {/* Max Rewards */}
                <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                    <p className="text-white/80 text-xs">Max Rewards</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{currentPlan?.maxRewards}</p>
                </div>
                 {/* Best For */}
                <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#a58af8]" />
                    <p className="text-white/80 text-xs">Best For</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{currentPlan?.bestFor}</p>
                </div>
              </div>

              {/* Input Amount + Max Button */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-white/80 mb-2">Enter Stake Amount (POL)</label>
                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={state.amount}
                      onChange={handleInputChange}
                      onFocus={() => setState(prev => ({ ...prev, isInputFocused: true }))}
                      onBlur={() => setState(prev => ({ ...prev, isInputFocused: false }))}
                      className="w-full rounded-xl bg-[#0f0c1a]/70 backdrop-blur-sm border border-[#a58af8]/30 px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all"
                      placeholder={
                        minStakeDisplay && maxStakeDisplay
                          ? `Enter amount (${minStakeDisplay} - ${maxStakeDisplay} POL)`
                          : "Enter amount"
                      }
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">POL</div>
                  </div>
                  <button
                    onClick={handleMaxClick}
                    disabled={isLoading}
                    className="whitespace-nowrap text-sm font-medium bg-[#0f0c1a]/70 backdrop-blur-sm text-[#facc15] border border-[#facc15]/30 hover:border-[#facc15] rounded-xl px-3 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Max
                  </button>
                </div>
                <div className="mt-1.5 space-y-1">
                  {isLoading ? (
                    <div className="space-y-1">
                      <span className="animate-pulse block text-xs text-white/80">Loading balance...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-white/80">POL Balance: {Number(parseFloat(maticBalance).toFixed(2)).toLocaleString()} POL</p>
                    </>
                  )}
                </div>
                {(state.minStake !== null && state.amount !== "" && amountNumber < state.minStake) && (
                  <p className="text-xs text-red-400">Minimum stake is {minStakeDisplay} POL</p>
                )}
                {(state.maxStake !== null && state.amount !== "" && amountNumber > state.maxStake) && (
                  <p className="text-xs text-red-400">Maximum stake is {maxStakeDisplay} POL</p>
                )}
              </div>

              {/* Stake Button */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>
                <button
                  onClick={handleStakeNow}
                  disabled={
                    state.isStaking ||
                    !isAmountValid ||
                    !state.referrerAddress ||
                    !isConnected
                  }
                  className="relative w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0f0824] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15] text-base">
                    {state.isStaking ? "Processing..." : Number(state.amount) <= 0 ? "Enter Amount" : Number(state.amount) > userBalance ? "Insufficient Balance" : !state.referrerAddress ? "Loading..." : !isConnected ? "Connect Wallet" : "Stake Now"}
                  </span>
                  {!state.isStaking && Number(state.amount) > 0 && Number(state.amount) <= userBalance && state.referrerAddress && isConnected && (
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] group-hover:w-[calc(100%-20px)] -translate-x-1/2 transition-all duration-300"></span>
                  )}
                </button>
              </div>

              {/* Referrer Address Box */}
              <div className="mt-5">
                <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-white/80 text-xs sm:text-sm">Referrer Address</p>
                  </div>
                  <p className="text-xs sm:text-base font-semibold text-white break-words">{state.referrerAddress || "No referrer address detected"}</p>
                </div>
              </div>
            </div>
            {/* Staking Contracts Box (separate, imported) */}
            <StakeContracts liveRewards={""} />
          </>
        ) : (
          <div style={{ minHeight: 400 }} />
        )}
      </div>
    </section>
  )
}

export default StakingSection
