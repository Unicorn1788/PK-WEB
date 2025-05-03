"use client"

import { useState, useCallback } from "react"
import { useChainId } from "wagmi"
import { type GasEstimation, getGasPrices, calculateGasCost, getEstimatedTime } from "./gas"
import type { TransactionRequest } from "viem"

interface GasEstimateState {
  isLoading: boolean
  isError: boolean
  error: Error | null
  estimation: GasEstimation | null
}

interface EstimateOptions {
  speed?: "slow" | "average" | "fast"
}

/**
 * Hook for estimating gas costs for transactions
 */
export function useGasEstimate() {
  const chainId = useChainId()
  const [state, setState] = useState<GasEstimateState>({
    isLoading: false,
    isError: false,
    error: null,
    estimation: null,
  })

  /**
   * Estimate gas for a transaction
   */
  const estimateGas = useCallback(
    async (
      transaction: Partial<TransactionRequest> = {},
      options: EstimateOptions = { speed: "average" },
    ): Promise<GasEstimation | null> => {
      if (!chainId) return null

      setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }))

      try {
        // Get current gas prices
        const gasPrices = await getGasPrices(chainId)

        // Determine gas price based on selected speed
        const speed = options.speed || "average"
        const gasPrice = gasPrices[speed]

        // Estimate gas limit for the transaction
        // In a real implementation, you would use wagmi's useEstimateGas hook
        // For this example, we'll use a placeholder value
        const gasLimit = transaction.gas || BigInt(200000) // Default gas limit

        // Calculate estimated cost
        const estimatedCostWei = calculateGasCost(gasLimit, gasPrice)

        // Create estimation result
        const estimation: GasEstimation = {
          gasLimit,
          gasPriceWei: gasPrice,
          estimatedCostWei,
          estimatedCostEther: (estimatedCostWei / BigInt(10 ** 18)).toString(),
          estimatedTimeMinutes: getEstimatedTime(speed),
          speed,
        }

        setState({
          isLoading: false,
          isError: false,
          error: null,
          estimation,
        })

        return estimation
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        setState({
          isLoading: false,
          isError: true,
          error: err,
          estimation: null,
        })
        return null
      }
    },
    [chainId],
  )

  return {
    ...state,
    estimateGas,
  }
}
