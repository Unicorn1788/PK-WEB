export interface GasEstimation {
  gasLimit: bigint
  gasPriceWei: bigint
  estimatedCostWei: bigint
  estimatedCostEther: string
  estimatedTimeMinutes: number
  speed: "slow" | "average" | "fast"
}

export async function getGasPrices(chainId: number) {
  return {
    slow: BigInt(30000000000),
    average: BigInt(40000000000),
    fast: BigInt(50000000000)
  }
}

export function calculateGasCost(gasLimit: bigint, gasPrice: bigint): bigint {
  return gasLimit * gasPrice
}

export function getEstimatedTime(speed: "slow" | "average" | "fast"): number {
  return { slow: 5, average: 2, fast: 1 }[speed]
} 