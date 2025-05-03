"use client"
import { useState, useEffect } from "react"
import { Copy, Share2, User, CreditCard, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { Contract, BaseContract } from "ethers"

interface WalletContextType {
  contract: Contract | null;
  walletAddress: string | null;
  isConnected: boolean;
}

interface DownlineInfo {
  address: string;
  activeStake: number;
  totalVolume: number;
}

type DownlineBatchInfo = {
  user: string;
  volume: bigint;
  activeStakeCount: bigint;
}

interface StakingContract extends BaseContract {
  activeStakesCount(user: string): Promise<bigint>;
  downlines(user: string, index: number): Promise<string>;
  directDownlineVolume(user: string): Promise<bigint>;
  getStakeAmount(user: string): Promise<bigint>;
}

const AffiliateSection = () => {
  const { contract, walletAddress, isConnected } = useWallet() as WalletContextType
  const [downlines, setDownlines] = useState<DownlineInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [hasActiveStakes, setHasActiveStakes] = useState(false)
  
  // Format functions
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
  const getReferralLink = (address: string) => `${window.location.origin}?ref=${address}`
  
  // Check if user has active stakes
  useEffect(() => {
    const checkActiveStakes = async () => {
      if (!contract || !walletAddress || !isConnected) {
        setHasActiveStakes(false)
        return
      }

      try {
        const stakingContract = contract as unknown as StakingContract
        const activeStakes = await stakingContract.activeStakesCount(walletAddress)
        setHasActiveStakes(Number(activeStakes) > 0)
      } catch (error) {
        console.error("Error checking active stakes:", error)
        setHasActiveStakes(false)
      }
    }

    checkActiveStakes()
  }, [contract, walletAddress, isConnected])

  useEffect(() => {
    const fetchDownlines = async () => {
      if (!contract || !walletAddress || !isConnected) {
        setLoading(false)
        return
      }

      try {
        const stakingContract = contract as unknown as StakingContract
        const processedDownlines: DownlineInfo[] = []

        // Try fetching downlines one by one until we hit an invalid one
        let i = 0
        while (i < 5) { // Limit to 5 attempts max
          try {
            const address = await stakingContract.downlines(walletAddress, i)
            
            // If we get a zero address, we've reached the end of the list
            if (!address || address === '0x0000000000000000000000000000000000000000') {
              break // Exit the loop as we've reached the end
            }

            // Get both direct volume and stake amount
            const volume = await stakingContract.directDownlineVolume(address)
            const stakeAmount = await stakingContract.getStakeAmount(address)
            const activeStakes = await stakingContract.activeStakesCount(address)
            
            // Total volume should include both direct volume and stake amount
            const totalVolume = volume + stakeAmount
            
            processedDownlines.push({
              address,
              activeStake: Number(activeStakes),
              totalVolume: Number(totalVolume) / Math.pow(10, 18)
            })

            i++ // Only increment if successful
          } catch (error) {
            // If we get a revert error, we've likely reached the end of valid indices
            if (error && (error as any).code === 'CALL_EXCEPTION') {
              break // Exit the loop as we've reached the end
            }
            console.error(`Error processing downline at index ${i}:`, error)
            break
          }
        }

        // Sort and set downlines
        setDownlines(processedDownlines.sort((a, b) => b.totalVolume - a.totalVolume))
      } catch (error) {
        console.error("Error in fetchDownlines:", error)
        setDownlines([])
      } finally {
        setLoading(false)
      }
    }

    fetchDownlines()
  }, [contract, walletAddress, isConnected])

  const handleCopy = () => {
    if (walletAddress) {
      const fullLink = getReferralLink(walletAddress)
      navigator.clipboard.writeText(fullLink)
    }
  }

  const handleShare = () => {
    if (!walletAddress) return
    const fullLink = getReferralLink(walletAddress)
    const message = `Join me on Polking and earn rewards: ${fullLink}`
    const encoded = encodeURIComponent(message)
    window.open(`https://t.me/share/url?url=${encoded}`, "_blank")
  }

  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({})
  const [isListExpanded, setIsListExpanded] = useState(false)

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-br from-[#0b0514] via-[#11071c] to-black text-white px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gradient-gold">
          Polking Affiliate Rewards
        </h2>
        <p className="text-white/70 mb-6 sm:mb-10 max-w-2xl mx-auto text-sm sm:text-base">
          Invite your network and earn a royal stream of POL tokens from your affiliates.
        </p>

        <div className="rounded-2xl p-3 sm:p-8 mb-6 sm:mb-12 backdrop-blur-xl bg-black/40 border border-[#a58af8] shadow-[0_0_80px_rgba(165,138,248,0.6)]">
          {!isConnected ? (
            <p className="text-white/70">Please connect your wallet to view your referral link.</p>
          ) : !hasActiveStakes ? (
            <p className="text-white/70">You need to have active stakes to get your referral link.</p>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-white/60 mb-1.5 sm:mb-2 text-left font-medium">Your Referral Link</p>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                <input
                  readOnly
                  value={walletAddress ? `${window.location.host}?ref=${formatAddress(walletAddress)}` : ""}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-black/30 text-white border border-[#a58af8]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#a58af8] transition-all duration-300"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopy}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-royal-gold/10 text-royal-gold border border-royal-gold/50 rounded-md hover:bg-royal-gold/20 transition-all duration-300"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" /> Copy
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-[#a58af8]/10 text-[#a58af8] border border-[#a58af8]/40 rounded-md hover:bg-[#a58af8]/20 transition-all duration-300"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" /> Share
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Affiliate List Box */}
        <div className="rounded-2xl p-3 sm:p-8 backdrop-blur-xl bg-black/40 border border-[#a58af8] shadow-[0_0_80px_rgba(165,138,248,0.6)]">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setIsListExpanded(!isListExpanded)}
          >
            <h3 className="text-xl font-semibold text-white">Your Affiliate List</h3>
            {isListExpanded ? <ChevronUp className="text-[#a58af8]" /> : <ChevronDown className="text-[#a58af8]" />}
          </div>

          {isListExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 text-xs sm:text-sm">
              {loading ? (
                <div className="col-span-full text-center py-4">Loading downline data...</div>
              ) : downlines.length === 0 ? (
                <div className="col-span-full text-center py-4">No downlines found</div>
              ) : (
                downlines.map((downline, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3 sm:p-6 bg-black/40 border border-[#a58af8] shadow-[0_0_20px_rgba(165,138,248,0.5)] backdrop-blur-xl hover:shadow-[0_0_30px_rgba(165,138,248,0.6)] transition-all duration-300 neon-border-purple"
                  >
                    <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={() => toggleCard(index)}>
                      <div className="flex items-center gap-2">
                        <User className="text-[#a58af8] w-5 h-5 sm:w-6 sm:h-6" />
                        <p className="text-white/90 text-base sm:text-lg font-semibold truncate">
                          {formatAddress(downline.address)}
                        </p>
                      </div>
                      {expandedCards[index] ? (
                        <ChevronUp className="text-[#a58af8] w-4 h-4" />
                      ) : (
                        <ChevronDown className="text-[#a58af8] w-4 h-4" />
                      )}
                    </div>

                    {expandedCards[index] && (
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CreditCard className="text-[#a58af8] w-3 h-3 sm:w-4 sm:h-4" />
                            <p className="text-white/70 text-xs">Active Stakes</p>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-white">{downline.activeStake}</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="text-[#a58af8] w-3 h-3 sm:w-4 sm:h-4" />
                            <p className="text-white/70 text-xs">Total Volume</p>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-royal-gold">
                            {downline.totalVolume.toFixed(2)} MATIC
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .text-gradient-gold {
          background: linear-gradient(to right, #facc15, #eab308, #a58af8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .neon-border-purple {
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 15px 3px rgba(165, 138, 248, 0.7), inset 0 0 15px rgba(165, 138, 248, 0.5);
        }
        
        .text-royal-gold {
          color: #FFD700;
        }
      `}</style>
    </section>
  )
}

export default AffiliateSection
