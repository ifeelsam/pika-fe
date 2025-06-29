"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/background-effects"
import { CardDisplay } from "@/components/card-detail/card-display"
import { InformationPanel } from "@/components/card-detail/information-panel"
import { CardInspectionModal } from "@/components/card-detail/card-inspection-modal"
import { PriceChart } from "@/components/card-detail/price-chart"
import { OwnershipHistory } from "@/components/card-detail/ownership-history"
import { RelatedCards } from "@/components/card-detail/related-cards"
import { useMarketplace } from "@/components/marketplace/marketplace-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function CardDetailPage({ params }: { params: { id: string } }) {
  const { cards, isLoading } = useMarketplace()
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"front" | "back" | "holo">("front")
  const [isWatchlisted, setIsWatchlisted] = useState(false)

  // Find the card by nft_address (id parameter)
  const nftAddress = params.id
  const cardData = cards.find(card => card.nftMint === nftAddress)

  // Mock additional data that might not be in the marketplace context
  const getEnhancedCardData = (card: any) => {
    if (!card) return null

    return {
      ...card,
      setName: card.collection.toUpperCase(),
      setNumber: `${Math.abs(card.rotation).toString().padStart(3, '0')}/150`,
      condition: "NM",
      conditionGrade: "A+",
      conditionDescription: "Near Mint - Minor edge wear, excellent centering",
      priceChange24h: Math.random() * 20 - 10, // Random price change for demo
      lastSalePrice: card.price * 0.9,
      lastSaleDate: "2025-01-15",
      floorPrice: card.price * 0.8,
      backImageUrl: "/electric-pokemon-card-back.png",
      holographicImageUrl: card.imageUrl,
      authenticated: true,
      authenticationHash: `0x${card.id}...${card.nftMint.slice(-8)}`,
      blockchainTxHash: `0x${card.listingPubkey.slice(-16)}`,
      editionNumber: parseInt(card.id) || 42,
      printRun: 1000,
      owner: {
        address: card.owner,
        username: `User_${card.owner.slice(0, 6)}`,
        avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${card.owner}`,
        verified: true,
      },
      seller: {
        address: card.owner,
        username: `Trader_${card.owner.slice(-6)}`,
        rating: 4.5 + Math.random() * 0.5,
        totalSales: Math.floor(Math.random() * 500) + 50,
      },
      priceHistory: [
        { date: "2025-01-01", price: card.price * 0.8 },
        { date: "2025-01-05", price: card.price * 0.85 },
        { date: "2025-01-10", price: card.price * 0.95 },
        { date: "2025-01-15", price: card.price * 0.9 },
        { date: "2025-01-20", price: card.price },
      ],
      ownershipHistory: [
        {
          owner: card.owner,
          date: "2025-01-20",
          price: card.price * 0.9,
          txHash: `0x${card.listingPubkey.slice(-8)}...`,
        },
        {
          owner: `${card.owner.slice(0, 10)}...different`,
          date: "2025-01-15",
          price: card.price * 0.8,
          txHash: `0x${card.id}...`,
        },
      ],
    }
  }

  const enhancedCardData = getEnhancedCardData(cardData)

  // Sound effects
  const playSound = (soundType: "hover" | "click" | "success") => {
    // In a real app, you would implement actual sound effects here
    console.log(`Playing ${soundType} sound`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
        <BackgroundEffects />
        <Navigation />

        <main className="pt-24 pb-32 relative z-10">
          <div className="container mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 min-h-screen">
              {/* Hero Card Display - Left 60% */}
              <div className="lg:col-span-3">
                <Skeleton className="w-full aspect-[3/4] bg-white/10" />
              </div>

              {/* Information Panel - Right 40% */}
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="w-full h-12 bg-white/10" />
                <Skeleton className="w-full h-8 bg-white/10" />
                <Skeleton className="w-full h-24 bg-white/10" />
                <Skeleton className="w-full h-16 bg-white/10" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Card not found state
  if (!enhancedCardData) {
    return (
      <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
        <BackgroundEffects />
        <Navigation />

        <main className="pt-24 pb-32 relative z-10">
          <div className="container mx-auto px-4 md:px-8 lg:px-12 text-center">
            <div className="max-w-md mx-auto mt-32">
              <h1 className="text-4xl font-black mb-4" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                CARD NOT FOUND
              </h1>
              <p className="text-white/70 text-lg mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                The card with NFT address "{nftAddress}" could not be found.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-pikavault-yellow text-pikavault-dark px-8 py-3 font-bold hover:bg-pikavault-yellow/90"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                GO BACK
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main className="pt-24 pb-32 relative z-10">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 min-h-screen">
            {/* Hero Card Display - Left 60% */}
            <div className="lg:col-span-3">
              <CardDisplay
                card={enhancedCardData}
                currentView={currentView}
                onViewChange={setCurrentView}
                onInspectionOpen={() => setIsInspectionOpen(true)}
                onSound={playSound}
              />
            </div>

            {/* Information Panel - Right 40% */}
            <div className="lg:col-span-2">
              <InformationPanel
                card={enhancedCardData}
                isWatchlisted={isWatchlisted}
                onWatchlistToggle={() => setIsWatchlisted(!isWatchlisted)}
                onSound={playSound}
              />
            </div>
          </div>

          {/* Additional Sections */}
          <div className="mt-32 space-y-32">
            <PriceChart data={enhancedCardData.priceHistory} currentPrice={enhancedCardData.price} />
            <OwnershipHistory history={enhancedCardData.ownershipHistory} />
            <RelatedCards currentCard={enhancedCardData} />
          </div>
        </div>
      </main>

      {/* Card Inspection Modal */}
      <CardInspectionModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        card={enhancedCardData}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
    </div>
  )
}
