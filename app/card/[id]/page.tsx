"use client"

import { use, useState } from "react"
import { useMarketplace } from "@/components/marketplace/marketplace-context"
import { CardDisplay } from "@/components/card-detail/card-display"
import { InformationPanel } from "@/components/card-detail/information-panel"
import { PriceChart } from "@/components/card-detail/price-chart"
import { OwnershipHistory } from "@/components/card-detail/ownership-history"
import { RelatedCards } from "@/components/card-detail/related-cards"
import { BackgroundEffects } from "@/components/background-effects"
import { Navigation } from "@/components/navigation"
import { useNFTMetadata } from "@/hooks/use-nft-metadata"

interface CardDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CardDetailPage({ params }: CardDetailPageProps) {
  const { id: nft_address } = use(params)
  const { cards } = useMarketplace()
  
  // State for CardDisplay
  const [currentView, setCurrentView] = useState<CardViewMode>("front")
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  
  // State for InformationPanel
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  
  // Find the card with matching nft_address (mint address)
  const card: BaseCardData | undefined = cards.find(
    (c) => c.nftMint === nft_address || c.id === nft_address
  )

  // Fetch detailed metadata for this NFT
  const { 
    nftMetadata, 
    isLoading: metadataLoading, 
    error: metadataError, 
    getEnhancedCardData 
  } = useNFTMetadata(card?.nftMint)
  
  // Create enhanced card data with real metadata
  const enhancedCard = getEnhancedCardData(card || null, nftMetadata)

  // Sound effects handler
  const playSound = (soundType: "hover" | "click" | "success") => {
    console.log(`Playing ${soundType} sound`)
  }

  if (!card) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden relative">
        <BackgroundEffects />
        <Navigation />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Card Not Found</h1>
            <p className="text-gray-400">The requested card could not be found.</p>
          </div>
        </div>
      </main>
    )
  }

  const displayCard = enhancedCard || card

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Card Display */}
          <div className="space-y-6">
            <CardDisplay 
              card={displayCard}
              currentView={currentView}
              onViewChange={setCurrentView}
              onInspectionOpen={() => setIsInspectionOpen(true)}
              onSound={playSound}
            />
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <InformationPanel 
              card={displayCard}
              isWatchlisted={isWatchlisted}
              onWatchlistToggle={() => setIsWatchlisted(!isWatchlisted)}
              onSound={playSound}
            />
          </div>
        </div>

        {/* Price Chart */}
        <div className="hidden sm:block mb-8">
          <PriceChart 
            data={enhancedCard?.priceHistory || [
              { date: "2025-01-01", price: card.price * 0.8 },
              { date: "2025-01-05", price: card.price * 0.85 },
              { date: "2025-01-10", price: card.price * 0.95 },
              { date: "2025-01-15", price: card.price * 0.9 },
              { date: "2025-01-20", price: card.price },
            ]}
            currentPrice={card.price}
          />
        </div>

        {/* Ownership History */}
        <div className="mb-8">
          <OwnershipHistory 
            history={enhancedCard?.ownershipHistory || [
              {
                owner: card.ownerAddress,
                date: "2025-01-20",
                price: card.price * 0.9,
                txHash: `${card.listingPubkey.slice(-8)}...`,
              },
              {
                owner: `${card.ownerAddress.slice(0, 10)}...different`,
                date: "2025-01-15",
                price: card.price * 0.8,
                txHash: `${card.id}...`,
              },
            ]}
          />
        </div>

        {/* Related Cards */}
        <div>
          <RelatedCards currentCard={displayCard} />
        </div>
      </div>
    </main>
  )
}
