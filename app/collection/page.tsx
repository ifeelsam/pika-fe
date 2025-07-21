"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { CollectionHeader } from "@/components/collection/collection-header"
import { StatsBar } from "@/components/collection/stats-bar"
import { CollectionGrid } from "@/components/collection/collection-grid"
import { LockedState } from "@/components/collection/empty-state"
import { DisconnectedState } from "@/components/collection/disconnected-state"
import { BatchActionPanel } from "@/components/collection/batch-action-panel"
import { BackgroundEffects } from "@/components/background-effects"
import { CollectionProvider, useCollection } from "@/components/collection/collection-context"
import { useWallet } from "@solana/wallet-adapter-react"

function CollectionContent() {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const { connected } = useWallet()
  const { cards, isLoading, error, refreshNFTs } = useCollection()

  // Show disconnected state if wallet is not connected
  if (!connected) {
    return (
      <>
        <Navigation />
        <DisconnectedState />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        <CollectionHeader />

        {/* Loading state */}
        {isLoading && (
          <div className="mt-12">
            <div className="h-12 w-full max-w-4xl bg-white/10 animate-pulse mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] bg-white/5 animate-pulse"></div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="mt-12 text-center">
            <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-6 max-w-md mx-auto">
              <h3 className="text-pikavault-pink text-xl font-bold mb-2" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                ERROR LOADING NFTS
              </h3>
              <p className="text-white/70 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {error}
              </p>
              <button
                onClick={() => refreshNFTs()}
                className="bg-pikavault-yellow sm:hover:bg-pikavault-yellow/90 text-pikavault-dark font-bold py-2 px-4 transition-colors"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* Content when loaded */}
        {!isLoading && !error && (
          <>
            {cards.length > 0 ? (
              <>
                <StatsBar />
                <CollectionGrid selectedCards={selectedCards} setSelectedCards={setSelectedCards} />
                {selectedCards.length > 0 && (
                  <BatchActionPanel selectedCards={selectedCards} onClearSelection={() => setSelectedCards([])} />
                )}
              </>
            ) : (
              <LockedState />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function CollectionPage() {
  return (
    <CollectionProvider>
      <CollectionContent />
    </CollectionProvider>
  )
}
