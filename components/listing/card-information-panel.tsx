"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Check, Search, X, Star, Clock } from "lucide-react"

// Add a new interface for search results
interface CardSearchResult {
  id: string
  name: string
  set: string
  number: string
  rarity: string
  image: string
  year: number
}

// Update the CardInformationPanel component to include search results
interface CardInformationPanelProps {
  cardData: {
    name: string
    set: string
    number: string
    rarity: string
    language: string
    isGraded: boolean
    gradingCompany: string
    gradingScore: string
  }
  updateCardData: (data: Partial<CardInformationPanelProps["cardData"]>) => void
  onSound: (soundType: "hover" | "click" | "success" | "error") => void
}

// Add mock search results data after the component interface
const MOCK_SEARCH_RESULTS: CardSearchResult[] = [
  {
    id: "pikachu-001",
    name: "Pikachu",
    set: "BASE SET",
    number: "058/102",
    rarity: "common",
    image: "/pikachu-card.png",
    year: 1999,
  },
  {
    id: "charizard-004",
    name: "Charizard",
    set: "BASE SET",
    number: "004/102",
    rarity: "rare holo",
    image: "/charizard-card.png",
    year: 1999,
  },
  {
    id: "mewtwo-010",
    name: "Mewtwo",
    set: "BASE SET",
    number: "010/102",
    rarity: "rare holo",
    image: "/mewtwo-card.png",
    year: 1999,
  },
  {
    id: "bulbasaur-044",
    name: "Bulbasaur",
    set: "BASE SET",
    number: "044/102",
    rarity: "common",
    image: "/bulbasaur-card.png",
    year: 1999,
  },
  {
    id: "gengar-094",
    name: "Gengar",
    set: "FOSSIL",
    number: "094/062",
    rarity: "rare holo",
    image: "/gengar-card.png",
    year: 1999,
  },
  {
    id: "lucario-122",
    name: "Lucario",
    set: "DIAMOND & PEARL",
    number: "122/130",
    rarity: "rare holo",
    image: "/lucario-card.png",
    year: 2007,
  },
]

// Update the CardInformationPanel component function
export function CardInformationPanel({ cardData, updateCardData, onSound }: CardInformationPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null)

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

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchRef])

  // Mock card sets data
  const cardSets = [
    { id: "neo-thunder", name: "NEO THUNDER", year: 2025 },
    { id: "pixel-pulse", name: "PIXEL PULSE", year: 2025 },
    { id: "void-runners", name: "VOID RUNNERS", year: 2025 },
    { id: "cyber-strike", name: "CYBER STRIKE", year: 2024 },
    { id: "digital-nexus", name: "DIGITAL NEXUS", year: 2024 },
  ]

  // Mock rarities
  const rarities = [
    { id: "common", name: "COMMON", color: "#FFFFFF" },
    { id: "rare", name: "RARE", color: "#00F5FF" },
    { id: "epic", name: "EPIC", color: "#FF2D55" },
    { id: "legendary", name: "LEGENDARY", color: "#F6FF00" },
  ]

  // Mock languages
  const languages = ["English", "Japanese", "French", "German", "Italian", "Spanish", "Chinese", "Korean"]

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 1) {
      // Simulate search results
      const filteredResults = MOCK_SEARCH_RESULTS.filter(
        (card) =>
          card.name.toLowerCase().includes(query.toLowerCase()) || card.set.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchResults(filteredResults)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  // Handle search
  const handleSearch = () => {
    if (!searchQuery) return

    setIsSearching(true)
    onSound("click")

    // Add to recent searches if not already there
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches((prev) => [searchQuery, ...prev].slice(0, 3))
    }

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
      setShowResults(false)

      // In a real app, this would search a database
      const matchingCard = MOCK_SEARCH_RESULTS.find((card) =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      if (matchingCard) {
        updateCardData({
          name: matchingCard.name,
          set: matchingCard.set,
          number: matchingCard.number,
          rarity: matchingCard.rarity,
        })
        onSound("success")
      } else {
        onSound("error")
      }
    }, 800)
  }

  // Handle card selection from search results
  const handleSelectCard = (card: CardSearchResult) => {
    setSearchQuery(card.name)
    setShowResults(false)
    updateCardData({
      name: card.name,
      set: card.set,
      number: card.number,
      rarity: card.rarity,
    })
    onSound("success")

    // Add to recent searches
    if (!recentSearches.includes(card.name)) {
      setRecentSearches((prev) => [card.name, ...prev].slice(0, 3))
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    onSound("click")
  }

  return (
    <div ref={panelRef} className="space-y-8">
      {/* Card search */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          SEARCH CARD
        </h3>

        <div ref={searchRef} className="relative">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search by card name..."
                className="w-full bg-pikavault-dark border-4 border-white/30 focus:border-pikavault-yellow p-4 text-white outline-none transition-colors duration-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
              />
              {isSearching ? (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-pikavault-yellow border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : searchQuery ? (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 sm:hover:text-white"
                  onClick={clearSearch}
                  onMouseEnter={() => onSound("hover")}
                >
                  <X className="w-5 h-5" />
                </button>
              ) : null}
            </div>
            <button
              onClick={handleSearch}
              className="bg-pikavault-yellow text-pikavault-dark p-4 font-bold"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
              onMouseEnter={() => onSound("hover")}
            >
              <Search className="w-6 h-6" />
            </button>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && !showResults && (
            <div className="mt-2 flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1 bg-white/10 sm:hover:bg-white/20 px-3 py-1 text-sm transition-colors"
                  onClick={() => {
                    setSearchQuery(term)
                    handleSearch()
                  }}
                  onMouseEnter={() => onSound("hover")}
                >
                  <Clock className="w-3 h-3" />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-pikavault-dark border-4 border-pikavault-yellow max-h-[400px] overflow-y-auto shadow-xl">
              <div className="p-2 border-b border-white/20 flex justify-between items-center">
                <span className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {searchResults.length} results
                </span>
                <button
                  className="text-white/50 sm:hover:text-white"
                  onClick={() => setShowResults(false)}
                  onMouseEnter={() => onSound("hover")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {searchResults.map((card) => (
                <button
                  key={card.id}
                  className={`w-full p-3 flex items-center gap-4 transition-colors border-b border-white/10 ${
                    highlightedCardId === card.id ? "bg-pikavault-yellow/20" : "sm:hover:bg-white/20"
                  }`}
                  onClick={() => handleSelectCard(card)}
                  onMouseEnter={() => {
                    onSound("hover")
                    setHighlightedCardId(card.id)
                  }}
                  onMouseLeave={() => setHighlightedCardId(null)}
                >
                  <div className="w-12 h-16 bg-black/50 overflow-hidden flex-shrink-0">
                    <img
                      src={card.image || "/placeholder.svg"}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                      {card.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{card.set}</span>
                      <span>•</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{card.number}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {card.rarity === "legendary" && <Star className="w-5 h-5 text-pikavault-yellow" />}
                    {card.rarity === "epic" && <Star className="w-5 h-5 text-pikavault-pink" />}
                    {card.rarity === "rare" && <Star className="w-5 h-5 text-pikavault-cyan" />}
                    {card.rarity === "ultra rare" && <Star className="w-5 h-5 text-[#FF9500]" />}
                    {card.rarity === "common" && <Star className="w-5 h-5 text-white/50" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showResults && searchQuery.length > 1 && searchResults.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-pikavault-dark border-4 border-white/30 p-4 text-center shadow-xl">
              <p className="text-white/70 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                No cards found matching "{searchQuery}"
              </p>
              <button
                className="text-pikavault-cyan text-sm sm:hover:underline"
                onClick={clearSearch}
                onMouseEnter={() => onSound("hover")}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card name */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          CARD NAME
        </h3>

        <div className="relative">
          <input
            type="text"
            value={cardData.name}
            onChange={(e) => updateCardData({ name: e.target.value })}
            placeholder="Enter card name..."
            className={`w-full bg-pikavault-dark border-4 ${
              cardData.name ? "border-pikavault-cyan" : "border-white/30"
            } p-4 text-white outline-none transition-colors duration-300`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
          {cardData.name && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pikavault-cyan">
              <Check className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Card set */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          CARD SET
        </h3>

        <div className="overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex space-x-4 min-w-max">
            {cardSets.map((set) => (
              <button
                key={set.id}
                onClick={() => {
                  updateCardData({ set: set.name })
                  onSound("click")
                }}
                className={`flex flex-col items-center p-4 border-4 min-w-[150px] transition-all duration-300 ${
                  cardData.set === set.name
                    ? "border-pikavault-yellow bg-pikavault-yellow/10"
                    : "border-white/30 sm:hover:border-white/60"
                }`}
                onMouseEnter={() => onSound("hover")}
              >
                <span className="text-lg font-bold mb-1" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                  {set.name}
                </span>
                <span className="text-sm text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {set.year}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card number */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          CARD NUMBER
        </h3>

        <div className="flex space-x-4">
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => updateCardData({ number: e.target.value })}
            placeholder="000/000"
            className="w-full bg-pikavault-dark border-4 border-white/30 focus:border-pikavault-yellow p-4 text-white outline-none transition-colors duration-300"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>
      </div>

      {/* Card rarity */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          RARITY
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {rarities.map((rarity) => (
            <button
              key={rarity.id}
              onClick={() => {
                updateCardData({ rarity: rarity.id })
                onSound("click")
              }}
              className={`p-4 border-4 transition-all duration-300 ${
                cardData.rarity === rarity.id
                  ? `border-[${rarity.color}] bg-[${rarity.color}]/10`
                  : "border-white/30 sm:hover:border-white/60"
              }`}
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
              onMouseEnter={() => onSound("hover")}
            >
              {rarity.name}
            </button>
          ))}
        </div>
      </div>

      {/* Card language */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          LANGUAGE
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {languages.map((language) => (
            <button
              key={language}
              onClick={() => {
                updateCardData({ language })
                onSound("click")
              }}
              className={`p-3 border-2 transition-all duration-300 ${
                cardData.language === language
                  ? "border-pikavault-cyan bg-pikavault-cyan/10"
                  : "border-white/30 sm:hover:border-white/60"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              onMouseEnter={() => onSound("hover")}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      {/* Professional grading */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            PROFESSIONAL GRADING
          </h3>

          <button
            onClick={() => {
              updateCardData({ isGraded: !cardData.isGraded })
              onSound("click")
            }}
            className={`w-12 h-6 ${
              cardData.isGraded ? "bg-pikavault-yellow" : "bg-white/30"
            } relative rounded-full transition-colors duration-300`}
            onMouseEnter={() => onSound("hover")}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                cardData.isGraded ? "left-7" : "left-1"
              }`}
            ></span>
          </button>
        </div>

        {cardData.isGraded && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Grading Company
              </label>
              <select
                value={cardData.gradingCompany}
                onChange={(e) => updateCardData({ gradingCompany: e.target.value })}
                className="w-full bg-pikavault-dark border-4 border-white/30 focus:border-pikavault-yellow p-4 text-white outline-none transition-colors duration-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <option value="">Select company</option>
                <option value="PSA">PSA</option>
                <option value="BGS">BGS</option>
                <option value="CGC">CGC</option>
              </select>
            </div>
            <div>
              <label className="block text-white/70 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Grade
              </label>
              <input
                type="text"
                value={cardData.gradingScore}
                onChange={(e) => updateCardData({ gradingScore: e.target.value })}
                placeholder="10, 9.5, etc."
                className="w-full bg-pikavault-dark border-4 border-white/30 focus:border-pikavault-yellow p-4 text-white outline-none transition-colors duration-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
