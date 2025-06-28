"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { Eye } from "lucide-react"

interface CardDisplayProps {
  card: any
  currentView: "front" | "back" | "holo"
  onViewChange: (view: "front" | "back" | "holo") => void
  onInspectionOpen: () => void
  onSound: (soundType: "hover" | "click" | "success") => void
}

export function CardDisplay({ card, currentView, onViewChange, onInspectionOpen, onSound }: CardDisplayProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

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

  const rarityColor = getRarityColor(card.rarity)

  // Card entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.set(cardRef.current, {
        x: -200,
        rotationY: -45,
        opacity: 0,
      })

      gsap.to(cardRef.current, {
        x: 0,
        rotationY: 12,
        opacity: 1,
        duration: 1.5,
        ease: "cubic-bezier(0.23, 1, 0.320, 1)",
        delay: 0.3,
      })
    }
  }, [])

  // Magnetic zoom functionality
  useEffect(() => {
    if (!containerRef.current || !cardRef.current) return

    const container = containerRef.current
    const card = cardRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      setMousePosition({ x, y })

      // Calculate distance from center
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))
      const proximity = 1 - Math.min(distance / maxDistance, 1)

      // Magnetic zoom effect
      const scale = 1 + proximity * 0.4 // Scale from 1.0x to 1.4x
      const rotationX = (y - centerY) / 20
      const rotationY = 12 + (x - centerX) / 20

      gsap.to(card, {
        scale,
        rotationX: -rotationX,
        rotationY,
        duration: 0.3,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      gsap.to(card, {
        scale: 1,
        rotationX: 0,
        rotationY: 12,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
      onSound("hover")
    }

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [onSound])

  // Get current image URL
  const getCurrentImageUrl = () => {
    switch (currentView) {
      case "back":
        return card.backImageUrl
      case "holo":
        return card.holographicImageUrl
      default:
        return card.imageUrl
    }
  }

  return (
    <div className="relative h-screen flex items-center justify-center">
      {/* Dramatic lighting effects */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: rarityColor }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-2xl"
          style={{ backgroundColor: rarityColor }}
        ></div>
      </div>

      {/* Card container */}
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center cursor-none">
        <div
          ref={cardRef}
          className="relative w-[400px] h-[560px] cursor-pointer"
          onClick={() => {
            onInspectionOpen()
            onSound("click")
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          {/* Card shadow */}
          <div
            className="absolute inset-0 bg-black/50 blur-xl transform translate-y-8 translate-x-4"
            style={{ zIndex: -1 }}
          ></div>

          {/* Main card */}
          <div
            className="relative w-full h-full border-4 overflow-hidden"
            style={{
              borderColor: rarityColor,
              boxShadow: `0 0 50px ${rarityColor}40`,
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center transition-all duration-500"
              style={{
                backgroundImage: `url(${getCurrentImageUrl()})`,
              }}
            >
              {/* Holographic effect for rare cards */}
              {card.rarity === "legendary" && currentView === "holo" && isHovered && (
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${rarityColor}80 0%, transparent 50%)`,
                  }}
                ></div>
              )}

              {/* Condition indicators */}
              <div className="absolute top-4 left-4">
                <div
                  className="w-8 h-8 border-2"
                  style={{
                    borderColor: rarityColor,
                    backgroundColor: `${rarityColor}20`,
                  }}
                ></div>
              </div>

              <div className="absolute top-4 right-4">
                <div
                  className="w-8 h-8 border-2"
                  style={{
                    borderColor: rarityColor,
                    backgroundColor: `${rarityColor}20`,
                  }}
                ></div>
              </div>

              {/* Authentication badge */}
              {card.authenticated && (
                <div className="absolute bottom-4 right-4">
                  <div
                    className="px-3 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: rarityColor,
                      color: "#0A0A0A",
                      fontFamily: "'Monument Extended', sans-serif",
                    }}
                  >
                    AUTHENTICATED
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4">
          <button
            onClick={() => {
              onViewChange("front")
              onSound("click")
            }}
            className={`px-4 py-2 border-2 transition-all duration-300 ${
              currentView === "front"
                ? `bg-[${rarityColor}] border-pikavault-cyan text-pikavault-cyan`
                : "bg-transparent border-white/30 text-white hover:border-white/60"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            FRONT
          </button>

          <button
            onClick={() => {
              onViewChange("back")
              onSound("click")
            }}
            className={`px-4 py-2 border-2 transition-all duration-300 ${
              currentView === "back"
                ? `bg-[${rarityColor}] border-pikavault-yellow text-pikavault-yellow`
                : "bg-transparent border-white/30 text-white hover:border-white/60"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            BACK
          </button>

          {card.rarity === "legendary" && (
            <button
              onClick={() => {
                onViewChange("holo")
                onSound("click")
              }}
              className={`px-4 py-2 border-2 transition-all duration-300 ${
                currentView === "holo"
                  ? `bg-[${rarityColor}] border-[${rarityColor}] text-pikavault-dark`
                  : "bg-transparent border-white/30 text-white hover:border-white/60"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              HOLO
            </button>
          )}
        </div>

        {/* Inspection hint */}
        <div className="absolute top-8 right-8 flex items-center space-x-2 text-white/50">
          <Eye className="w-5 h-5" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Click to inspect</span>
        </div>
      </div>
    </div>
  )
}
