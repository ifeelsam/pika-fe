"use client"

import { useRef, useEffect, useState } from "react"
import { X } from "lucide-react"
import { useMarketplace } from "./marketplace-context"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAnchorProgram } from "@/lib/anchor/client"
import { delistNFT, purchaseNFT, releaseEscrow, findMarketplacePDA, findEscrowPDA } from "@/lib/anchor/transactions"
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
  const [isReleasingEscrow, setIsReleasingEscrow] = useState(false)
  const [escrowError, setEscrowError] = useState<string | null>(null)

  // Get selected card details
  const selectedCardDetails = cards.filter((card) => selectedCards.includes(card.id))

  // Calculate total price
  const totalPrice = selectedCardDetails.reduce((sum, card) => sum + card.price, 0)

  // Check if current user owns any of the selected cards
  const userOwnedCards = selectedCardDetails.filter(card => 
    publicKey && card.ownerAddress === publicKey.toString()
  )
  const isUserOwned = userOwnedCards.length > 0

  // Check if any of the user's cards are in "sold" status (awaiting escrow release)
  const soldUserCards = selectedCardDetails.filter(card =>
    publicKey && 
    card.ownerAddress === publicKey.toString() && 
    card.status === "sold"
  )
  const hasSoldCards = soldUserCards.length > 0

  // Check if any of the selected cards are active and not owned by user (can be purchased)
  const purchasableCards = selectedCardDetails.filter(card =>
    card.status === "active" && 
    (!publicKey || card.ownerAddress !== publicKey.toString())
  )
  const canPurchase = purchasableCards.length > 0

  // Animation for panel
  useEffect(() => {
    if (isOpen) {
      setDelistError(null)
      setPurchaseError(null)
      setEscrowError(null)
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
      const card = userOwnedCards.find(c => c.status === "active") // Only delist active cards
      
      if (!card) {
        setDelistError("No active cards to delist")
        return
      }
      
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
    const userOwnedCard = selectedCardDetails.find(card => card.ownerAddress === publicKey.toString())
    if (userOwnedCard) {
      setPurchaseError("You cannot purchase your own card")
      return
    }

    setIsPurchasing(true)
    setPurchaseError(null)
    
    try {
      // handles one card at a time (could be extended for batch operations)
      const card = purchasableCards[0]
      
      if (!card) {
        setPurchaseError("No active cards available for purchase")
        return
      }
      
      // the marketplace PDA
      const [marketplace] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)
      console.log("marketplace", marketplace)
      await purchaseNFT(
        program,
        publicKey, // buyer
        marketplace,
        new PublicKey(card.listingPubkey),
        new PublicKey(card.nftMint),
        new PublicKey(card.ownerAddress) // seller
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

  // Handle release escrow functionality
  const handleReleaseEscrow = async () => {
    if (!program || !publicKey || soldUserCards.length === 0) {
      setEscrowError("Missing required data for escrow release")
      return
    }

    setIsReleasingEscrow(true)
    setEscrowError(null)
    
    try {
      // Handle one card at a time (could be extended for batch operations)
      const card = soldUserCards[0]
      
      // Get the marketplace PDA
      const [marketplace] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)
      
      // Get the escrow PDA
      const [escrow] = findEscrowPDA(new PublicKey(card.listingPubkey), program.programId)
      
      // Fetch escrow data to get buyer information
      let escrowData
      try {
        escrowData = await program.account.escrow.fetch(escrow)
      } catch (error) {
        throw new Error("Escrow not found or already released")
      }
      
      await releaseEscrow(
        program,
        publicKey, // seller
        escrowData.buyer, // buyer from escrow data
        marketplace,
        new PublicKey(card.listingPubkey),
        new PublicKey(card.nftMint),
        escrow
      )

      // Success feedback
      console.log("✅ Escrow released successfully!")
      
      // Refresh listings and close panel
      await refreshListings()
      onClose()
      
    } catch (error: any) {
      console.error("Error releasing escrow:", error)
      setEscrowError(error.message || "Failed to release escrow")
    } finally {
      setIsReleasingEscrow(false)
    }
  }

  // Handle view card functionality
  const handleViewCard = () => {
    if (selectedCardDetails.length > 0) {
      const card = selectedCardDetails[0]
      router.push(`/card/${card.nftMint}`)
    }
  }

  const getPanelTitle = () => {
    if (hasSoldCards) return "RELEASE ESCROW"
    if (isUserOwned) return "MANAGE"
    return "CHECKOUT"
  }

  return (
    <div
      ref={panelRef}
      className="fixed top-0 right-0 w-full sm:w-96 h-full bg-pikavault-dark border-l-4 border-pikavault-yellow z-50 transform translate-x-full"
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            {getPanelTitle()}
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
                  
                  {publicKey && card.ownerAddress === publicKey.toString() && (
                    <div className="flex flex-col gap-1">
                      <span className="text-pikavault-yellow text-xs font-bold">OWNED BY YOU</span>
                      {card.status === "sold" && (
                        <span className="text-pikavault-cyan text-xs font-bold">AWAITING ESCROW RELEASE</span>
                      )}
                    </div>
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
            {(delistError || purchaseError || escrowError) && (
              <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-3 text-center">
                <p className="text-pikavault-pink text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {delistError || purchaseError || escrowError}
                </p>
              </div>
            )}
            
            {hasSoldCards ? (
              // Show release escrow button for sold cards
              <Button
                onClick={handleReleaseEscrow}
                disabled={isReleasingEscrow || !publicKey}
                className="w-full bg-pikavault-cyan hover:bg-pikavault-cyan/90 text-pikavault-dark text-lg font-bold py-6 rounded-none disabled:opacity-50"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {isReleasingEscrow ? "RELEASING..." : !publicKey ? "CONNECT WALLET" : "RELEASE ESCROW"}
              </Button>
            ) : isUserOwned ? (
              // Show delist button for user-owned active cards
              <Button
                onClick={handleDelist}
                disabled={isDelisting}
                className="w-full bg-pikavault-pink hover:bg-pikavault-pink/90 text-white text-lg font-bold py-6 rounded-none disabled:opacity-50"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {isDelisting ? "DELISTING..." : "DELIST"}
              </Button>
            ) : canPurchase ? (
              // Show buy button for cards not owned by user
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || !publicKey}
                className="w-full bg-pikavault-yellow hover:bg-pikavault-yellow/90 text-pikavault-dark text-lg font-bold py-6 rounded-none disabled:opacity-50"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {isPurchasing ? "PURCHASING..." : !publicKey ? "CONNECT WALLET" : "BUY NOW"}
              </Button>
            ) : (
              // No available actions
              <div className="text-center text-white/50 py-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                No actions available for selected cards
              </div>
            )}

            <Button
              onClick={handleViewCard}
              disabled={isDelisting || isPurchasing || isReleasingEscrow}
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
