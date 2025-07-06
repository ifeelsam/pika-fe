"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface PikaCardProps {
  id: string
  name: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "ultra rare" | "legendary"
  imageUrl?: string
  set?: string
  number?: string
  price?: number
  image?: string
}

export function PikaCard({ id, name, rarity, imageUrl, image, set, number, price }: PikaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Rarity-based styling
  const rarityStyles = {
    common: {
      borderColor: "#FFFFFF",
      glowColor: "rgba(255, 255, 255, 0.3)",
      badgeColor: "bg-white text-black",
    },
    uncommon: {
      borderColor: "#00FF88",
      glowColor: "rgba(0, 255, 136, 0.4)",
      badgeColor: "bg-[#00FF88] text-black",
    },
    rare: {
      borderColor: "#00F5FF",
      glowColor: "rgba(0, 245, 255, 0.4)",
      badgeColor: "bg-pikavault-cyan text-black",
    },
    epic: {
      borderColor: "#FF2D55",
      glowColor: "rgba(255, 45, 85, 0.5)",
      badgeColor: "bg-pikavault-pink text-white",
    },
    "ultra rare": {
      borderColor: "#FF6B35",
      glowColor: "rgba(255, 107, 53, 0.6)",
      badgeColor: "bg-[#FF6B35] text-white",
    },
    legendary: {
      borderColor: "#F6FF00",
      glowColor: "rgba(246, 255, 0, 0.6)",
      badgeColor: "bg-pikavault-yellow text-black",
    },
  }

  // Add fallback for unsupported rarities
  const currentStyle = rarityStyles[rarity as keyof typeof rarityStyles] || rarityStyles.common

  // Magnetic effect
  useEffect(() => {
    if (!cardRef.current) return

    const card = cardRef.current

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const moveX = (x - centerX) / 15
      const moveY = (y - centerY) / 15

      gsap.to(card, {
        rotationY: moveX,
        rotationX: -moveY,
        transformPerspective: 1000,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isHovered])

  // Use imageUrl or image prop (for backward compatibility)
  const cardImage = imageUrl || image || "/placeholder.svg?height=400&width=300"

  return (
    <motion.div
      ref={cardRef}
      className="relative w-full max-w-[320px] aspect-[3/4] cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0 rounded-none bg-pikavault-dark border-4 transition-all duration-300 overflow-hidden transform-gpu"
        style={{
          borderColor: currentStyle.borderColor,
          boxShadow: isHovered ? `0 0 30px ${currentStyle.glowColor}` : "none",
        }}
      >
        <div className="relative w-full h-full overflow-hidden">
          {/* Card image */}
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500"
            style={{
              backgroundImage: `url(${cardImage})`,
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pikavault-dark/90"></div>

          {/* Card content */}
          <div className="absolute bottom-0 left-0 w-full p-4">
            <div className="flex justify-between items-end">
              <h3
                className="text-xl font-black tracking-tight font-monument"
              >
                {name}
              </h3>
              <Badge className={`${currentStyle.badgeColor} rounded-none uppercase text-xs font-bold`}>{rarity}</Badge>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <p className="text-white/70 text-sm font-space-grotesk">
                #{id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card back shadow for 3D effect */}
      <div
        className="absolute inset-0 bg-pikavault-dark border-4 border-pikavault-dark -z-10 transition-all duration-300"
        style={{
          transform: isHovered ? "translate(8px, 8px)" : "translate(4px, 4px)",
        }}
      ></div>
    </motion.div>
  )
}
