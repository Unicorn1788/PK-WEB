"use client";

import { useState, useEffect } from "react";
import { Shield, TrendingUp, Award, Zap, User, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/wallet-context";
import { Contract, BaseContract } from "ethers";
import { STAKING_CONTRACT_ADDRESS } from "@/lib/constants";
import PK_RYO_ABI from "@/app/contracts/PK_RYO.json";

// Interfaces
interface DownlineInfo {
  user: string;
  volume: bigint;
  activeStakeCount: bigint;
}

interface StakingContract extends BaseContract {
  getDownlineBatchInfo(user: string, depth: number): Promise<DownlineInfo[]>;
  getUserRank(user: string): Promise<string>;
  claimRank(): Promise<Contract>;
}

// Static Rank Metadata
const RANKS = [
  { name: "Recruit", level: 0, boost: 0, poolShare: 0, isEligibleForUpgrade: false, targetVolumeInMatic: 0, nextRank: "Soldier" },
  { name: "Soldier", level: 1, boost: 5, poolShare: 1, isEligibleForUpgrade: false, targetVolumeInMatic: 5000, nextRank: "Knight" },
  { name: "Knight", level: 2, boost: 10, poolShare: 2, isEligibleForUpgrade: false, targetVolumeInMatic: 15000, nextRank: "Duke" },
  { name: "Duke", level: 3, boost: 15, poolShare: 3, isEligibleForUpgrade: false, targetVolumeInMatic: 30000, nextRank: "King" },
  { name: "King", level: 4, boost: 20, poolShare: 5, isEligibleForUpgrade: false, targetVolumeInMatic: 100000, nextRank: null }, // No next rank for the highest level
];

// Thresholds used for next-rank determination
const RANK_THRESHOLDS = [
  { name: "Soldier", value: 5000 },
  { name: "Knight", value: 15000 },
  { name: "Duke", value: 30000 },
  { name: "King", value: 100000 },
];

// Helper
const getNextThreshold = (rankName: string): number | null => {
  const index = RANK_THRESHOLDS.findIndex(r => r.name === rankName);
  return index >= 0 && index < RANK_THRESHOLDS.length - 1
    ? RANK_THRESHOLDS[index + 1].value
    : null;
};

function NFTBoosterSection() {
  const { isConnected, address, provider } = useWallet();

  const [walletReady, setWalletReady] = useState(false);
  const [contract, setContract] = useState<StakingContract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [userRank, setUserRank] = useState<string>("Unknown");
  const [downlines, setDownlines] = useState<DownlineInfo[]>([]);
  const [currentRank, setCurrentRank] = useState(RANKS[0]);

  const [isClaiming, setIsClaiming] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredAddress, setHoveredAddress] = useState<number | null>(null);

  const nextRankName = currentRank.nextRank;

  // Wallet ready checker
  useEffect(() => {
    if (isConnected && address && provider) {
      setWalletReady(true);
    }
  }, [isConnected, address, provider]);

  // Setup contract when wallet is ready
  useEffect(() => {
    if (walletReady) {
      const instance = new Contract(
        STAKING_CONTRACT_ADDRESS,
        PK_RYO_ABI,
        provider
      ) as unknown as StakingContract;

      setContract(instance);
      setWalletAddress(address || null);
    }
  }, [walletReady]);

  // Fetch data (downlines + rank)
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!contract || !walletAddress) return;

      try {
        const [downlineInfo, rankLevel] = await Promise.all([
          contract.getDownlineBatchInfo(walletAddress, 10),
          contract.getUserRank(walletAddress),
        ]);

        const sorted = downlineInfo.sort((a, b) => (b.volume > a.volume ? 1 : -1));
        const top2 = sorted.slice(0, 2);
        const totalTopVolume = top2.reduce((sum, d) => sum + Number(d.volume), 0);

        const rankData = RANKS[Number(rankLevel)] || RANKS[0];
        const nextThreshold = getNextThreshold(rankData.name) || 0;
        const eligible = totalTopVolume >= nextThreshold;

        if (isMounted) {
          setDownlines(top2);
          setUserRank(rankData.name);
          setCurrentRank({
            ...rankData,
            isEligibleForUpgrade: eligible,
            targetVolumeInMatic: nextThreshold,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [contract, walletAddress]);

  // Progress calculator
  const getAffiliateProgress = (volume: number, target: number) => {
    return Math.min(100, (volume / target) * 100);
  };

  // Upgrade handler
  const handleUpgradeRank = async () => {
    if (!contract || !walletAddress || !isConnected || !currentRank.isEligibleForUpgrade || isClaiming) return;

    setIsClaiming(true);
    try {
      const stakingContract = contract as unknown as StakingContract;
      const tx = await stakingContract.claimRank();
      await tx.wait();

      const newRankLevel = await stakingContract.getUserRank(walletAddress);
      const newRankInfo = RANKS[Number(newRankLevel)] || RANKS[0];

      setCurrentRank(prev => ({
        ...prev,
        name: newRankInfo.name,
        level: newRankInfo.level,
        boost: newRankInfo.boost,
        poolShare: newRankInfo.poolShare,
        isEligibleForUpgrade: false,
        targetVolumeInMatic: newRankInfo.targetVolumeInMatic,
      }));

      setUserRank(newRankInfo.name);
    } catch (error) {
      console.error("Error claiming rank:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  // Tooltip toggle
  const toggleTooltip = () => setShowTooltip(prev => !prev);

  // Format number helper
  const formatNumber = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  // Hover management
  const handleHoverStart = (index: number) => setHoveredAddress(index);
  const handleHoverEnd = () => setHoveredAddress(null);

  // JSX to be placed after this
  return (
    <section className='relative py-8 sm:py-12 bg-gradient-to-br from-[#0a0118] to-[#120630] text-white px-4 sm:px-6 md:px-8'>
      {/* Background elements */}
      <div className='absolute inset-0 z-0'>
        {/* Grid lines */}
        <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]' />

        {/* Blurred shapes */}
        <div className='absolute top-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#a58af8]/10 blur-[120px]' />
        <div className='absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[#facc15]/10 blur-[80px]' />

        {/* Animated elements */}
        <motion.div
          animate={{
            x: ["5%", "-5%"],
            y: ["3%", "-3%"],
          }}
          transition={{
            x: { duration: 22, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            y: { duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
          }}
          className='absolute top-[30%] left-[30%] w-[25vw] h-[25vw] rounded-full bg-[#a58af8]/5 blur-[100px]'
        />
      </div>

      <div className='max-w-4xl mx-auto relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-3 sm:mb-5 text-center'>
          <h2 className='text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 relative inline-block'>
            <span className='text-gradient-gold'>NFT Rank Progress</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className='absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full'
            />
          </h2>
          <p className='text-white/70 max-w-2xl mx-auto text-sm'>
            Boost your staking rewards with NFT ranks. Upgrade your rank to increase your MaxCap and earn a share of the global pool.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className='rounded-2xl backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)] overflow-hidden'>
          {/* Current Rank Badge - More compact with reduced padding */}
          <div className='flex flex-col items-center justify-center py-3 sm:py-4 border-b border-[#a58af8]/20'>
            <motion.div
              animate={{
                boxShadow: ["0 0 10px rgba(165,138,248,0.4)", "0 0 20px rgba(165,138,248,0.6)", "0 0 10px rgba(165,138,248,0.4)"],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#1a1224] to-[#0f0c1a] border-2 border-[#a58af8] flex items-center justify-center mb-2 sm:mb-3'>
              <Shield className='w-6 h-6 sm:w-7 sm:h-7 text-[#a58af8]' />
            </motion.div>
            <h3 className='text-xl sm:text-2xl font-bold text-white'>{userRank}</h3>
            <div className='mt-0.5 px-2 py-0.5 bg-[#0f0c1a]/70 rounded-full border border-[#a58af8]/30 text-xs text-white/70'>
              Level {currentRank.level}
            </div>
          </div>

          <div className='p-3 sm:p-5'>
            {/* Progress to Next Rank Section - More compact */}
            {nextRankName && (
              <div className='mb-3'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-1.5'>
                    <Award className='w-4 h-4 text-[#a58af8]' />
                    <h4 className='text-sm font-semibold text-white/90'>Progress to {nextRankName}</h4>
                  </div>

                  <div className='relative'>
                    <button
                      onClick={toggleTooltip}
                      className='w-5 h-5 rounded-full bg-[#0f0c1a]/70 border border-[#a58af8]/30 flex items-center justify-center hover:border-[#a58af8]/60 transition-colors'>
                      <Info
                        size={10}
                        className='text-[#a58af8]'
                      />
                    </button>

                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className='absolute right-0 top-full mt-2 w-64 p-2.5 rounded-xl bg-[#0f0c1a] border border-[#a58af8]/30 shadow-lg z-10 text-xs text-white/80'>
                          To upgrade to {nextRankName} rank, you need two downlines with a total of{" "}
                          {formatNumber(getNextThreshold(userRank) || 0)} POL volume. Higher ranks unlock increased rewards and pool shares.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Volume requirement info - More compact */}
                <div className='bg-[#0f0c1a]/50 rounded-xl p-2 border border-[#a58af8]/20 mb-3'>
                  <p className='text-xs text-white/80 text-center'>
                    You need <span className='text-[#facc15] font-medium'>{formatNumber(Number(currentRank.targetVolumeInMatic) || 0)} POL</span> in 2 lines total
                    volume to reach {nextRankName} rank
                  </p>
                </div>

                {/* Affiliate Progress Bars - Tighter stacking */}
                <div className='space-y-2.5'>
                  {downlines.map((downline, index) => {
                    const progressPercent = getAffiliateProgress(Number(downline.volume), currentRank.targetVolumeInMatic);

                    return (
                      <div
                        key={index}
                        className='bg-[#0f0c1a]/50 rounded-xl p-2.5 border border-[#a58af8]/20 hover:border-[#a58af8]/40 transition-all duration-300'
                        onMouseEnter={() => setHoveredAddress(index)}
                        onMouseLeave={() => setHoveredAddress(null)}>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5'>
                          <div className='flex items-center gap-1.5'>
                            <div className='w-5 h-5 rounded-full bg-[#0f0c1a] border border-[#a58af8]/40 flex items-center justify-center flex-shrink-0'>
                              <User
                                size={10}
                                className='text-[#a58af8]'
                              />
                            </div>
                            <p className='text-xs font-medium text-white/90 truncate'>{downline.user}</p>
                          </div>
                          <p className='text-[10px] font-medium text-[#facc15]'>{progressPercent.toFixed(0)}% Complete</p>
                        </div>

                        <div className='relative h-1.5 bg-[#0f0c1a]/70 rounded-full overflow-hidden border border-[#a58af8]/20'>
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className='absolute top-0 left-0 h-full bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-full'>
                            <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.1)_100%)] animate-shimmer-effect'></div>
                          </motion.div>

                          {/* Hover tooltip */}
                          <AnimatePresence>
                            {hoveredAddress === index && (
                              <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: -25 }}
                                exit={{ opacity: 0, y: -20 }}
                                className='absolute left-1/2 -translate-x-1/2 -top-1 px-2 py-0.5 rounded-md bg-[#0f0c1a] border border-[#a58af8]/30 text-[10px] text-white whitespace-nowrap'>
                                {formatNumber(Number(downline.volume))} / {formatNumber(Number(currentRank.targetVolumeInMatic))} POL
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className='flex justify-between mt-1 text-[10px] text-white/50'>
                          <span>Current: {formatNumber(Number(downline.volume))} POL</span>
                          <span>Target: {formatNumber(Number(currentRank.targetVolumeInMatic))} POL</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Boost and Global Pool Share - More compact with smaller height */}
            <div className='grid grid-cols-2 gap-2 mb-3'>
              <div className='bg-[#0f0c1a]/70 backdrop-blur-md rounded-xl p-2.5 border border-[#a58af8]/20 text-center transition-all duration-300 hover:border-[#a58af8]/50 hover:shadow-[0_0_20px_rgba(165,138,248,0.3)]'>
                <p className='text-white/60 text-xs mb-1'>Current Boost</p>
                <div className='flex items-center justify-center gap-1.5'>
                  <Zap className='w-3.5 h-3.5 text-[#a58af8]' />
                  <p className='text-base font-bold text-white'>+{currentRank.boost}%</p>
                </div>
              </div>

              <div className='bg-[#0f0c1a]/70 backdrop-blur-md rounded-xl p-2.5 border border-[#a58af8]/20 text-center transition-all duration-300 hover:border-[#a58af8]/50 hover:shadow-[0_0_20px_rgba(165,138,248,0.3)]'>
                <p className='text-white/60 text-xs mb-1'>Global Pool Share</p>
                <div className='flex items-center justify-center gap-1.5'>
                  <TrendingUp className='w-3.5 h-3.5 text-[#a58af8]' />
                  <p className='text-base font-bold text-white'>{currentRank.poolShare}%</p>
                </div>
              </div>
            </div>

            {/* Upgrade Button - Smaller height */}
            <div className='relative group'>
              <motion.div
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className='absolute -inset-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-xl blur opacity-30'></motion.div>

              <button
                onClick={handleUpgradeRank}
                className='relative w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 bg-[#0f0824] text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15] hover:shadow-[0_0_20px_rgba(165,138,248,0.4)]'>
                {nextRankName ? `Upgrade to ${nextRankName}` : "Maximum Rank Achieved"}

                {/* Animated border line */}
                <span className='absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] group-hover:w-[calc(100%-20px)] -translate-x-1/2 transition-all duration-300'></span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default NFTBoosterSection;

