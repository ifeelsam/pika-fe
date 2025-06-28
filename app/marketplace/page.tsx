"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { FilterBar } from "@/components/marketplace/filter-bar"
import { CardGrid } from "@/components/marketplace/card-grid"
import { TransactionPanel } from "@/components/marketplace/transaction-panel"
import { BackgroundEffects } from "@/components/marketplace/background-effects"
import { useMarketplace } from "@/components/marketplace/marketplace-context"
import MarketplaceLoading from "./loading"

export default function MarketplacePage() {
  const { isLoading } = useMarketplace()
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Open transaction panel when cards are selected
  useEffect(() => {
    if (selectedCards.length > 0 && !isPanelOpen) {
      setIsPanelOpen(true)
    } else if (selectedCards.length === 0 && isPanelOpen) {
      setIsPanelOpen(false)
    }
  }, [selectedCards, isPanelOpen])

  // Show loading screen while data is being fetched
  if (isLoading) {
    return <MarketplaceLoading />
  }

  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        <MarketplaceHeader />
        <FilterBar />
        <CardGrid selectedCards={selectedCards} setSelectedCards={setSelectedCards} />
      </main>

      <TransactionPanel
        isOpen={isPanelOpen}
        selectedCards={selectedCards}
        onClose={() => {
          setIsPanelOpen(false)
          setSelectedCards([])
        }}
      />
    </div>
  )
}
