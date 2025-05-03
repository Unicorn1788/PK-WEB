"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { formatUnits } from "viem"
import { readContract } from "wagmi/actions"
import { useConfig } from "wagmi"
import { TOKEN_CONTRACT_ADDRESS } from "./constants"
import { erc20Abi } from "viem"
import { polygon } from "wagmi/chains"

interface TokenBalance {
  symbol: string
  balance: string
  decimals: number
}

// Token configurations
const TOKENS = [
  {
    address: "0x0000000000000000000000000000000000001010" as `0x${string}`, // MATIC token address on Polygon
    symbol: "MATIC",
    decimals: 18,
  },
  {
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    symbol: "POLKING",
    decimals: 6,
  },
]

export function useWalletBalance() {
  const { address, isConnected } = useWallet()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const config = useConfig()

  useEffect(() => {
    // Strict window check for production
    if (typeof window === 'undefined') return
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchBalances = async () => {
      // Additional safety check
      if (typeof window === 'undefined') return

      if (!isConnected || !address) {
        setBalances([])
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const balancePromises = TOKENS.map(async (token) => {
          try {
            const balance = await readContract(config, {
              address: token.address,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address as `0x${string}`],
            })
            return {
              symbol: token.symbol,
              balance: formatUnits(balance as bigint, token.decimals),
              decimals: token.decimals,
            }
          } catch (error) {
            console.error(`Error fetching ${token.symbol} balance:`, error)
            return {
              symbol: token.symbol,
              balance: "0",
              decimals: token.decimals,
            }
          }
        })

        const results = await Promise.all(balancePromises)
        setBalances(results)
      } catch (error) {
        console.error("Error fetching balances:", error)
        setError(error instanceof Error ? error : new Error("Failed to fetch balances"))
        setBalances([])
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
    fetchBalances()
    }
  }, [address, isConnected, config, mounted])

  return {
    balances,
    isLoading: !mounted || isLoading,
    error,
  }
} 
