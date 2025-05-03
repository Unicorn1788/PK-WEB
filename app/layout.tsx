import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Providers } from "./providers"
import ErrorBoundary from "../components/error-boundary"
import { ImagePreloader } from "@/components/image-preloader"
import NetworkStatus from "@/components/network-status"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Polking - Reign Over Rewards",
  description: "Premium crypto staking platform with royal rewards",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <ErrorBoundary
              fallback={<div style={{ padding: "20px", color: "red" }}>Terjadi Error! Periksa console.</div>}
            >
              <ImagePreloader />
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <div className="flex-1">{children}</div>
                <Footer />
                <NetworkStatus />
              </div>
            </ErrorBoundary>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
