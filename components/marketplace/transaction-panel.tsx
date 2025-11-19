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

interface SellerOrder {
  listingPubkey: string
  buyerEmail?: string | null
  buyerTwitter?: string | null
  status: string
  createdAt: string
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
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerTwitter, setBuyerTwitter] = useState("")
  const [contactError, setContactError] = useState<string | null>(null)
  const [sellerOrders, setSellerOrders] = useState<Record<string, SellerOrder>>({})
  const [isFetchingOrders, setIsFetchingOrders] = useState(false)

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
      setContactError(null)
      setBuyerEmail("")
      setBuyerTwitter("")
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

  useEffect(() => {
    const fetchSellerOrders = async () => {
      if (!publicKey || !hasSoldCards) {
        setSellerOrders({})
        return
      }

      setIsFetchingOrders(true)
      try {
        const params = new URLSearchParams({ seller: publicKey.toString() })
        const response = await fetch(`/api/orders?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Unable to fetch orders")
        }

        const data = await response.json()
        const ordersMap: Record<string, SellerOrder> = {}
        if (Array.isArray(data.orders)) {
          data.orders.forEach((order: SellerOrder) => {
            ordersMap[order.listingPubkey] = order
          })
        }
        setSellerOrders(ordersMap)
      } catch (error) {
        console.error("Error fetching seller orders:", error)
      } finally {
        setIsFetchingOrders(false)
      }
    }

    fetchSellerOrders()
  }, [publicKey?.toString(), hasSoldCards])

  const validateContactInfo = () => {
    if (!buyerEmail.trim() && !buyerTwitter.trim()) {
      setContactError("Share at least one contact method so the seller can reach you.")
      return false
    }

    if (buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) {
      setContactError("Please enter a valid email address.")
      return false
    }

    if (buyerTwitter && !/^@?[A-Za-z0-9_]{1,15}$/.test(buyerTwitter.trim())) {
      setContactError("Twitter handles can only contain letters, numbers, or underscores.")
      return false
    }

    setContactError(null)
    return true
  }

  const persistOrderDetails = async (card: BaseCardData, buyerWallet: string) => {
    const normalizedTwitter =
      buyerTwitter.trim() === "" ? "" : buyerTwitter.trim().replace(/^@/, "")

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingPubkey: card.listingPubkey,
        nftMint: card.nftMint,
        cardId: card.id,
        price: card.price,
        buyerWallet,
        sellerWallet: card.ownerAddress,
        buyerEmail: buyerEmail.trim(),
        buyerTwitter: normalizedTwitter,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || "Failed to save buyer contact details.")
    }
  }

  const markOrderAsReleased = async (listingPubkey: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingPubkey,
          status: "ESCROW_RELEASED",
        }),
      })

      setSellerOrders((previous) => {
        if (!previous[listingPubkey]) return previous
        return {
          ...previous,
          [listingPubkey]: {
            ...previous[listingPubkey],
            status: "ESCROW_RELEASED",
          },
        }
      })
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

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

    if (!validateContactInfo()) {
      return
    }

    setIsPurchasing(true)
    setPurchaseError(null)
    setContactError(null)
    
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

      await persistOrderDetails(card, publicKey.toString())

      setBuyerEmail("")
      setBuyerTwitter("")

      // Success feedback
      console.log("✅ NFT purchased successfully!")
      
      // Refresh listings and close panel
      await refreshListings()
      onClose()
      
    } catch (error: any) {
      console.error("Error purchasing NFT:", error)
      if (error?.message?.toLowerCase().includes("contact")) {
        setContactError(error.message)
      } else {
        setPurchaseError(error.message || "Failed to purchase NFT")
      }
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

      await markOrderAsReleased(card.listingPubkey)

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
          <h2 className="text-2xl font-black font-monument">
            {getPanelTitle()}
          </h2>

          <button onClick={onClose} className="p-2 text-white/70 sm:hover:text-pikavault-yellow transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          {hasSoldCards && (
            <div className="mb-6 border-2 border-pikavault-cyan/70 bg-pikavault-cyan/10 px-4 py-3 text-white">
              <p className="text-sm font-monument tracking-wide">SHIPMENT ALERT</p>
              <p className="text-xs font-space-grotesk text-white/80">
                {isFetchingOrders
                  ? "Fetching buyer contact details..."
                  : "A collector purchased your card. Ship it and release escrow after delivery."}
              </p>
            </div>
          )}
          <h3 className="text-white/70 text-sm mb-4 font-space-grotesk">
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
                  <h4 className="text-white font-bold font-space-grotesk">
                    {card.name}
                  </h4>

                  <p className="text-white/70 text-sm font-space-grotesk">
                    #{card.id}
                  </p>
                  
                  {publicKey && card.ownerAddress === publicKey.toString() && (
                    <div className="flex flex-col gap-1">
                      <span className="text-pikavault-yellow text-xs font-bold">OWNED BY YOU</span>
                      {card.status === "sold" && (
                        <span className="text-pikavault-cyan text-xs font-bold">AWAITING ESCROW RELEASE</span>
                      )}
                      {card.status === "sold" && (
                        <div className="mt-2 text-xs text-white/80 font-space-grotesk">
                          <p className="uppercase tracking-wide text-white/60">Buyer contact</p>
                          {isFetchingOrders ? (
                            <p className="text-white/50">Loading details...</p>
                          ) : sellerOrders[card.listingPubkey] ? (
                            <>
                              {sellerOrders[card.listingPubkey].buyerEmail && (
                                <p className="text-white">Email: {sellerOrders[card.listingPubkey].buyerEmail}</p>
                              )}
                              {sellerOrders[card.listingPubkey].buyerTwitter && (
                                <p className="text-white">
                                  Twitter: @{sellerOrders[card.listingPubkey].buyerTwitter?.replace(/^@/, "")}
                                </p>
                              )}
                              {!sellerOrders[card.listingPubkey].buyerEmail &&
                                !sellerOrders[card.listingPubkey].buyerTwitter && (
                                  <p className="text-white/50">Buyer did not share contact</p>
                                )}
                            </>
                          ) : (
                            <p className="text-white/50">No contact details found yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-white font-black font-monument">
                  {card.price} SOL
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-white text-lg font-space-grotesk">
              TOTAL
            </p>

            <p className="text-pikavault-yellow text-2xl font-black font-monument">
              {totalPrice} SOL
            </p>
          </div>

          <div className="space-y-4">
            {(delistError || purchaseError || escrowError || contactError) && (
              <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-3 text-center">
                <p className="text-pikavault-pink text-sm font-space-grotesk">
                  {delistError || purchaseError || escrowError || contactError}
                </p>
              </div>
            )}

            {canPurchase && (
              <div className="space-y-3 border border-white/15 p-4">
                <p className="text-white/70 text-xs font-space-grotesk uppercase">
                  Share contact info so the seller can coordinate shipping
                </p>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-space-grotesk uppercase">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(event) => {
                      setBuyerEmail(event.target.value)
                      if (contactError) setContactError(null)
                    }}
                    placeholder="you@domain.com"
                    className="w-full bg-transparent border-2 border-white/20 focus:border-pikavault-yellow px-3 py-2 text-white font-space-grotesk placeholder:text-white/30 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-space-grotesk uppercase">
                    Twitter / X (optional)
                  </label>
                  <input
                    type="text"
                    value={buyerTwitter}
                    onChange={(event) => {
                      setBuyerTwitter(event.target.value)
                      if (contactError) setContactError(null)
                    }}
                    placeholder="@collector"
                    className="w-full bg-transparent border-2 border-white/20 focus:border-pikavault-yellow px-3 py-2 text-white font-space-grotesk placeholder:text-white/30 transition-colors"
                  />
                </div>

                <p className="text-white/50 text-xs font-space-grotesk">
                  Provide at least one channel. Details stay private and are only shared with the seller after escrow is created.
                </p>
              </div>
            )}
            
            {hasSoldCards ? (
              // Show release escrow button for sold cards
              <Button
                onClick={handleReleaseEscrow}
                disabled={isReleasingEscrow || !publicKey}
                className="w-full bg-pikavault-cyan sm:hover:bg-pikavault-cyan/90 text-pikavault-dark text-lg font-bold py-6 rounded-none disabled:opacity-50 font-monument"
              >
                {isReleasingEscrow ? "RELEASING..." : !publicKey ? "CONNECT WALLET" : "RELEASE ESCROW"}
              </Button>
            ) : isUserOwned ? (
              // Show delist button for user-owned active cards
              <Button
                onClick={handleDelist}
                disabled={isDelisting}
                className="w-full bg-pikavault-pink sm:hover:bg-pikavault-pink/90 text-white text-lg font-bold py-6 rounded-none disabled:opacity-50 font-monument"
              >
                {isDelisting ? "DELISTING..." : "DELIST"}
              </Button>
            ) : canPurchase ? (
              // Show buy button for cards not owned by user
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || !publicKey}
                className="w-full bg-pikavault-yellow sm:hover:bg-pikavault-yellow/90 text-pikavault-dark text-lg font-bold py-6 rounded-none disabled:opacity-50 font-monument"
              >
                {isPurchasing ? "PURCHASING..." : !publicKey ? "CONNECT WALLET" : "BUY NOW"}
              </Button>
            ) : (
              // No available actions
              <div className="text-center text-white/50 py-4 font-space-grotesk">
                No actions available for selected cards
              </div>
            )}

            <Button
              onClick={handleViewCard}
              disabled={isDelisting || isPurchasing || isReleasingEscrow}
              className="w-full bg-transparent border-4 border-pikavault-cyan sm:hover:bg-pikavault-cyan/10 text-white text-lg font-bold py-6 rounded-none disabled:opacity-50"
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
