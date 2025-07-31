"use client"

import { useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { useMarketplace } from "./marketplace-context"
import { gsap } from "gsap"

export function MarketplaceHeader() {
  const { searchQuery, setSearchQuery } = useMarketplace()
  const headerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (headerRef.current && searchRef.current) {
      // Set initial state - hidden
      gsap.set(headerRef.current.querySelector("h1"), {
        y: 50,
        opacity: 0,
      })

      gsap.set(searchRef.current, {
        x: 100,
        opacity: 0,
      })

      // Animate elements into view
      gsap.to(headerRef.current.querySelector("h1"), {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      })

      gsap.to(searchRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
      })
    }
  }, [])

  return (
    <div ref={headerRef} className="mb-12">
      <h1
        className="text-[34px] sm:text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight font-monument"
      >
        MARKET<span className="text-pikavault-yellow">PLACE</span>
      </h1>

      <div className="hidden xl:flex justify-end -mt-20 md:-mt-24 lg:-mt-32 mb-12 relative z-10">
        <div ref={searchRef} className="w-full max-w-md relative group">
          <div className="absolute inset-0 bg-pikavault-yellow/10 transform translate-x-2 translate-y-2 group-focus-within:translate-x-3 group-focus-within:translate-y-3 transition-transform duration-300"></div>
          <div className="relative flex items-center border-4 border-white/30 group-focus-within:border-pikavault-yellow bg-pikavault-dark transition-colors duration-300">
            <Search className="w-6 h-6 ml-4 text-white/50 group-focus-within:text-pikavault-yellow" />
            <input
              type="text"
              placeholder="SEARCH CARDS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent py-4 px-3 text-white outline-none placeholder:text-white/30 font-space-grotesk"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-2 mr-2 text-white/50 sm:hover:text-pikavault-yellow transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
