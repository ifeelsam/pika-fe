"use client"

import { useRef, useEffect, useState } from "react"
import { useMarketplace } from "./marketplace-context"
import { gsap } from "gsap"
import { Check } from "lucide-react"

interface CardGridProps {
  selectedCards: string[]
  setSelectedCards: (cards: string[]) => void
}

export function CardGrid({ selectedCards, setSelectedCards }: CardGridProps) {
  const { filteredCards, isLoading, error } = useMarketplace()
  const gridRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isAnimated, setIsAnimated] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Handle image load errors
  const handleImageError = (cardId: string) => {
    setFailedImages(prev => new Set(prev).add(cardId))
  }

  // Get image URL with fallback
  const getImageUrl = (card: any) => {
    if (failedImages.has(card.id)) {
      return `/placeholder-${(parseInt(card.id.slice(-1), 16) % 5) + 1}.png`
    }
    return card.imageUrl
  }

  useEffect(() => {
    if (gridRef.current && !isLoading && filteredCards.length > 0) {
      // Reset animation state
      setIsAnimated(false)
      
      // Set initial state - hidden
      gsap.set(gridRef.current.children, {
        y: 100,
        opacity: 0,
      })

      // Animate cards into view
      gsap.to(gridRef.current.children, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
        delay: 0.7,
        onComplete: () => {
          setIsAnimated(true)
        },
      })
    }
  }, [isLoading, filteredCards])

  // Toggle card selection
  const toggleCardSelection = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId))
    } else {
      setSelectedCards([...selectedCards, cardId])
    }
  }

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "#F6FF00"
      case "epic":
        return "#FF2D55"
      case "rare":
        return "#00F5FF"
      default:
        return "#FFFFFF"
    }
  }

  // Get rarity shape
  const getRarityShape = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" // Diamond
      case "epic":
        return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" // Square
      case "rare":
        return "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" // Pentagon
      default:
        return "circle(50% at 50% 50%)" // Circle
    }
  }

  // Show loading state - return null to let page-level loading handle it
  if (isLoading) {
    return null
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-400 text-lg mb-4 font-space-grotesk">
          Error loading marketplace
        </div>
        <div className="text-white/70 text-sm font-space-grotesk">
          {error}
        </div>
      </div>
    )
  }

  // Show empty state
  if (filteredCards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-white/70 text-lg mb-2 font-space-grotesk">
          No NFTs found
        </div>
        <div className="text-white/50 text-sm font-space-grotesk">
          Try adjusting your filters or check back later
        </div>
      </div>
    )
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filteredCards.map((card, index) => {
        const isSelected = selectedCards.includes(card.id)
        const isHovered = hoveredCard === card.id
        const rarityColor = getRarityColor(card.rarity)
        const rarityShape = getRarityShape(card.rarity)

        // Calculate grid disruption
        const offsetX = index % 3 === 0 ? "-10px" : index % 3 === 1 ? "10px" : "0px"
        const offsetY = index % 2 === 0 ? "-15px" : "15px"

        return (
          <div
            key={card.id}
            className="relative"
            style={{
              transform: `translateX(${offsetX}) translateY(${offsetY})`,
              // Only apply opacity after GSAP animation is complete
              opacity: isAnimated ? 1 : 0,
            }}
          >
            <div
              className={`
                relative cursor-pointer group
                ${isSelected ? "z-10" : "z-0"}
              `}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => toggleCardSelection(card.id)}
              style={{
                transform: `rotate(${card.rotation}deg)`,
                transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
            >
              {/* Card container */}
              <div
                className={`
                  relative bg-pikavault-dark border-4 overflow-hidden transform-gpu
                  transition-all duration-300
                  ${
                    isSelected
                      ? `border-[${rarityColor}] scale-110 z-10`
                      : "border-white/30 group-hover:border-white/70"
                  }
                  ${isHovered && !isSelected ? "scale-105" : ""}
                `}
                style={{
                  boxShadow:
                    isSelected || isHovered
                      ? `15px 15px 30px 0px ${rarityColor}30`
                      : "15px 15px 0px 0px rgba(10,10,10,1)",
                }}
              >
                {/* Card image */}
                <div
                  className="w-full aspect-[3/4] bg-cover bg-center"
                  style={{ backgroundImage: `url(${getImageUrl(card)})` }}
                >
                  {/* Hidden img element for error handling */}
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    style={{ display: 'none' }}
                    onError={() => handleImageError(card.id)}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pikavault-dark/90"></div>

                  {/* Selection checkbox */}
                  <div
                    className={`
                      absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                      transition-all duration-300
                      ${
                        isSelected
                          ? `bg-[${rarityColor}] border-[${rarityColor}]`
                          : "bg-pikavault-dark/70 border-white/30 opacity-0 group-hover:opacity-100"
                      }
                      border-2
                    `}
                    style={{ clipPath: rarityShape }}
                  >
                    {isSelected && <Check className="w-5 h-5 text-pikavault-dark" />}
                  </div>

                  {/* Rarity indicator */}
                  <div
                    className="absolute top-3 left-3 w-6 h-6"
                    style={{
                      backgroundColor: rarityColor,
                      clipPath: rarityShape,
                    }}
                  ></div>

                  {/* Status badge */}
                  {card.status !== "active" && (
                    <div className="absolute top-3 left-12 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {card.status.toUpperCase()}
                    </div>
                  )}

                  {/* Card content */}
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3
                      className="text-white text-xl font-bold leading-relaxed mb-1 font-space-grotesk"
                    >
                      {card.name}
                    </h3>

                    <div className="flex justify-between items-center">
                      <p className="text-white/70 text-sm font-space-grotesk">
                        #{card.id} • {card.ownerAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price tag */}
                <div
                  className="absolute -top-2 -right-2 bg-pikavault-dark border-4 border-white px-3 py-1 transform rotate-12 z-20"
                  style={{
                    borderColor: rarityColor,
                    boxShadow: `5px 5px 0px 0px rgba(10,10,10,1)`,
                  }}
                >
                  <p
                    className="text-white text-lg font-black tracking-tight font-monument"
                  >
                    {card.price.toFixed(2)} SOL
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
