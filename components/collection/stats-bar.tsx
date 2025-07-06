"use client"

import { useRef, useEffect, useState } from "react"
import { useCollection } from "./collection-context"
import { gsap } from "gsap"
import { TrendingUp, TrendingDown, Zap, Crown, BarChart3 } from "lucide-react"

export function StatsBar() {
  const { cards } = useCollection()
  const statsRef = useRef<HTMLDivElement>(null)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)

  // Calculate stats
  const totalCards = cards.length
  const highestValueCard = cards.reduce((highest, card) => (card.value > highest.value ? card : highest), cards[0])
  const avgPriceChange = cards.reduce((sum, card) => sum + card.priceChange, 0) / totalCards

  // Calculate rarity distribution
  const rarityCount = {
    common: cards.filter((card) => card.rarity === "common").length,
    rare: cards.filter((card) => card.rarity === "rare").length,
    epic: cards.filter((card) => card.rarity === "epic").length,
    legendary: cards.filter((card) => card.rarity === "legendary").length,
  }

  const totalValue = cards.reduce((sum, card) => sum + card.value, 0)
  console.log("ttoat", totalCards)
  // Stats animation
  useEffect(() => {
    if (statsRef.current) {
      const statCards = statsRef.current.querySelectorAll(".stat-card")

      gsap.set(statCards, {
        y: 100,
        opacity: 0,
        rotateX: -15,
      })

      gsap.to(statCards, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      })

      // Animate numbers
      statCards.forEach((card) => {
        const numberElement = card.querySelector(".stat-number")
        if (numberElement) {
          const finalValue = numberElement.textContent
          numberElement.textContent = "0"

          gsap.to(numberElement, {
            textContent: finalValue,
            duration: 1.5,
            delay: 0.8,
            snap: { textContent: 1 },
            ease: "power2.out",
          })
        }
      })
    }
  }, [])

  // Rarity colors
  const rarityColors = {
    common: "#FFFFFF",
    rare: "#00F5FF",
    epic: "#FF2D55",
    legendary: "#F6FF00",
  }

  return (
    <div className="mb-16">
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cards */}
        <div
          className="stat-card relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat("total")}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div
            className={`
            relative bg-pikavault-dark border-4 p-6 h-full
            transition-all duration-300 transform
            ${hoveredStat === "total" ? "scale-105 border-pikavault-yellow" : "border-white/30"}
          `}
          >
            {/* Icon */}
            <div className="absolute top-4 right-4">
              <Zap
                className={`w-8 h-8 transition-colors duration-300 ${
                  hoveredStat === "total" ? "text-pikavault-yellow" : "text-white/20"
                }`}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p
                className="text-white/70 text-sm uppercase tracking-wider"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Total Cards
              </p>
              <p
                className="stat-number text-5xl font-black text-white font-monument"
              >
                {totalCards}
              </p>
              <div className="h-1 w-full bg-white/10">
                <div
                  className="h-full bg-pikavault-yellow transition-all duration-500"
                  style={{ width: hoveredStat === "total" ? "100%" : "60%" }}
                ></div>
              </div>
            </div>

            {/* Hover effect */}
            <div
              className={`
              absolute inset-0 border-4 border-pikavault-yellow -z-10
              transition-all duration-300
              ${hoveredStat === "total" ? "translate-x-2 translate-y-2" : "translate-x-0 translate-y-0"}
            `}
            ></div>
          </div>
        </div>

        {/* Portfolio Value */}
        <div
          className="stat-card relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat("value")}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div
            className={`
            relative bg-pikavault-dark border-4 p-6 h-full
            transition-all duration-300 transform
            ${hoveredStat === "value" ? "scale-105 border-pikavault-pink" : "border-white/30"}
          `}
          >
            {/* Icon */}
            <div className="absolute top-4 right-4">
              <Crown
                className={`w-8 h-8 transition-colors duration-300 ${
                  hoveredStat === "value" ? "text-pikavault-pink" : "text-white/20"
                }`}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p
                className="text-white/70 text-sm uppercase tracking-wider"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Portfolio Value
              </p>
              <p
                className="text-5xl font-black text-pikavault-pink font-monument"
              >
                ${totalValue.toLocaleString()}
              </p>
              <p className="text-white/50 text-xs font-space-grotesk">
                Highest: {highestValueCard.name} (${highestValueCard.value})
              </p>
            </div>

            {/* Hover effect */}
            <div
              className={`
              absolute inset-0 border-4 border-pikavault-pink -z-10
              transition-all duration-300
              ${hoveredStat === "value" ? "translate-x-2 translate-y-2" : "translate-x-0 translate-y-0"}
            `}
            ></div>
          </div>
        </div>

        {/* 7D Growth */}
        <div
          className="stat-card relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat("growth")}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div
            className={`
            relative bg-pikavault-dark border-4 p-6 h-full
            transition-all duration-300 transform
            ${hoveredStat === "growth" ? "scale-105 border-pikavault-cyan" : "border-white/30"}
          `}
          >
            {/* Icon */}
            <div className="absolute top-4 right-4">
              {avgPriceChange >= 0 ? (
                <TrendingUp
                  className={`w-8 h-8 transition-colors duration-300 ${
                    hoveredStat === "growth" ? "text-pikavault-cyan" : "text-white/20"
                  }`}
                />
              ) : (
                <TrendingDown
                  className={`w-8 h-8 transition-colors duration-300 ${
                    hoveredStat === "growth" ? "text-pikavault-pink" : "text-white/20"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p
                className="text-white/70 text-sm uppercase tracking-wider"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                7D Growth
              </p>
              <p
                className={`text-5xl font-black ${avgPriceChange >= 0 ? "text-pikavault-cyan" : "text-pikavault-pink"}`}
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {avgPriceChange >= 0 ? "+" : ""}
                {avgPriceChange.toFixed(1)}%
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 w-full transition-all duration-300 ${
                      avgPriceChange >= 0 ? "bg-pikavault-cyan" : "bg-pikavault-pink"
                    }`}
                    style={{
                      opacity: hoveredStat === "growth" ? 1 : 0.3 + i * 0.15,
                      transform: `scaleY(${0.4 + i * 0.15})`,
                      transformOrigin: "bottom",
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Hover effect */}
            <div
              className={`
              absolute inset-0 border-4 border-pikavault-cyan -z-10
              transition-all duration-300
              ${hoveredStat === "growth" ? "translate-x-2 translate-y-2" : "translate-x-0 translate-y-0"}
            `}
            ></div>
          </div>
        </div>

        {/* Rarity Distribution */}
        <div
          className="stat-card relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat("rarity")}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div
            className={`
            relative bg-pikavault-dark border-4 p-6 h-full
            transition-all duration-300 transform
            ${hoveredStat === "rarity" ? "scale-105 border-pikavault-yellow" : "border-white/30"}
          `}
          >
            {/* Icon */}
            <div className="absolute top-4 right-4">
              <BarChart3
                className={`w-8 h-8 transition-colors duration-300 ${
                  hoveredStat === "rarity" ? "text-pikavault-yellow" : "text-white/20"
                }`}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p
                className="text-white/70 text-sm uppercase tracking-wider"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Rarity Mix
              </p>

              {/* Rarity bars */}
              <div className="space-y-2">
                {Object.entries(rarityCount).map(([rarity, count]) => (
                  <div key={rarity} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3"
                      style={{ backgroundColor: rarityColors[rarity as keyof typeof rarityColors] }}
                    ></div>
                    <div className="flex-1 h-6 bg-white/10 relative overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          backgroundColor: rarityColors[rarity as keyof typeof rarityColors],
                          width: `${(count / totalCards) * 100}%`,
                          opacity: hoveredStat === "rarity" ? 1 : 0.7,
                        }}
                      ></div>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/70">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover effect */}
            <div
              className={`
              absolute inset-0 border-4 border-pikavault-yellow -z-10
              transition-all duration-300
              ${hoveredStat === "rarity" ? "translate-x-2 translate-y-2" : "translate-x-0 translate-y-0"}
            `}
            ></div>
          </div>
        </div>
      </div>

      {/* Summary text */}
      <div className="mt-8 text-center">
        <p className="text-white/50 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Your collection is {avgPriceChange >= 0 ? "performing well" : "experiencing a dip"} •{" "}
          {((rarityCount.legendary / totalCards) * 100).toFixed(0)}% legendary cards
        </p>
      </div>
    </div>
  )
}
