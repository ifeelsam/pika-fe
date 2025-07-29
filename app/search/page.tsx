"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/background-effects"
import { PikaCard } from "@/components/pika-card"
import { Zap, Search, X, Filter, SortDesc } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { gsap } from "gsap"

// Hardcoded cards for search simulation
const DEMO_CARDS = [
  {
    id: "electric-surge-001",
    name: "ELECTRIC SURGE",
    set: "NEO THUNDER",
    number: "001/150",
    rarity: "legendary",
    price: 1250,
    image: "/electric-pokemon-card.png",
    tags: ["electric", "legendary", "holo"],
  },
  {
    id: "glitch-king-002",
    name: "GLITCH KING",
    set: "DIGITAL REALM",
    number: "025/200",
    rarity: "ultra rare",
    price: 2100,
    image: "/glitch-king-pokemon-card.png",
    tags: ["glitch", "ultra rare", "holo"],
  },
  {
    id: "binary-beast-003",
    name: "BINARY BEAST",
    set: "CYBER EVOLUTION",
    number: "042/180",
    rarity: "rare",
    price: 850,
    image: "/binary-beast-pokemon-card.png",
    tags: ["digital", "rare", "beast"],
  },
  {
    id: "neural-nexus-004",
    name: "NEURAL NEXUS",
    set: "MIND MATRIX",
    number: "078/150",
    rarity: "uncommon",
    price: 320,
    image: "/neural-nexus-pokemon-card.png",
    tags: ["psychic", "uncommon", "matrix"],
  },
  {
    id: "crypto-crush-005",
    name: "CRYPTO CRUSH",
    set: "DIGITAL REALM",
    number: "112/200",
    rarity: "rare",
    price: 780,
    image: "/crypto-crush-card.png",
    tags: ["digital", "rare", "crypto"],
  },
  {
    id: "pixel-storm-006",
    name: "PIXEL STORM",
    set: "RETRO WAVE",
    number: "064/120",
    rarity: "common",
    price: 150,
    image: "/pixel-art-pokemon-storm-card.png",
    tags: ["electric", "common", "pixel"],
  },
  {
    id: "quantum-leap-007",
    name: "QUANTUM LEAP",
    set: "FUTURE SIGHT",
    number: "033/160",
    rarity: "ultra rare",
    price: 1800,
    image: "/quantum-leap-pokemon-card.png",
    tags: ["psychic", "ultra rare", "quantum"],
  },
  {
    id: "static-shock-008",
    name: "STATIC SHOCK",
    set: "NEO THUNDER",
    number: "087/150",
    rarity: "rare",
    price: 650,
    image: "/static-electricity-card.png",
    tags: ["electric", "rare", "static"],
  },
  {
    id: "cyber-slash-009",
    name: "CYBER SLASH",
    set: "CYBER EVOLUTION",
    number: "054/180",
    rarity: "uncommon",
    price: 280,
    image: "/cyber-pokemon-card.png",
    tags: ["digital", "uncommon", "cyber"],
  },
  {
    id: "neon-blast-010",
    name: "NEON BLAST",
    set: "RETRO WAVE",
    number: "022/120",
    rarity: "rare",
    price: 720,
    image: "/neon-pokemon-card.png",
    tags: ["fire", "rare", "neon"],
  },
  {
    id: "digital-wave-011",
    name: "DIGITAL WAVE",
    set: "MIND MATRIX",
    number: "099/150",
    rarity: "common",
    price: 180,
    image: "/digital-wave-pokemon-card.png",
    tags: ["water", "common", "digital"],
  },
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(DEMO_CARDS)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "legendary cards",
    "electric type",
    "holo rare",
    "neo thunder",
  ])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // Page entrance animation
  useEffect(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      })
    }
  }, [])

  // Handle search
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = (query: string) => {
    setIsSearching(true)

    // Update URL with search query
    if (query) {
      const params = new URLSearchParams(searchParams)
      params.set("q", query)
      router.push(`/search?${params.toString()}`)

      // Add to recent searches if not already there
      if (!recentSearches.includes(query.toLowerCase()) && query.trim() !== "") {
        setRecentSearches((prev) => [query.toLowerCase(), ...prev.slice(0, 3)])
      }
    }

    // Simulate API call delay
    setTimeout(() => {
      // Filter cards based on search query
      const filtered = DEMO_CARDS.filter((card) => {
        const searchLower = query.toLowerCase()
        return (
          card.name.toLowerCase().includes(searchLower) ||
          card.set.toLowerCase().includes(searchLower) ||
          card.rarity.toLowerCase().includes(searchLower) ||
          card.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        )
      })

      // Apply active filter if any
      let results = filtered
      if (activeFilter) {
        results = results.filter(
          (card) =>
            card.rarity.toLowerCase() === activeFilter.toLowerCase() || card.tags.includes(activeFilter.toLowerCase()),
        )
      }

      // Apply sorting
      results = [...results].sort((a, b) => {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price
      })

      setSearchResults(results)
      setIsSearching(false)

      // Animate results
      if (resultsRef.current && results.length > 0) {
        gsap.fromTo(
          resultsRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" },
        )
      }
    }, 800)
  }

  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null)
    } else {
      setActiveFilter(filter)
    }

    // Re-run search with new filter
    handleSearch(searchQuery)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    // Re-run search with new sort order
    handleSearch(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setActiveFilter(null)
    setSearchResults(DEMO_CARDS)
    router.push("/search")
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Sound effects
  const playSound = (soundType: "hover" | "click" | "success" | "error") => {
    // In a real app, you would implement actual sound effects here
    // console.log(`Playing ${soundType} sound`)
  }

  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main ref={pageRef} className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="container mx-auto">
          <h1
            className="text-5xl md:text-7xl font-black mb-8 tracking-tight"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            SEARCH <span className="text-pikavault-cyan">THE VAULT</span>
          </h1>

          <p className="text-xl text-white/70 max-w-3xl mb-12" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Find rare and valuable Pokémon cards in our curated digital collection. Filter by rarity, type, or price
            range.
          </p>

          {/* Search bar */}
          <div className="relative mb-12">
            <div className="relative flex items-center">
              <div className="absolute left-6 text-white/50">
                <Search size={24} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                placeholder="Search by card name, set, rarity, or type..."
                className="w-full bg-white/5 border-4 border-white/20 py-5 pl-16 pr-12 text-xl focus:border-pikavault-cyan focus:outline-none transition-all duration-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
              {searchQuery && (
                <button
                  className="absolute right-20 text-white/50 sm:hover:text-white"
                  onClick={clearSearch}
                  onMouseEnter={() => playSound("hover")}
                >
                  <X size={24} />
                </button>
              )}
              <button
                onClick={() => handleSearch(searchQuery)}
                className="absolute right-6 text-white/70 sm:hover:text-pikavault-cyan transition-colors duration-300"
                onMouseEnter={() => playSound("hover")}
                onMouseDown={() => playSound("click")}
              >
                <Zap size={24} />
              </button>
            </div>

            {/* Recent searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-white/50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Recent:
                </span>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(search)
                      handleSearch(search)
                    }}
                    className="px-3 py-1 bg-white/10 sm:hover:bg-white/20 text-white/80 sm:hover:text-white transition-all duration-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={() => playSound("hover")}
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-white/70">
              <Filter size={20} />
              <span style={{ fontFamily: "'Monument Extended', sans-serif" }}>FILTERS:</span>
            </div>

            {["Legendary", "Ultra Rare", "Rare", "Uncommon", "Common", "Electric", "Digital"].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-4 py-2 transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-pikavault-cyan text-pikavault-dark font-bold"
                    : "bg-white/10 text-white/70 sm:hover:bg-white/20 sm:hover:text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                onMouseEnter={() => playSound("hover")}
              >
                {filter}
              </button>
            ))}

            <button
              onClick={toggleSortOrder}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 sm:hover:bg-white/20 sm:hover:text-white transition-all duration-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              onMouseEnter={() => playSound("hover")}
            >
              <SortDesc size={18} className={sortOrder === "asc" ? "rotate-180" : ""} />
              Price: {sortOrder === "desc" ? "High to Low" : "Low to High"}
            </button>
          </div>

          {/* Search results */}
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-t-pikavault-cyan border-r-pikavault-cyan/50 border-b-pikavault-cyan/30 border-l-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-xl text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Searching the vault...
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="mb-8 flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                  {searchQuery ? `RESULTS FOR "${searchQuery.toUpperCase()}"` : "ALL CARDS"}
                  <span className="ml-3 text-white/50">({searchResults.length})</span>
                </h2>
              </div>

              <div ref={resultsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((card) => (
                  <div key={card.id} className="transform transition-all duration-300 sm:hover:scale-[1.02]">
                    <PikaCard
                      id={card.id}
                      name={card.name}
                      rarity={card.rarity as any}
                      imageUrl={card.image}
                      set={card.set}
                      number={card.number}
                      price={card.price}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-4 border-white/10 bg-white/5">
              <div className="w-24 h-24 mb-6 text-white/30">
                <Search size={96} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                NO RESULTS FOUND
              </h3>
              <p
                className="text-xl text-white/50 text-center max-w-lg"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                We couldn't find any cards matching "{searchQuery}". Try different keywords or browse our collection.
              </p>
              <button
                onClick={clearSearch}
                className="mt-8 px-8 py-4 bg-pikavault-cyan text-pikavault-dark sm:hover:bg-pikavault-cyan/90 transition-all duration-300"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
                onMouseEnter={() => playSound("hover")}
              >
                CLEAR SEARCH
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
