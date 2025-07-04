"use client"

import { useRef, useEffect, useState } from "react"
import { X, Tag, Trash2, ArrowRight } from "lucide-react"
import { useCollection } from "./collection-context"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"

interface BatchActionPanelProps {
  selectedCards: string[]
  onClearSelection: () => void
}

export function BatchActionPanel({ selectedCards, onClearSelection }: BatchActionPanelProps) {
  const { cards, listNFTs, delistNFTs } = useCollection()
  const panelRef = useRef<HTMLDivElement>(null)
  const [isListing, setIsListing] = useState(false)
  const [isDelisting, setIsDelisting] = useState(false)
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [listingPrice, setListingPrice] = useState("1.0")
  const [error, setError] = useState<string | null>(null)

  // Get selected card details
  const selectedCardDetails = cards.filter((card) => selectedCards.includes(card.id))

  // Calculate total value (use estimated value for unlisted, actual price for listed)
  const totalValue = selectedCardDetails.reduce((sum, card) => sum + card.value, 0)

  // Determine available actions based on selected cards
  const unlistedCards = selectedCardDetails.filter(card => !card.isListed)
  const listedCards = selectedCardDetails.filter(card => card.isListed && card.listingInfo?.status === "active")
  const soldCards = selectedCardDetails.filter(card => card.isListed && card.listingInfo?.status === "sold")

  const canList = unlistedCards.length > 0
  const canDelist = listedCards.length > 0
  const hasSoldCards = soldCards.length > 0

  // Animation for panel
  useEffect(() => {
    if (panelRef.current) {
      // Initial state
      gsap.set(panelRef.current, {
        y: 100,
        opacity: 0,
      })

      // Animate in
      gsap.to(panelRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "cubic-bezier(0.17, 0.67, 0.83, 0.67)",
      })
    }

    return () => {
      if (panelRef.current) {
        // Animate out
        gsap.to(panelRef.current, {
          y: 100,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        })
      }
    }
  }, [])

  const handleListNFTs = async () => {
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      setError("Please enter a valid price")
      return
    }

    setIsListing(true)
    setError(null)

    try {
      await listNFTs(selectedCards, parseFloat(listingPrice))
      onClearSelection()
      setShowPriceInput(false)
      setListingPrice("1.0")
    } catch (error: any) {
      console.error("Error listing NFTs:", error)
      setError(error.message || "Failed to list NFTs")
    } finally {
      setIsListing(false)
    }
  }

  const handleDelistNFTs = async () => {
    setIsDelisting(true)
    setError(null)

    try {
      await delistNFTs(selectedCards)
      onClearSelection()
    } catch (error: any) {
      console.error("Error delisting NFTs:", error)
      setError(error.message || "Failed to delist NFTs")
    } finally {
      setIsDelisting(false)
    }
  }

  return (
    <div ref={panelRef} className="fixed bottom-0 left-0 right-0 bg-pikavault-dark border-t-4 border-pikavault-yellow z-40 p-6">
      <div className="container mx-auto">
        {/* Error message */}
        {error && (
          <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-3 mb-4 text-center">
            <p className="text-pikavault-pink text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {error}
            </p>
          </div>
        )}

        {/* Price input for listing */}
        {showPriceInput && (
          <div className="bg-white/5 border border-white/20 p-4 mb-4">
            <h3 className="text-white text-lg font-bold mb-3" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
              SET LISTING PRICE
            </h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-white/70 text-sm block mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Price per NFT (SOL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="w-full bg-pikavault-dark border-2 border-white/30 text-white p-3 text-lg font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  placeholder="1.0"
                />
              </div>
              <Button
                onClick={handleListNFTs}
                disabled={isListing}
                className="bg-pikavault-yellow hover:bg-pikavault-yellow/90 text-pikavault-dark font-bold py-4 px-6 rounded-none"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {isListing ? "LISTING..." : "CONFIRM"}
              </Button>
              <Button
                onClick={() => setShowPriceInput(false)}
                className="bg-transparent border-2 border-white/30 hover:border-white/60 text-white font-bold py-4 px-6 rounded-none"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                CANCEL
              </Button>
            </div>
          </div>
        )}

        {/* Main panel content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <button onClick={onClearSelection} className="p-2 text-white/70 hover:text-pikavault-yellow transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div>
              <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {selectedCards.length} CARDS SELECTED
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-xl font-black text-white" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                  TOTAL: <span className="text-pikavault-yellow">{totalValue.toFixed(2)} SOL</span>
                </p>
                {unlistedCards.length > 0 && (
                  <span className="text-pikavault-cyan text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {unlistedCards.length} unlisted
                  </span>
                )}
                {listedCards.length > 0 && (
                  <span className="text-pikavault-yellow text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {listedCards.length} listed
                  </span>
                )}
                {soldCards.length > 0 && (
                  <span className="text-pikavault-pink text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {soldCards.length} sold
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            {/* List button - only show if there are unlisted cards */}
            {canList && (
              <Button
                onClick={() => setShowPriceInput(true)}
                disabled={isListing || showPriceInput}
                className="bg-pikavault-yellow hover:bg-pikavault-yellow/90 text-pikavault-dark font-bold py-4 px-6 rounded-none flex items-center space-x-2"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                <Tag className="w-5 h-5" />
                <span>LIST ({unlistedCards.length})</span>
              </Button>
            )}

            {/* Delist button - only show if there are active listings */}
            {canDelist && (
              <Button
                onClick={handleDelistNFTs}
                disabled={isDelisting || showPriceInput}
                className="bg-pikavault-pink hover:bg-pikavault-pink/90 text-white font-bold py-4 px-6 rounded-none flex items-center space-x-2"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                <Trash2 className="w-5 h-5" />
                <span>{isDelisting ? "DELISTING..." : `DELIST (${listedCards.length})`}</span>
              </Button>
            )}

            {/* Info for sold cards */}
            {hasSoldCards && !canList && !canDelist && (
              <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink text-pikavault-pink font-bold py-4 px-6 rounded-none flex items-center space-x-2">
                <span style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                  {soldCards.length} SOLD - AWAITING ESCROW RELEASE
                </span>
              </div>
            )}

            {/* Transfer button (disabled for now) */}
            <Button
              disabled
              className="bg-transparent border-4 border-white/30 text-white/50 font-bold py-4 px-6 rounded-none flex items-center space-x-2"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              <ArrowRight className="w-5 h-5" />
              <span>TRANSFER</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
