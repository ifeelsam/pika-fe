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
import { useNFTMetadata, useOwnershipHistory } from "@/hooks/use-nft-metadata"

interface CardDetailClientProps {
  params: Promise<{ id: string }>
}

export function CardDetailClient({ params }: CardDetailClientProps) {
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
  
  // Fetch real ownership history for this NFT
  const { 
    ownershipHistory, 
    isLoading: historyLoading, 
    error: historyError 
  } = useOwnershipHistory(card?.nftMint)
  
  // Create enhanced card data with real metadata and ownership history
  const enhancedCard = getEnhancedCardData(card || null, nftMetadata, ownershipHistory)

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
          {historyLoading ? (
            <section className="py-16">
              <div className="container mx-auto">
                <h2 className="text-2xl md:text-4xl font-black mb-12 font-monument">
                  OWNERSHIP <span className="text-pikavault-yellow">HISTORY</span>
                </h2>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 md:left-8 top-0 bottom-0 w-1 bg-pikavault-yellow/30"></div>

                  <div className="space-y-8">
                    {/* Skeleton Loading Items */}
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="relative flex items-center space-x-8 animate-pulse">
                        {/* Timeline dot skeleton */}
                        <div className="relative z-10">
                          <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-700 flex items-center justify-center">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-600 rounded"></div>
                          </div>
                        </div>

                        {/* Content skeleton */}
                        <div className="flex-1 bg-white/5 border border-white/20 p-6">
                          <div className="md:flex md:justify-between md:items-start">
                            <div className="space-y-3">
                              {/* Address skeleton */}
                              <div className="h-5 md:h-6 bg-gray-600 rounded w-32 md:w-40"></div>
                              {/* Date skeleton */}
                              <div className="h-4 bg-gray-700 rounded w-24 md:w-32"></div>
                            </div>
                            <div className="mt-6 md:mt-0 md:text-right space-y-3">
                              {/* Price skeleton */}
                              <div className="h-6 md:h-8 bg-gray-600 rounded w-20 md:w-24"></div>
                              {/* Transaction link skeleton */}
                              <div className="h-4 bg-gray-700 rounded w-16 md:w-20"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : historyError ? (
            <div className="py-16">
              <div className="container mx-auto">
                <h2 className="text-2xl md:text-4xl font-black mb-12 font-monument">
                  OWNERSHIP <span className="text-pikavault-yellow">HISTORY</span>
                </h2>
                <div className="flex items-center justify-center py-12">
                  <div className="text-red-400">Error loading ownership history</div>
                </div>
              </div>
            </div>
          ) : (
            <OwnershipHistory 
              history={enhancedCard?.ownershipHistory || []}
              listingPrice={card.price}
            />
          )}
        </div>

        {/* Related Cards */}
        <div>
          <RelatedCards currentCard={displayCard} />
        </div>
      </div>
    </main>
  )
} 