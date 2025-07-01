"use client"

import { useRef, useEffect, useState } from "react"
import { X } from "lucide-react"
import { useMarketplace } from "./marketplace-context"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAnchorProgram } from "@/lib/anchor/client"
import { delistNFT, purchaseNFT, findMarketplacePDA } from "@/lib/anchor/transactions"
import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_ADMIN } from "@/lib/anchor/config"
import { useRouter } from "next/navigation"

interface TransactionPanelProps {
  isOpen: boolean
  selectedCards: string[]
  onClose: () => void
}

export function TransactionPanel({ isOpen, selectedCards, onClose }: TransactionPanelProps) {
  const { cards, refreshListings } = useMarketplace()
  const { publicKey } = useWallet()
  const { program } = useAnchorProgram()
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [isDelisting, setIsDelisting] = useState(false)
  const [delistError, setDelistError] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  // Get selected card details
  const selectedCardDetails = cards.filter((card) => selectedCards.includes(card.id))

  // Calculate total price
  const totalPrice = selectedCardDetails.reduce((sum, card) => sum + card.price, 0)

  // Check if current user owns any of the selected cards
  const userOwnedCards = selectedCardDetails.filter(card => 
    publicKey && card.owner === publicKey.toString()
  )
  const isUserOwned = userOwnedCards.length > 0

  // Animation for panel
  useEffect(() => {
    if (isOpen) {
      setDelistError(null)
      setPurchaseError(null)
    }
    if (panelRef.current) {
      if (isOpen) {
        gsap.to(panelRef.current, {
          x: 0,
          duration: 0.5,
          ease: "cubic-bezier(0, 0.9, 0.1, 1)",
        })
      } else {
        gsap.to(panelRef.current, {
          x: "100%",
          duration: 0.5,
          ease: "cubic-bezier(0, 0.9, 0.1, 1)",
        })
      }
    }
  }, [isOpen, selectedCards])

  // Handle delist functionality
  const handleDelist = async () => {
    if (!program || !publicKey || userOwnedCards.length === 0) {
      setDelistError("Missing required data for delisting")
      return
    }

    setIsDelisting(true)
    setDelistError(null)
    
    try {
      // For now, we'll handle one card at a time (could be extended for batch operations)
      const card = userOwnedCards[0]
      
      // Get the marketplace PDA
      const [marketplace] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)
      
      await delistNFT(
        program,
        publicKey,
        marketplace,
        new PublicKey(card.nftMint),
        new PublicKey(card.listingPubkey)
      )

      // Success feedback
      console.log("✅ NFT delisted successfully!")
      
      // Refresh listings and close panel
      await refreshListings()
      onClose()
      
    } catch (error: any) {
      console.error("Error delisting NFT:", error)
      setDelistError(error.message || "Failed to delist NFT")
    } finally {
      setIsDelisting(false)
    }
  }

  const handlePurchase = async () => {
    if (!program || !publicKey || selectedCardDetails.length === 0) {
      setPurchaseError("Missing required data for purchase")
      return
    }

    // Check if user is trying to buy their own card
    const userOwnedCard = selectedCardDetails.find(card => card.owner === publicKey.toString())
    if (userOwnedCard) {
      setPurchaseError("You cannot purchase your own card")
      return
    }

    setIsPurchasing(true)
    setPurchaseError(null)
    
    try {
      // handles one card at a time (could be extended for batch operations)
      const card = selectedCardDetails[0]
      
      // the marketplace PDA
      const [marketplace] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)
      console.log("marketplace", marketplace)
      await purchaseNFT(
        program,
        publicKey, // buyer
        marketplace,
        new PublicKey(card.listingPubkey),
        new PublicKey(card.nftMint),
        new PublicKey(card.owner) // seller
      )

      // Success feedback
      console.log("✅ NFT purchased successfully!")
      
      // Refresh listings and close panel
      await refreshListings()
      onClose()
      
    } catch (error: any) {
      console.error("Error purchasing NFT:", error)
      setPurchaseError(error.message || "Failed to purchase NFT")
    } finally {
      setIsPurchasing(false)
    }
  }

  // Handle view card functionality
  const handleViewCard = () => {
    if (selectedCardDetails.length > 0) {
      const card = selectedCardDetails[0]
      router.push(`/card/${card.nftMint}`)
    }
  }

  return (
    <div
      ref={panelRef}
      className="fixed top-0 right-0 w-full sm:w-96 h-full bg-pikavault-dark border-l-4 border-pikavault-yellow z-50 transform translate-x-full"
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            {isUserOwned ? "MANAGE" : "CHECKOUT"}
          </h2>

          <button onClick={onClose} className="p-2 text-white/70 hover:text-pikavault-yellow transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <h3 className="text-white/70 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            SELECTED CARDS ({selectedCards.length})
          </h3>

          <div className="space-y-4">
            {selectedCardDetails.map((card) => (
              <div key={card.id} className="flex items-center space-x-4 border-b border-white/10 pb-4">
                <div
                  className="w-16 h-20 bg-cover bg-center border-2"
                  style={{
                    backgroundImage: `url(${card.imageUrl})`,
                    borderColor:
                      card.rarity === "legendary"
                        ? "#F6FF00"
                        : card.rarity === "epic"
                          ? "#FF2D55"
                          : card.rarity === "rare"
                            ? "#00F5FF"
                            : "#FFFFFF",
                  }}
                ></div>

                <div className="flex-1">
                  <h4 className="text-white font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {card.name}
                  </h4>

                  <p className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    #{card.id}
                  </p>
                  
                  {publicKey && card.owner === publicKey.toString() && (
                    <span className="text-pikavault-yellow text-xs font-bold">OWNED BY YOU</span>
                  )}
                </div>

                <p className="text-white font-black" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                  {card.price} SOL
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-white text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              TOTAL
            </p>

            <p className="text-pikavault-yellow text-2xl font-black" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
              {totalPrice} SOL
            </p>
          </div>

          <div className="space-y-4">
            {(delistError || purchaseError) && (
              <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-3 text-center">
                <p className="text-pikavault-pink text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {delistError || purchaseError}
                </p>
              </div>
            )}
            
            {isUserOwned ? (
              // Show delist button for user-owned cards
              <Button
                onClick={handleDelist}
                disabled={isDelisting}
                className="w-full bg-pikavault-pink hover:bg-pikavault-pink/90 text-white text-lg font-bold py-6 rounded-none disabled:opacity-50"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {isDelisting ? "DELISTING..." : "DELIST"}
              </Button>
            ) : (
              // Show buy button for cards not owned by user
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || !publicKey}
                className="w-full bg-pikavault-yellow hover:bg-pikavault-yellow/90 text-pikavault-dark text-lg font-bold py-6 rounded-none disabled:opacity-50"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {isPurchasing ? "PURCHASING..." : !publicKey ? "CONNECT WALLET" : "BUY NOW"}
              </Button>
            )}

            <Button
              onClick={handleViewCard}
              disabled={isDelisting || isPurchasing}
              className="w-full bg-transparent border-4 border-pikavault-cyan hover:bg-pikavault-cyan/10 text-white text-lg font-bold py-6 rounded-none disabled:opacity-50"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              VIEW CARD
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
