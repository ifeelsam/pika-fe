"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { Info } from "lucide-react"

interface VerificationProcessProps {
  cardData: {
    condition?: string
    conditionNotes?: string
    suggestedPrice?: number
    price?: number
    listingType?: string
    duration?: string
  }
  updateCardData: (data: Partial<VerificationProcessProps["cardData"]>) => void
  onSound: (soundType: "hover" | "click" | "success" | "error") => void
}

export function VerificationProcess({ cardData, updateCardData, onSound }: VerificationProcessProps) {
  const [marketData, setMarketData] = useState({
    avgPrice: 1250,
    minPrice: 950,
    maxPrice: 1580,
    lastSold: 1100,
    confidence: 85,
  })
  const [showPriceTooltip, setShowPriceTooltip] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Animation for panel
  useEffect(() => {
    if (panelRef.current) {
      gsap.from(panelRef.current.children, {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }, [])

  // Condition grades
  const conditionGrades = [
    { id: "MT", label: "MT", description: "Mint" },
    { id: "NM", label: "NM", description: "Near Mint" },
    { id: "EX", label: "EX", description: "Excellent" },
    { id: "VG", label: "VG", description: "Very Good" },
    { id: "G", label: "G", description: "Good" },
    { id: "HP", label: "HP", description: "Heavily Played" },
  ]

  // Listing durations
  const durations = [
    { id: "3d", label: "3 DAYS" },
    { id: "7d", label: "7 DAYS" },
    { id: "14d", label: "14 DAYS" },
    { id: "30d", label: "30 DAYS" },
  ]

  // Calculate price impact based on condition
  const getPriceImpact = (condition: string | undefined) => {
    switch (condition) {
      case "MT":
        return 1.2
      case "NM":
        return 1.0
      case "EX":
        return 0.8
      case "VG":
        return 0.6
      case "G":
        return 0.4
      case "HP":
        return 0.3
      default:
        return 1.0
    }
  }

  // Calculate suggested price
  useEffect(() => {
    if (cardData.condition) {
      const impact = getPriceImpact(cardData.condition)
      const suggestedPrice = Math.round(marketData.avgPrice * impact)
      updateCardData({ suggestedPrice })
    }
  }, [cardData.condition, marketData.avgPrice, updateCardData])

  return (
    <div ref={panelRef} className="space-y-8">
      {/* Condition assessment */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          CONDITION
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {conditionGrades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => {
                updateCardData({ condition: grade.id })
                onSound("click")
              }}
              className={`p-4 border-4 transition-all duration-300 ${
                cardData.condition === grade.id
                  ? "border-pikavault-yellow bg-pikavault-yellow/10"
                  : "border-white/30 hover:border-white/60"
              }`}
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
              onMouseEnter={() => onSound("hover")}
            >
              <div className="text-2xl mb-1">{grade.label}</div>
              <div className="text-xs text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {grade.description}
              </div>
            </button>
          ))}
        </div>

        <textarea
          value={cardData.conditionNotes}
          onChange={(e) => updateCardData({ conditionNotes: e.target.value })}
          placeholder="Add detailed condition notes (optional)..."
          className="w-full bg-pikavault-dark border-4 border-white/30 focus:border-pikavault-yellow p-4 text-white outline-none transition-colors duration-300 min-h-[100px]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        ></textarea>

        {cardData.condition && (
          <div className="bg-pikavault-dark border-l-4 border-pikavault-cyan p-4">
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Condition impact on price:{" "}
              <span className="font-bold">
                {cardData.condition === "MT"
                  ? "+20%"
                  : cardData.condition === "NM"
                    ? "0%"
                    : cardData.condition === "EX"
                      ? "-20%"
                      : cardData.condition === "VG"
                        ? "-40%"
                        : cardData.condition === "G"
                          ? "-60%"
                          : "-70%"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            PRICING
          </h3>
          <button
            onMouseEnter={() => {
              setShowPriceTooltip(true)
              onSound("hover")
            }}
            onMouseLeave={() => setShowPriceTooltip(false)}
            className="text-white/70 hover:text-white"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {showPriceTooltip && (
          <div className="bg-pikavault-dark border-4 border-pikavault-yellow p-4 relative">
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Our AI analyzes recent sales data to suggest an optimal price for your card based on its condition,
              rarity, and current market trends.
            </p>
          </div>
        )}

        <div className="bg-white/5 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Market Average</span>
            <span className="text-2xl font-black" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
              ${marketData.avgPrice}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Price Range</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ${marketData.minPrice} - ${marketData.maxPrice}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Last Sold</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>${marketData.lastSold}</span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Suggested Price</span>
            <span
              className="text-3xl font-black text-pikavault-yellow"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              ${cardData.suggestedPrice}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Confidence</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-3 bg-white/20">
                <div className="h-full bg-pikavault-cyan" style={{ width: `${marketData.confidence}%` }}></div>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{marketData.confidence}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your Price (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl">$</span>
            <input
              type="number"
              value={cardData.price || ""}
              onChange={(e) => updateCardData({ price: Number.parseFloat(e.target.value) || 0 })}
              placeholder={cardData.suggestedPrice?.toString()}
              className="w-full bg-pikavault-dark border-4 border-white/30 focus:border-pikavault-yellow p-4 pl-10 text-white outline-none transition-colors duration-300 text-xl"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            />
          </div>
        </div>
      </div>

      {/* Listing type */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          LISTING TYPE
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              updateCardData({ listingType: "fixed" })
              onSound("click")
            }}
            className={`p-4 border-4 transition-all duration-300 ${
              cardData.listingType === "fixed"
                ? "border-pikavault-yellow bg-pikavault-yellow/10"
                : "border-white/30 hover:border-white/60"
            }`}
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
            onMouseEnter={() => onSound("hover")}
          >
            FIXED PRICE
          </button>
          <button
            onClick={() => {
              updateCardData({ listingType: "auction" })
              onSound("click")
            }}
            className={`p-4 border-4 transition-all duration-300 ${
              cardData.listingType === "auction"
                ? "border-pikavault-yellow bg-pikavault-yellow/10"
                : "border-white/30 hover:border-white/60"
            }`}
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
            onMouseEnter={() => onSound("hover")}
          >
            AUCTION
          </button>
        </div>
      </div>

      {/* Listing duration */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          DURATION
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {durations.map((duration) => (
            <button
              key={duration.id}
              onClick={() => {
                updateCardData({ duration: duration.id })
                onSound("click")
              }}
              className={`p-3 border-2 transition-all duration-300 ${
                cardData.duration === duration.id
                  ? "border-pikavault-cyan bg-pikavault-cyan/10"
                  : "border-white/30 hover:border-white/60"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              onMouseEnter={() => onSound("hover")}
            >
              {duration.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fee calculation */}
      <div className="bg-white/5 p-6 space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          FEE CALCULATION
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Listing Price</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ${cardData.price || cardData.suggestedPrice}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Platform Fee (5%)</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              -${((cardData.price || cardData.suggestedPrice || 0) * 0.05).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Transaction Fee (2.5%)</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              -${((cardData.price || cardData.suggestedPrice || 0) * 0.025).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-white/20 pt-2 flex justify-between items-center">
            <span className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              You Receive
            </span>
            <span
              className="text-xl font-black text-pikavault-cyan"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              ${((cardData.price || cardData.suggestedPrice || 0) * 0.925).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
