"use client"

// app/providers.tsx or a similar root file
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import {http, WagmiProvider, CreateConnectorFn, injected } from 'wagmi'
import { polygon } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ToastProvider } from '@/context/toast-context'
import { WalletProvider } from '@/context/wallet-context'
import { TransactionProvider } from '@/context/transaction-context'
import { useAppKit } from "@reown/appkit/react"
import { useWallet } from "@/context/wallet-context"
import { useQueryDB } from "../components/QueryDB"
import { useState, useEffect } from 'react'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Configure Wagmi adapter with silent connection
const wagmiAdapter = new WagmiAdapter({
  networks: [polygon],
  projectId,
  //autoConnect: true,
  connectors: [injected({ shimDisconnect: true })],
})

// Initialize AppKit with silent connection
createAppKit({
  adapters: [wagmiAdapter],
  networks: [polygon],
  defaultNetwork: polygon,
  projectId,
  features: {
    email: false,
    socials: false,
  },

  //metadata: {
  //  name: 'Polking Protocols',
  //  description: 'Premium crypto staking platform with royal rewards',
  //  url: 'https://polking.io',
  //  icons: ['https://polking.io/images/polking-logo.png'],
  //},
})

// Inline QueryDBFetcher component
function QueryDBFetcher() {
  const { address, isConnected } = useWallet();
  useQueryDB({ filter: "all" }); // Always call the hook
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <WalletProvider>
            <TransactionProvider>
              <QueryDBFetcher />
              {children}
            </TransactionProvider>
          </WalletProvider>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
