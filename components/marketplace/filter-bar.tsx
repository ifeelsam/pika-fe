"use client"

import { useRef, useEffect, useState } from "react"
import { X } from "lucide-react"
import { useMarketplace } from "./marketplace-context"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function FilterBar() {
  const { filters, toggleFilter, resetFilters, filteredCards } = useMarketplace()
  const filterBarRef = useRef<HTMLDivElement>(null)
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (filterBarRef.current) {
        // Set initial state - hidden
        gsap.set(filterBarRef.current, {
          y: 50,
          opacity: 0,
        })

        // Animate filter bar into view
        gsap.to(filterBarRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.5,
          ease: "power3.out",
          onComplete: () => {
            setIsAnimated(true)
          },
        })
      }
    }
  }, [])

  // Check if any filters are active
  const hasActiveFilters = filters.some((filter) => filter.options.some((option) => option.active))

  return (
    <div ref={filterBarRef} className="mb-12" style={{ opacity: isAnimated ? 1 : 0 }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-monument">
          FILTERS
        </h2>

        <div className="flex items-center space-x-4">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 text-white/70 sm:hover:text-pikavault-yellow transition-colors group"
            >
              <X className="w-5 h-5 group-sm:hover:scale-125 transition-transform" />
              <span className="font-space-grotesk">RESET</span>
            </button>
          )}

          <p className="text-white/70 font-space-grotesk">
            {filteredCards.length} CARDS
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex space-x-6 min-w-max">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-3">
              <h3 className="text-white/70 text-sm font-space-grotesk">
                {filter.label}
              </h3>

              <div className="flex space-x-3">
                {filter.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleFilter(filter.id, option.id)}
                    className={`
                      px-4 py-3 border-4 transition-all duration-300 font-space-grotesk
                      ${
                        option.active
                          ? "border-pikavault-yellow bg-pikavault-yellow/10 scale-105"
                          : "border-white/20 sm:hover:border-white/40"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
