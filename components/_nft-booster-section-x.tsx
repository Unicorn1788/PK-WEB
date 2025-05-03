"use client"

import { useState, useEffect } from "react"
import { Shield, TrendingUp, Award, Zap } from "lucide-react"
import { useWallet } from "./WalletProvider"
import { Contract, BaseContract } from "ethers"

interface WalletContextType {
  contract: Contract | null;
  walletAddress: string | null;
  isConnected: boolean;
}

interface StakingContract extends BaseContract {
  getUserRank(user: string): Promise<number>;
  claimRank(): Promise<{ wait(): Promise<void> }>;
  downlines(user: string, index: number): Promise<string>;
  directDownlineVolume(user: string): Promise<bigint>;
  getStakeAmount(user: string): Promise<bigint>;
  knightThreshold(): Promise<bigint>;
  dukeThreshold(): Promise<bigint>;
  kingThreshold(): Promise<bigint>;
  minQualifying(): Promise<bigint>;
}

interface Downline {
  address: string;
  totalVolume: number;
}

interface TopAffiliate {
  address: string;
  volume: number;
  targetVolume: number;
}

// Rank configurations
const RANKS = {
  0: { name: "Soldier", boost: 0, poolShare: 10 },
  1: { name: "Knight", boost: 5, poolShare: 15 },
  2: { name: "Duke", boost: 10, poolShare: 20 },
  3: { name: "King", boost: 15, poolShare: 25 }
}

const NFTBoosterSection = () => {
  const { contract, walletAddress, isConnected } = useWallet() as WalletContextType
  const [currentRank, setCurrentRank] = useState({
    name: "Soldier",
    level: 0,
    boost: 0,
    poolShare: 10,
    isEligibleForUpgrade: false,
    targetVolumeInMatic: 0.2 // Default to Knight threshold
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [topAffiliates, setTopAffiliates] = useState<{ address: string; volume: number; targetVolume: number }[]>([])

  // Fetch user's rank
  useEffect(() => {
    const fetchUserRank = async () => {
      if (!contract || !walletAddress || !isConnected) {
        setIsLoading(false)
        return
      }

      try {
        const stakingContract = contract as unknown as StakingContract
        const rankLevel = await stakingContract.getUserRank(walletAddress)
        const rankInfo = RANKS[rankLevel as keyof typeof RANKS] || RANKS[0]

        // Fetch threshold based on current rank
        let nextRankThreshold = BigInt(0)
        let targetVolumeInMatic = 0.2 // Default to Knight threshold
        
        if (rankLevel === 0) {
          nextRankThreshold = await stakingContract.knightThreshold() // 0.2 ETH
          targetVolumeInMatic = 0.2
        } else if (rankLevel === 1) {
          nextRankThreshold = await stakingContract.dukeThreshold() // 0.6 ETH
          targetVolumeInMatic = 0.6
        } else if (rankLevel === 2) {
          nextRankThreshold = await stakingContract.kingThreshold() // 1 ETH
          targetVolumeInMatic = 1
        }

        // Fetch top downlines for rank progress
        const processedDownlines: TopAffiliate[] = []
        let i = 0

        try {
          // First try to get the first downline to see if we have any
          const firstDownline = await stakingContract.downlines(walletAddress, 0).catch(() => null)
          
          if (!firstDownline || firstDownline === '0x0000000000000000000000000000000000000000') {
            console.log('No downlines found for address:', walletAddress)
            setTopAffiliates([])
            setCurrentRank(prev => ({
              ...prev,
              isEligibleForUpgrade: false
            }))
            setIsLoading(false)
            return
          }

          // If we have at least one downline, process it with delay between requests
          while (i < 3) { // Limit to 3 attempts since we only show top 3
            try {
              // Add delay between requests to prevent rate limiting
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              }

              const address = await stakingContract.downlines(walletAddress, i).catch(() => null)
              
              // Check for null/empty address
              if (!address || address === '0x0000000000000000000000000000000000000000') {
                console.log('Reached end of downlines at index:', i)
                break
              }

              // Get volume data with retries
              let volume = BigInt(0)
              let stakeAmount = BigInt(0)
              
              try {
                volume = await stakingContract.directDownlineVolume(address).catch(() => BigInt(0))
                await new Promise(resolve => setTimeout(resolve, 500)) // Add delay between calls
                stakeAmount = await stakingContract.getStakeAmount(address).catch(() => BigInt(0))
              } catch (volumeError) {
                console.error(`Error fetching volume for address ${address}:`, volumeError)
                continue // Skip this downline if we can't get volume data
              }
              
              const totalVolume = volume + stakeAmount
              const volumeInMatic = Number(totalVolume) / Math.pow(10, 18)

              if (volumeInMatic > 0) { // Only add if they have volume
                processedDownlines.push({
                  address,
                  volume: volumeInMatic,
                  targetVolume: targetVolumeInMatic
                })
              }

              i++
            } catch (error) {
              console.log(`Stopped processing at downline index ${i} due to error:`, error)
              break
            }
          }

          // Sort and update state with whatever downlines we successfully processed
          const sortedAffiliates = processedDownlines
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 3)

          setTopAffiliates(sortedAffiliates.map(affiliate => ({
            ...affiliate,
            targetVolume: targetVolumeInMatic
          })))
          
          // Check if eligible for upgrade based on what we found
          const qualifiedDownlines = processedDownlines.filter(
            d => d.volume >= targetVolumeInMatic
          )
          const isEligible = qualifiedDownlines.length >= 2
          
          setCurrentRank(prev => ({
            ...prev,
            name: rankInfo.name,
            level: rankLevel,
            boost: rankInfo.boost,
            poolShare: rankInfo.poolShare,
            isEligibleForUpgrade: isEligible,
            targetVolumeInMatic
          }))

        } catch (error) {
          console.error("Error processing downlines:", error)
          // Don't clear top affiliates on error, keep existing data
          setCurrentRank(prev => ({
            ...prev,
            isEligibleForUpgrade: false
          }))
        }

      } catch (error) {
        console.error("Error fetching rank:", error)
        setTopAffiliates([])
        setCurrentRank({
          name: "Soldier",
          level: 0,
          boost: 0,
          poolShare: 10,
          isEligibleForUpgrade: false,
          targetVolumeInMatic: 0.2 // Default to Knight threshold
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRank()
  }, [contract, walletAddress, isConnected])

  // Calculate progress percentage for affiliates (keep this for UI)
  const getAffiliateProgress = (volume: number, target: number) => {
    return Math.min(100, (volume / target) * 100)
  }

  // Handle upgrade rank
  const handleUpgradeRank = async () => {
    if (!contract || !walletAddress || !isConnected || !currentRank.isEligibleForUpgrade || isClaiming) return

    setIsClaiming(true)
    try {
      const stakingContract = contract as unknown as StakingContract
      const tx = await stakingContract.claimRank()
      await tx.wait()
      
      // Refresh rank after successful claim
      const newRankLevel = await stakingContract.getUserRank(walletAddress)
      const newRankInfo = RANKS[newRankLevel as keyof typeof RANKS] || RANKS[0]
      
      setCurrentRank(prev => ({
        ...prev,
        name: newRankInfo.name,
        level: newRankLevel,
        boost: newRankInfo.boost,
        poolShare: newRankInfo.poolShare,
        isEligibleForUpgrade: false,
        targetVolumeInMatic: 0.2 // Default to Knight threshold
      }))
    } catch (error) {
      console.error("Error claiming rank:", error)
    } finally {
      setIsClaiming(false)
    }
  }

  if (isLoading) {
    return (
      <section className="relative py-24 bg-gradient-to-br from-[#0b0514] via-[#11071c] to-black text-white px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          Loading...
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-[#0b0514] via-[#11071c] to-black text-white px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gradient-gold">Polking NFT</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Boost your staking rewards with NFT ranks. Upgrade your rank to increase your MaxCap and earn a share of the
            global pool.
          </p>
        </div>

        {/* Current Rank Section */}
        <div className="rounded-2xl p-8 bg-black/40 border border-[#a58af8] shadow-[0_0_80px_rgba(165,138,248,0.6)] backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Rank Badge */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1224] to-[#0f0c1a] border-2 border-[#a58af8] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(165,138,248,0.4)]">
                <Shield className="w-12 h-12 text-[#a58af8]" />
              </div>
              <h3 className="text-xl font-bold text-white">{currentRank.name}</h3>
            </div>

            {/* Rank Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#a58af8]" />
                  Progress to Next Rank
                  {currentRank.level < 3 && (
                    <span className="text-sm font-normal text-white/60">
                      (Need 2 downlines with {currentRank.targetVolumeInMatic} MATIC each)
                    </span>
                  )}
                </h3>

                {/* Top Affiliates Progress Bars */}
                <div className="space-y-6">
                  {topAffiliates.map((affiliate, index) => (
                    <div key={index} className="mb-4">
                      <p className="text-white/80 text-sm font-medium mb-2">
                        Address: {`${affiliate.address.slice(0, 6)}...${affiliate.address.slice(-4)}`}
                      </p>
                      <div className="w-full bg-black/60 rounded-full h-4 mb-2 border border-[#a58af8]/20">
                        <div
                          className="bg-gradient-to-r from-[#a58af8] to-[#d4bf6b] h-full rounded-full transition-all duration-1000 ease-in-out"
                          style={{ width: `${getAffiliateProgress(affiliate.volume, currentRank.targetVolumeInMatic)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-white/60">
                        <span>{affiliate.volume.toFixed(2)} MATIC</span>
                        <span>{currentRank.targetVolumeInMatic} MATIC needed</span>
                      </div>
                    </div>
                  ))}

                  {topAffiliates.length === 0 && (
                    <div className="text-center text-white/60 py-4">
                      No downlines yet. You need 2 downlines with {currentRank.targetVolumeInMatic} MATIC each to upgrade.
                    </div>
                  )}
                </div>
              </div>

              {/* Current Boost and Global Pool Share */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f0c1a] rounded-xl p-3 border border-[#a58af8]/20 text-center h-14 sm:h-auto">
                  <p className="text-white/60 text-xs mb-0.5">Current Boost</p>
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 sm:w-5 sm:h-5 text-[#a58af8]" />
                    <p className="text-sm sm:text-xl font-bold text-white">+{currentRank.boost}%</p>
                  </div>
                </div>
                <div className="bg-[#0f0c1a] rounded-xl p-3 border border-[#a58af8]/20 text-center h-14 sm:h-auto">
                  <p className="text-white/60 text-xs mb-0.5">Global Pool Share</p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-[#a58af8]" />
                    <p className="text-sm sm:text-xl font-bold text-white">{currentRank.poolShare}%</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpgradeRank}
                disabled={!currentRank.isEligibleForUpgrade || isClaiming}
                className="w-full bg-gradient-to-r from-[#a58af8] via-[#5a1f95] to-[#d4bf6b] hover:brightness-110 text-white font-bold text-lg py-3 px-6 rounded-xl shadow-[0_0_20px_2px_#facc15] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? "Claiming..." : currentRank.isEligibleForUpgrade ? "Upgrade Rank" : "Not Eligible for Upgrade Yet"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-gradient-gold {
          background: linear-gradient(to right, #facc15, #eab308, #a58af8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  )
}

export default NFTBoosterSection
