"use client"
import { useState, useRef, useEffect } from "react"
import { Copy, Share2, User, CreditCard, TrendingUp, ChevronDown, ChevronUp, Link } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import { useIsMobile } from "@/lib/use-mobile"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { Contract, BaseContract } from "ethers"
import PK_RYO_ABI from "@/app/contracts/PK_RYO.json"
import { getCachedDB } from "./QueryDB";


// Contract address - replace with your actual contract address
const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

interface DownlineInfo {
  user: string;
  volume: bigint;
  activeStakeCount: number;
}

interface StakingContract extends BaseContract {
  activeStakesCount(user: string): Promise<bigint>;
  downlines(user: string, index: number): Promise<string>;
  directDownlineVolume(user: string): Promise<bigint>;
  getStakeAmount(user: string): Promise<bigint>;
  getDownlines(user: string): Promise<string[]>;
  getDownlineBatchInfo(user: string, depth: number): Promise<any[]>;
}

export function AffiliateSection() {
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { isConnected, address, provider } = useWallet();
  const isMobile = useIsMobile();
  const [expandedCards, setExpandedCards] = useState<boolean[]>(Array(10).fill(false));
  const [isContractsExpanded, setIsContractsExpanded] = useState(false);
  const [queryDBResult, setQueryDBResult] = useState<any>(null);
  const [isListExpanded, setIsListExpanded] = useState(false)
  const [downlines, setDownlines] = useState<DownlineInfo[]>([])
  const [isLoading, setLoading] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!address) return;
    let interval: NodeJS.Timeout;
    function checkCache() {
      const cached = getCachedDB(address || "", { filter: "all" });
      if (cached) {
        setQueryDBResult(cached);
        clearInterval(interval);
      }
    }
    interval = setInterval(checkCache, 500);
    return () => clearInterval(interval);
  }, [address]);

  // Check if user has active stakes
  useEffect(() => {
    const checkActiveStakes = async () => {
      if (!provider || !address || !isConnected) {
        return
      }

      try {
        const stakingContract = new Contract(STAKING_CONTRACT_ADDRESS, PK_RYO_ABI, provider) as unknown as StakingContract
        const activeStakes = await stakingContract.activeStakesCount(address)
        // setHasActiveStakes(Number(activeStakes) > 0)
      } catch (error) {
        console.error("Error checking active stakes:", error)
        // setHasActiveStakes(false)
      }
    }

    checkActiveStakes()
  }, [provider, address, isConnected])

  useEffect(() => {
    const fetchDownlines = async () => {
      if (!provider || !address || !isConnected) {
        setLoading(false);
        return;
      }
  
      try {
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          PK_RYO_ABI,
          provider
        ) as unknown as StakingContract;
  
        console.log('📥 Fetching downlines for:', address);
        const result = await stakingContract.getDownlineBatchInfo(address, 10);
        console.log('📊 Downlines fetched:', result);
  
        setDownlines(result);
      } catch (error) {
        console.error("Error fetching downline batch info:", error);
        setDownlines([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDownlines();
  }, [provider, address, isConnected]);
  

  const referralLink = mounted && isConnected && address 
    ? `${window.location.origin}/?ref=${address}`
    : '';

  const handleCopy = async () => {
    if (!mounted || !referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Format number with spaces instead of commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  // Format address to show first 6 and last 4 characters
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleShare = () => {
    if (!referralLink) return;
    const message = `Join me on Polking and earn rewards: ${referralLink}`;

    if (navigator.share) {
      navigator.share({
        title: 'Polking Staking',
        text: message,
        url: referralLink,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      alert('Sharing is not supported on this browser. Please copy the link manually.');
    }
  }

  // Toggle card expansion
  const toggleCard = (index: number) => {
    setExpandedCards((prev) => prev.map((_, i) => i === index ? !prev[i] : false))
  }

  // Scroll to expanded list when opened
  useEffect(() => {
    if (isListExpanded && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 100)
    }
  }, [isListExpanded])

  if (!mounted) return null;

  if (!queryDBResult) {
    return <div>Loading rewards...</div>;
  }

  const { data: { allStakes = [] } = {}, totalUnclaimed = 0, rewardsPerSecond = 0 } = queryDBResult;

  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-br from-[#0a0118] to-[#0e0424] text-white px-4 sm:px-6 md:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes */}
        <div className="absolute top-[30%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-[#a58af8]/10 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[#facc15]/10 blur-[80px]" />

        {/* Animated elements */}
        <motion.div
          animate={{
            x: ["-10%", "10%"],
            y: ["-5%", "5%"],
          }}
          transition={{
            x: { duration: 25, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            y: { duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
          }}
          className="absolute top-[40%] left-[20%] w-[25vw] h-[25vw] rounded-full bg-[#a58af8]/5 blur-[100px]"
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
            <span className="text-gradient-gold">Affiliate Rewards</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Invite your network and earn a royal stream of POL tokens from your affiliates.
          </p>
        </motion.div>

        {/* Referral Link Card with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)] mb-6"
        >
          <p className="text-sm text-white/80 mb-3 font-medium">Your Referral Link</p>

          {!isConnected ? (
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Connect your wallet to get your referral link
              </p>
              <ConnectWalletButton />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a58af8]">
                  <Link size={16} />
                </div>
                <input
                  readOnly
                  value={referralLink}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0f0c1a]/70 text-white border border-[#a58af8]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#a58af8]/50 transition-all"
                />
              </div>

              <div className="flex gap-3 sm:w-auto">
                <button
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-[#0f0c1a]/70 text-[#facc15] border border-[#facc15]/30 rounded-xl hover:bg-[#facc15]/10 hover:border-[#facc15]/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all duration-300 relative group"
                >
                  <Copy size={14} />
                  <span>{isCopied ? "Copied!" : "Copy"}</span>
                  <span className="absolute inset-0 rounded-xl bg-[#facc15]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-[#0f0c1a]/70 text-[#a58af8] border border-[#a58af8]/30 rounded-xl hover:bg-[#a58af8]/10 hover:border-[#a58af8]/50 hover:shadow-[0_0_15px_rgba(165,138,248,0.3)] transition-all duration-300 relative group"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                  <span className="absolute inset-0 rounded-xl bg-[#a58af8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Affiliate List Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]"
        >
          <div
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="flex items-center justify-between p-5 sm:p-6 cursor-pointer group transition-all duration-300 hover:bg-[#a58af8]/5 rounded-t-2xl"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User size={18} className="text-[#a58af8]" />
              Your Affiliate List
            </h3>
            <div className="w-6 h-6 rounded-full bg-[#0f0c1a]/70 border border-[#a58af8]/30 flex items-center justify-center transition-transform duration-300 group-hover:border-[#a58af8]/60">
              {isListExpanded ? (
                <ChevronUp size={14} className="text-[#a58af8]" />
              ) : (
                <ChevronDown size={14} className="text-[#a58af8]" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {isListExpanded && (
              <motion.div
                ref={listRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {isLoading ? (
                    <div className="text-center py-4 text-white/60">Loading downline data...</div>
                  ) : downlines.length === 0 ? (
                    <div className="text-center py-4 text-white/60">No downlines found</div>
                  ) : (
                    downlines.map(({ user, volume, activeStakeCount }, index) => (
                      <div key={index} className="rounded-xl bg-[#0f0c1a]/70 border border-[#a58af8]/30 mb-3 p-4">
                        <p className="text-white/90 font-bold">{user}</p>
                        <p className="text-white/60">Active Stake Count: {activeStakeCount}</p>
                        <p className="text-[#facc15]">Total Volume: {Number(volume) / 1e18} POL</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
