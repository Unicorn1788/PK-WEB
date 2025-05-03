"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe2, Shield, Users, TrendingUp } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { usePublicClient } from "wagmi";
import PK_RYO_ABI from "@/app/contracts/PK_RYO.json";

export default function GlobalPoolSection() {
	const { address, isConnected } = useWallet();
	const publicClient = usePublicClient();
	const [showBreakdown, setShowBreakdown] = useState(false);
	const [totalGlobalPool, setTotalGlobalPool] = useState<string>("Loading...");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [rankCounts, setRankCounts] = useState<{ knights: number; dukes: number; kings: number }>({
		knights: 0,
		dukes: 0,
		kings: 0,
	});
	const [rankPools, setRankPools] = useState<{ soldier: string; knight: string; duke: string; king: string }>({
		soldier: "0",
		knight: "0",
		duke: "0",
		king: "0",
	});

	const poolData = {
		totalAmount: "5,000,000",
		distribution: [
			{
				rank: "Soldier",
				percentage: 10,
				description: "Share among Soldier NFT holders",
				color: "from-[#8a63e8] to-[#a58af8]",
				borderColor: "border-[#a58af8]/30",
				iconColor: "text-[#a58af8]",
			},
			{
				rank: "Knight",
				percentage: 20,
				description: "Share among Knight NFT holders",
				color: "from-[#7c4dfa] to-[#9d7aff]",
				borderColor: "border-[#9d7aff]/30",
				iconColor: "text-[#9d7aff]",
			},
			{
				rank: "Duke",
				percentage: 30,
				description: "Share among Duke NFT holders",
				color: "from-[#6c35e3] to-[#8b5cf6]",
				borderColor: "border-[#8b5cf6]/30",
				iconColor: "text-[#8b5cf6]",
			},
			{
				rank: "King",
				percentage: 40,
				description: "Share among King NFT holders",
				color: "from-[#5d1de0] to-[#7c3aed]",
				borderColor: "border-[#7c3aed]/30",
				iconColor: "text-[#7c3aed]",
			},
		],
	};

	useEffect(() => {
    const fetchPoolData = async () => {
      if (!isConnected || !address || !publicClient) {
        console.log("Not connected or address is missing");
        return;
      }
  
      try {
        console.log("Fetching pool data...");
  
        const knights = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: PK_RYO_ABI,
          functionName: 'knightCount',
        }) as unknown as number;
  
        const dukes = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: PK_RYO_ABI,
          functionName: 'dukeCount',
        }) as unknown as number;
  
        const kings = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: PK_RYO_ABI,
          functionName: 'kingCount',
        }) as unknown as number;
  
        const soldierPool = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: PK_RYO_ABI,
          functionName: 'rankPools',
          args: [0],
        }) as unknown as bigint;
  
        const knightPool = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: PK_RYO_ABI,
          functionName: 'rankPools',
          args: [1],
        }) as unknown as bigint;
  
        const dukePool = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: PK_RYO_ABI,
          functionName: 'rankPools',
          args: [2],
        }) as unknown as bigint;
  
        const kingPool = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: PK_RYO_ABI,
          functionName: 'rankPools',
          args: [3],
        }) as unknown as bigint;
  
        setRankPools({
          soldier: (Number(soldierPool) / 1e18).toFixed(4),
          knight: (Number(knightPool) / 1e18).toFixed(4),
          duke: (Number(dukePool) / 1e18).toFixed(4),
          king: (Number(kingPool) / 1e18).toFixed(4),
        });
  
        setRankCounts({ knights, dukes, kings });
  
        const totalPool =
          Number(soldierPool) / 1e18 +
          Number(knightPool) / 1e18 +
          Number(dukePool) / 1e18 +
          Number(kingPool) / 1e18;
  
        console.log("Total Pool (sum of rankPools) in MATIC:", totalPool);
        setTotalGlobalPool(totalPool.toFixed(4) + " MATIC");
  
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching pool data:", error);
        setIsLoading(false);
      }
    };
  
    fetchPoolData();
  }, [isConnected, address, publicClient]);
  

	return (
		<section className='relative py-20 overflow-hidden'>
			{/* Background */}
			<div className='absolute inset-0 bg-gradient-to-b from-[#0e0424] to-[#0a0118] -z-10' />

			{/* Grid overlay */}
			<div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10' />

			{/* Decorative elements */}
			<div className='absolute top-1/4 right-10 w-72 h-72 bg-[#a58af8]/5 rounded-full blur-[80px] -z-10' />
			<div className='absolute bottom-1/4 left-10 w-80 h-80 bg-[#facc15]/5 rounded-full blur-[100px] -z-10' />

			<div className='max-w-6xl mx-auto px-4 sm:px-6'>
				{/* Section Header */}
				<div className='text-center mb-12'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className='inline-block mb-2'>
						<div className='flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#a58af8]/10 border border-[#a58af8]/20'>
							<Globe2 className='w-4 h-4 text-[#a58af8]' />
							<span className='text-sm font-medium text-[#a58af8]'>Global Rewards</span>
						</div>
					</motion.div>

					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className='text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-[#a58af8] to-[#facc15] text-transparent bg-clip-text'>
						Global Staking Pool
					</motion.h2>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className='max-w-2xl mx-auto text-white/70'>
						Our global staking pool is distributed among all ranks. Higher ranks receive a larger share of the pool.
					</motion.p>
				</div>

				{/* Total Global Pool Box */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className='bg-[#0f0824]/50 backdrop-blur-sm border border-[#a58af8]/10 rounded-2xl p-6 shadow-lg mb-8 w-full'>
					<div className='flex flex-col items-center justify-center'>
						<h3 className='text-xl font-medium text-white mb-2'>Total Global Pool</h3>
						<p className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#facc15] to-[#eab308] text-transparent bg-clip-text'>
							{isLoading ? "Loading..." : totalGlobalPool}
						</p>
						<p className='text-white/60 text-sm mt-2'>Updated daily based on staking activity</p>
					</div>
				</motion.div>

				{/* Toggle for Rank Pool Breakdown */}
				<div className='flex justify-center mb-8'>
					<button
						onClick={() => setShowBreakdown(!showBreakdown)}
						className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-300 ${
							showBreakdown
								? "bg-gradient-to-r from-[#a58af8]/80 to-[#facc15]/80 shadow-[0_0_15px_rgba(165,138,248,0.3)]"
								: "bg-[#0f0824]/70 border border-[#a58af8]/20 hover:border-[#a58af8]/40 hover:shadow-[0_0_10px_rgba(165,138,248,0.2)]"
						}`}>
						<span>{showBreakdown ? "Hide" : "Show"} Rank Pool Breakdown</span>
						<ChevronDown className={`w-4 h-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
					</button>
				</div>

				{/* Rank Pool Breakdown - Redesigned */}
				<AnimatePresence>
					{showBreakdown && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className='overflow-hidden'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto'>
								{poolData.distribution.map((item) => (
									<motion.div
										key={item.rank}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4 }}
										className={`bg-[#0f0824]/50 backdrop-blur-sm border ${item.borderColor} rounded-xl overflow-hidden shadow-lg`}>
										{/* Header with gradient */}
										<div className={`bg-gradient-to-r ${item.color} p-4 relative`}>
											<div className='absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,white_0%,transparent_80%)]' />
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 rounded-full bg-[#0f0824]/70 border border-white/20 flex items-center justify-center'>
													<Shield className={`w-5 h-5 ${item.iconColor}`} />
												</div>
												<h3 className='text-xl font-bold text-white'>{item.rank} Pool</h3>
											</div>
										</div>

										{/* Content */}
										<div className='p-5 space-y-4'>
											{/* Percentage */}
											<div className='flex items-center justify-between'>
												<span className='text-white/70'>Allocation:</span>
												<span className='text-lg font-bold text-white'>{item.percentage}% of total pool</span>
											</div>

											{/* Progress bar */}
											<div className='w-full bg-[#0a0118] rounded-full h-3 mb-2'>
												<div
													className={`bg-gradient-to-r ${item.color} h-3 rounded-full`}
													style={{ width: `${item.percentage}%` }}>
													<div className='w-full h-full bg-white/10'></div>
												</div>
											</div>

											{/* Description */}
											<p className='text-white/70'>{item.description}</p>

											{/* Stats */}
											<div className='grid grid-cols-2 gap-3 pt-2'>
												<div className='bg-[#0a0118]/70 rounded-lg p-3 border border-[#a58af8]/10'>
													<div className='flex items-center gap-1.5 mb-1'>
														<Users className='w-3.5 h-3.5 text-[#a58af8]' />
														<p className='text-white/80 text-xs'>NFT Holders</p>
													</div>
													<p className='text-sm font-semibold text-white'>
														{item.rank === "Soldier"
															? rankCounts.knights
															: item.rank === "Knight"
															? rankCounts.knights
															: item.rank === "Duke"
															? rankCounts.dukes
															: rankCounts.kings}
													</p>
												</div>

												<div className='bg-[#0a0118]/70 rounded-lg p-3 border border-[#a58af8]/10'>
													<div className='flex items-center gap-1.5 mb-1'>
														<TrendingUp className='w-3.5 h-3.5 text-[#a58af8]' />
														<p className='text-white/80 text-xs'>Pool Amount</p>
													</div>
													<p className='text-sm font-semibold text-[#facc15]'>
														{item.rank === "Soldier"
															? `${rankPools.soldier} MATIC`
															: item.rank === "Knight"
															? `${rankPools.knight} MATIC`
															: item.rank === "Duke"
															? `${rankPools.duke} MATIC`
															: `${rankPools.king} MATIC`}
													</p>
												</div>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Stats Cards */}
				<div className='mt-16 grid grid-cols-1 md:grid-cols-3 gap-6'>
					{[
						{
							title: "Total Stakers",
							value: "12,458",
							change: "+12.5%",
							icon: <TrendingUp className='w-5 h-5 text-[#a58af8]' />,
						},
						{
							title: "Average Stake",
							value: "2,845 POL",
							change: "+5.2%",
							icon: <TrendingUp className='w-5 h-5 text-[#a58af8]' />,
						},
						{
							title: "Total Rewards Distributed",
							value: "1.2M POL",
							change: "+8.7%",
							icon: <TrendingUp className='w-5 h-5 text-[#a58af8]' />,
						},
					].map((stat, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
							className='bg-[#0f0824]/30 backdrop-blur-sm border border-[#a58af8]/10 rounded-xl p-5 shadow-md'>
							<div className='flex justify-between items-start'>
								<div>
									<h4 className='text-white/70 text-sm mb-1'>{stat.title}</h4>
									<p className='text-xl font-bold text-white'>{stat.value}</p>
								</div>
								<div className='flex items-center gap-1 text-green-400 text-sm'>
									<TrendingUp className='w-4 h-4' />
									<span>{stat.change}</span>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
