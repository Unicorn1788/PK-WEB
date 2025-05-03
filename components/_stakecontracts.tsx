"use client"

import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, User, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/wallet-context";
import { StakeData, getCachedDB } from "./QueryDB";

const StakeContracts: React.FC = () => {
  const { address, isConnected } = useWallet();
  const [expandedCards, setExpandedCards] = useState<boolean[]>(Array(10).fill(false));
  const [isContractsExpanded, setIsContractsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get data from shared cache
  const queryDBResult = getCachedDB(address || "", { filter: "all" }) || { data: { allStakes: [] }, loading: true, totalUnclaimed: 0, rewardsPerSecond: 0 };
  const { data: { allStakes = [] } = {}, loading = false, totalUnclaimed = 0, rewardsPerSecond = 0 } = queryDBResult;

  // Filter active stakes
  const activeStakes = allStakes.filter(stake => stake.active);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);
  }, []);

  // Filter stakes based on mounted and connection state
  const filteredStakes = mounted && isConnected && address ? activeStakes : [];

  // Format number with spaces instead of commas, 4 decimals
  const formatNumber = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || isNaN(Number(num))) return '0.0000';
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  // Format number for rewards per second, 10 decimals
  const formatRewardsPerSecond = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || isNaN(Number(num))) return '0.0000000000';
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 10, maximumFractionDigits: 10 });
  };

  const toggleCard = (index: number) => {
    if (!mounted) return;
    setExpandedCards((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  // Calculate total staked amount for active stakes only
  const totalStakeAmount = filteredStakes.reduce((sum: number, stake: StakeData) => sum + stake.amount, 0);

  return (
    <div className="mt-8">
      <div
        onClick={() => setIsContractsExpanded(!isContractsExpanded)}
        className="flex items-center justify-between p-3 bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl border border-[#a58af8]/20 cursor-pointer"
      >
        <p className="text-white/80 text-sm font-medium">Active Staking Contracts</p>
        <div className="w-5 h-5 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center">
          {isContractsExpanded ? (
            <ChevronUp size={14} className="text-[#a58af8]" />
          ) : (
            <ChevronDown size={14} className="text-[#a58af8]" />
          )}
        </div>
      </div>
      <AnimatePresence>
        {isContractsExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Show summary at the top */}
            <div className="bg-[#18102a]/80 rounded-xl p-4 border border-[#a58af8]/10 flex flex-col items-center mb-4">
              <div className="flex gap-4 mb-2">
                <span className="text-xs text-white/60">Active Stakes: <span className="font-bold text-white">{filteredStakes.length}</span></span>
                <span className="text-xs text-white/60">Current Total Active Staked: <span className="font-bold text-white">{formatNumber(totalStakeAmount)} POL</span></span>
                <span className="text-xs text-white/60">Total Claimable: <span className="font-bold text-[#facc15]">{formatNumber(totalUnclaimed)} POL</span></span>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-4 text-white/60">Loading active stakes...</div>
            ) : filteredStakes.length === 0 ? (
              <div className="text-center py-4 text-white/60">No active stakes</div>
            ) : (
              filteredStakes.map((stake: StakeData, index: number) => (
                <div
                  key={stake.stakeId}
                  className="bg-[#0f0c1a]/70 rounded-lg p-3 mt-2 border border-[#a58af8]/30 hover:border-[#a58af8]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(165,138,248,0.2)] overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#a58af8]/5 transition-colors duration-200"
                    onClick={() => toggleCard(index)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-[#0f0c1a] border border-[#a58af8]/40 flex items-center justify-center flex-shrink-0">
                        <User size={12} className="text-[#a58af8]" />
                      </div>
                      <p className="text-white/90 text-sm font-medium truncate">Stake {index + 1}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center flex-shrink-0">
                      {expandedCards[index] ? (
                        <ChevronUp size={12} className="text-[#a58af8]" />
                      ) : (
                        <ChevronDown size={12} className="text-[#a58af8]" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCards[index] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#18102a]/80 rounded-xl p-4 border border-[#a58af8]/10 flex flex-col items-start">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="text-[#a58af8] w-4 h-4" />
                            <span className="text-base font-bold text-white">{formatNumber(stake.amount)} POL</span>
                          </div>
                          <span className="text-xs text-white/60 mb-1">Stake ID: {stake.stakeId}</span>
                          <span className="text-xs text-white/60 mb-1">Start Time: {stake.startTime.toLocaleString()}</span>
                          <span className="text-xs text-white/60 mb-1">Claimed: {formatNumber(stake.claimed)} POL</span>
                          <span className="text-xs text-white/60 mb-1">Rewards Claimed: {formatNumber(stake.rewardsClaimed)} POL</span>
                          <span className="text-xs text-white/60 mb-1">Last Claimed: {stake.lastClaimedTime.toLocaleString()}</span>
                          <span className="text-xs text-white/60 mb-1">Remaining Cap: {formatNumber(stake.remainingCap)} POL</span>
                          <span className="text-xs text-white/60 mb-1">Tier: {stake.tier}</span>
                          <span className="text-xs text-white/60 mb-1">Active: {stake.active}</span>

                          {/* <span className="text-xs text-white/60 mb-1">Rewards/Second: {formatRewardsPerSecond(rewardsPerSecond)} POL</span> */}
                          <div className="w-full mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-white font-bold">{formatNumber(stake.claimed + stake.rewardsClaimed)} POL</span>
                              <span className="text-xs text-[#facc15] font-bold">{formatNumber(stake.remainingCap)} POL</span>
                            </div>
                            <div className="relative h-3 bg-[#0f0c1a]/70 rounded-full overflow-hidden border border-[#a58af8]/20">
                              {(() => {
                                const progress = stake.amount > 0 ? ((stake.claimed + stake.rewardsClaimed) / (stake.amount * 3)) * 100 : 0;
                                return (
                                  <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-full"
                                  >
                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.1)_100%)] animate-shimmer-effect"></div>
                                  </motion.div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StakeContracts; 
