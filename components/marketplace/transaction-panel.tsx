"use client"

import { useRef, useEffect } from "react"
import { X } from "lucide-react"
import { useMarketplace } from "./marketplace-context"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"

interface TransactionPanelProps {
  isOpen: boolean
  selectedCards: string[]
  onClose: () => void
}

export function TransactionPanel({ isOpen, selectedCards, onClose }: TransactionPanelProps) {
  const { cards } = useMarketplace()
  const panelRef = useRef<HTMLDivElement>(null)

  // Get selected card details
  const selectedCardDetails = cards.filter((card) => selectedCards.includes(card.id))

  // Calculate total price
  const totalPrice = selectedCardDetails.reduce((sum, card) => sum + card.price, 0)

  // Animation for panel
  useEffect(() => {
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
  }, [isOpen])

  return (
    <div
      ref={panelRef}
      className="fixed top-0 right-0 w-full sm:w-96 h-full bg-pikavault-dark border-l-4 border-pikavault-yellow z-50 transform translate-x-full"
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            CHECKOUT
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
            <Button
              className="w-full bg-pikavault-yellow hover:bg-pikavault-yellow/90 text-pikavault-dark text-lg font-bold py-6 rounded-none"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              BUY NOW
            </Button>

            <Button
              className="w-full bg-transparent border-4 border-pikavault-pink hover:bg-pikavault-pink/10 text-white text-lg font-bold py-6 rounded-none"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              PLACE BID
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
