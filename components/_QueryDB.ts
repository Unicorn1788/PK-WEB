"use client";

import { useEffect, useState, useCallback } from "react";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { useWallet } from "@/context/wallet-context";
import contractAbi from "../app/contracts/PK_RYO.json";

export interface StakeData {
  stakeId: number;
  amount: number;
  startTime: Date;
  claimed: number;
  rewardsClaimed: number;
  lastClaimedTime: Date;
  remainingCap: number;
  tier: number;
  active: boolean;
}

export interface QueryConditions {
  filter?: "all" | "active" | "inactive";
  select?: (keyof StakeData)[];
}

export interface QueryDBResult {
  data: {
    allStakes: StakeData[];
  };
  totalUnclaimed: number;
  rewardsPerSecond: number;
  loading: boolean;
  triggerReload: () => void;
}

const formatNumber = (value: number): number => {
  return Number(value.toFixed(6));
};

const CACHE_DURATION = 300000;
const stakeCache = new Map<string, {
  data: {
    allStakes: StakeData[];
  };
  totalUnclaimed: number;
  rewardsPerSecond: number;
  timestamp: number;
}>();

export const useQueryDB = (options: QueryConditions): QueryDBResult => {
  const { address, isConnected } = useWallet();
  const [allStakes, setAllStakes] = useState<StakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnclaimed, setTotalUnclaimed] = useState(0);
  const [rewardsPerSecond, setRewardsPerSecond] = useState(0);
  const [shouldReload, setShouldReload] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rpcProvider, setRpcProvider] = useState<JsonRpcProvider | null>(null);

  // Initialize mounted state and provider
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);
    const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_URL as string);
    setRpcProvider(provider);

    return () => {
      // Cleanup provider if needed
      provider.removeAllListeners();
    };
  }, []);

  // Function to trigger a reload
  const triggerReload = useCallback(() => {
    if (!mounted) return;
    setShouldReload(true);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !rpcProvider || !address || !isConnected) {
      return;
    }

    const resetState = () => {
      setAllStakes([]);
      setTotalUnclaimed(0);
      setRewardsPerSecond(0);
      setLoading(false);
    };

    const fetchStakes = async () => {
      setLoading(true);
      try {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddress) {
          throw new Error("Contract address is not defined");
        }
        if (!contractAbi) {
          throw new Error("Contract ABI is not defined");
        }

        const readOnlyContract = new Contract(
          contractAddress,
          contractAbi,
          rpcProvider
        );

        if (!readOnlyContract || !readOnlyContract.interface) {
          throw new Error("Contract initialization failed");
        }

        // Get live rewards data
        const [totalUnclaimedRaw, rewardsPerSecondRaw] = await readOnlyContract.getLiveRewardsData(address);
        setTotalUnclaimed(formatNumber(Number(formatUnits(totalUnclaimedRaw, 18))));
        setRewardsPerSecond(formatNumber(Number(formatUnits(rewardsPerSecondRaw, 18))));

        const cacheKey = `${address}-stakes`;
        const cachedData = stakeCache.get(cacheKey);
        
        // If we have cached data and we're not forcing a reload, use it
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION && !shouldReload) {
          setAllStakes(cachedData.data.allStakes);
          setTotalUnclaimed(formatNumber(Number(formatUnits(cachedData.totalUnclaimed, 18))));
          setRewardsPerSecond(formatNumber(Number(formatUnits(cachedData.rewardsPerSecond, 18))));
          setLoading(false);
          return;
        }

        // If we're forcing a reload, clear the cache
        if (shouldReload) {
          stakeCache.delete(cacheKey);
          setShouldReload(false);
        }

        const filter = readOnlyContract.filters.Staked(address);
        const events = await readOnlyContract.queryFilter(filter, 0, "latest");
        
        if (events.length === 0) {
          resetState();
          return;
        }

        const lastEvent = events[events.length - 1];
        let maxStakeId = 0;
        
        if ('args' in lastEvent && lastEvent.args && lastEvent.args.stakeId) {
          maxStakeId = Number(lastEvent.args.stakeId);
        } else {
          resetState();
          return;
        }

        const stakes: StakeData[] = [];
        for (let stakeId = 0; stakeId <= maxStakeId; stakeId++) {
          try {
            const raw = await readOnlyContract.stakes(address, stakeId);
            const amount = formatNumber(Number(formatUnits(raw.amount, 18)));
            const claimed = formatNumber(Number(formatUnits(raw.claimed, 18)));
            const rewardsClaimed = formatNumber(Number(formatUnits(raw.rewardsClaimed, 18)));
            const startTime = new Date(Number(raw.startTime) * 1000);
            const lastClaimedTime = new Date(Number(raw.lastClaimedTime) * 1000);
            const remainingCap = formatNumber(Number(formatUnits(raw.remainingCap, 18)));
            const tier = Number(raw.tier);
            const active = Boolean(raw.active);

            stakes.push({
              stakeId,
              amount,
              startTime,
              claimed,
              rewardsClaimed,
              lastClaimedTime,
              remainingCap,
              tier,
              active,
            });
          } catch (error) {
            continue;
          }
        }

        stakes.sort((a, b) => a.stakeId - b.stakeId);
        
        stakeCache.set(cacheKey, {
          data: {
            allStakes: stakes,
          },
          totalUnclaimed: totalUnclaimedRaw,
          rewardsPerSecond: rewardsPerSecondRaw,
          timestamp: Date.now(),
        });
        
        // Filter stakes based on the active property if filter is provided
        const filteredStakes = options.filter
          ? stakes.filter(stake => {
              if (options.filter === "active") return stake.active;
              if (options.filter === "inactive") return !stake.active;
              return true; // "all" or undefined
            })
          : stakes;
          
        setAllStakes(filteredStakes);
      } catch (err) {
        console.error("QueryDB detailed error:", err);
        resetState();
      } finally {
        setLoading(false);
      }
    };

    fetchStakes();
  }, [address, isConnected, options.filter, shouldReload, mounted, rpcProvider]);

  // Return consistent state during SSR and initial client render
  if (!mounted) {
    return {
      data: {
        allStakes: [],
      },
      totalUnclaimed: 0,
      rewardsPerSecond: 0,
      loading: true,
      triggerReload,
    };
  }

  return {
    data: {
      allStakes,
    },
    totalUnclaimed,
    rewardsPerSecond,
    loading,
    triggerReload,
  };
};