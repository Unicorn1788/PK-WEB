import HeroSection from "@/components/hero-section"
import RewardsOverview from "@/components/RewardsOverview"
import StakingSection from "@/components/staking-section"
import { AffiliateSection } from "@/components/affiliate-section"
import NFTBoosterSection from "@/components/nft-booster-section"
import GlobalPoolSection from "@/components/global-pool-section"
import RoadmapSection from "@/components/roadmap"
import FlagCounter from "@/components/flag-counter"
import FaqSection from "@/components/faq-section"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div id="hero-section">
        <HeroSection />
      </div>
      <div id="staking-section">
        <StakingSection />
      </div>
      <div id="rewards-section">
        <RewardsOverview />
      </div>
      <div id="affiliate-section">
        <AffiliateSection />
      </div>
      <div id="nft-section">
        <NFTBoosterSection />
      </div>
      <div id="global-pool-section">
        <GlobalPoolSection />
      </div>
      <div id="roadmap-section">
        <RoadmapSection />
      </div>
      <div id="presence-section">
        <FlagCounter />
      </div>
      <div id="faq-section">
        <FaqSection />
      </div>
    </main>
  )
}
