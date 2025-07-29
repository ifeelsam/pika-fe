"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { gsap } from "gsap"
import { Check, Search, X, Star, Clock } from "lucide-react"
import { searchCardsByName, formatCardForApp } from "@/lib/tcg-api"

// Interface for search results from TCG API
interface CardSearchResult {
  id: string
  name: string
  set: string
  number: string
  rarity: string
  image: string
  year?: number
  artist?: string
  originalName?: string
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
    suggestedPrice: number
  }
  updateCardData: (data: Partial<CardInformationPanelProps["cardData"]>) => void
  onSound: (soundType: "hover" | "click" | "success" | "error") => void
}

// Convert TCG API card to search result format
const convertTCGCardToSearchResult = (card: any): CardSearchResult => {
  // Safety checks for required fields
  if (!card || !card.name || !card.set) {
    console.warn('Invalid card data received:', card)
    return {
      id: card?.id || 'unknown',
      name: 'Unknown Card',
      set: 'Unknown Set',
      number: '',
      rarity: 'common',
      image: '',
      originalName: card?.name || 'Unknown Card'
    }
  }

  // Clean the card name for display but keep original in a separate field
  const cleanName = card.name
    ?.replace(/^[A-Za-z\s]+\'s\s+/, '') // Remove possessive names
    ?.replace(/^(Dark|Light|Shining|Crystal|Team Rocket's|Rocket's|Giovanni's|Lt\. Surge's|Misty's|Brock's|Erika's|Koga's|Sabrina's|Blaine's|)\s+/, '') // Remove prefixes
    ?.replace(/\s+(ex|EX|GX|V|VMAX|VSTAR|Prime|LEGEND|BREAK|Tag Team|&.*)?$/i, '') // Remove suffixes
    ?.replace(/\s+Lv\.\d+/i, '') // Remove level indicators
    ?.trim()

  return {
    id: card.id || 'unknown',
    name: cleanName || card.name || 'Unknown Card',
    set: card.set?.name?.replace(/^Pokemon\s+/i, '') || 'Unknown Set',
    number: card.number || '',
    rarity: card.rarity || 'common',
    image: card.images?.small || card.images?.large || "",
    year: card.set?.releaseDate ? new Date(card.set.releaseDate).getFullYear() : undefined,
    artist: card.artist || undefined,
    originalName: card.name || 'Unknown Card'
  }
}

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
  const [debouncedQuery, setDebouncedQuery] = useState("")

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

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Perform search when debounced query changes
  const performSearch = useCallback(async (query: string) => {
    if (query.length > 2) {
      try {
        setIsSearching(true)
        
        // Search for cards using our proxy API with better error handling
        const apiResults = await searchCardsByName(query, 10)
        
        if (apiResults && Array.isArray(apiResults)) {
          const validResults = apiResults.filter(card => card && card.name)
          const searchResults = validResults.map(convertTCGCardToSearchResult)
          
          setSearchResults(searchResults)
          setShowResults(true)
          console.log(`Found ${searchResults.length} cards for query: ${query}`)
        } else {
          console.warn('Invalid API response:', apiResults)
          setSearchResults([])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Error searching cards:', error)
        setSearchResults([])
        setShowResults(true) // Keep showing to display error message
      } finally {
        setIsSearching(false)
      }
    } else {
      setShowResults(false)
      setSearchResults([])
      setIsSearching(false)
    }
  }, [])

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== searchQuery) return // Only search when debounce is complete
    
    performSearch(debouncedQuery)
  }, [debouncedQuery, performSearch])

  // Handle search input change (now just updates the query, no immediate search)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Show loading state if user is typing and will trigger a search
    if (query.length > 2) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
      setShowResults(false)
      setSearchResults([])
    }
  }

  // Handle manual search
  const handleSearch = async () => {
    if (!searchQuery) return

    setIsSearching(true)
    onSound("click")

    // Add to recent searches if not already there
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches((prev) => [searchQuery, ...prev].slice(0, 3))
    }

    try {
      // Search using the real TCG API
      const apiResults = await searchCardsByName(searchQuery, 5)
      
      if (apiResults.length > 0) {
        // Use the first result and format it for our app
        const selectedCard = apiResults[0]
        const formattedCard = formatCardForApp(selectedCard)
        
        updateCardData({
          name: formattedCard.name,
          set: formattedCard.set,
          number: formattedCard.number,
          rarity: formattedCard.rarity,
        })
        
        console.log('Selected card from search:', selectedCard.name)
        onSound("success")
      } else {
        console.log('No cards found for query:', searchQuery)
        onSound("error")
      }
    } catch (error) {
      console.error('Error searching cards:', error)
      onSound("error")
    } finally {
      setIsSearching(false)
      setShowResults(false)
    }
  }

  // Handle card selection from search results
  const handleSelectCard = async (card: CardSearchResult) => {
    setSearchQuery(card.name)
    setShowResults(false)
    
    try {
      // Get the full card data from the API for accurate pricing
      const apiResults = await searchCardsByName(card.name, 1)
      
      if (apiResults.length > 0) {
        const fullCard = apiResults[0]
        const formattedCard = formatCardForApp(fullCard)
        
        updateCardData({
          name: formattedCard.name,
          set: formattedCard.set,
          number: formattedCard.number,
          rarity: formattedCard.rarity,
          suggestedPrice: formattedCard.suggestedPrice,
        })
        
        console.log('Selected card with pricing:', fullCard.name, 'Suggested price:', formattedCard.suggestedPrice)
      } else {
        // Fallback to basic card data
        updateCardData({
          name: card.name,
          set: card.set,
          number: card.number,
          rarity: card.rarity,
        })
      }
      
      onSound("success")
    } catch (error) {
      console.error('Error getting full card data:', error)
      // Fallback to basic card data from search result
      updateCardData({
        name: card.name,
        set: card.set,
        number: card.number,
        rarity: card.rarity,
      })
      onSound("success")
    }

    // Add to recent searches
    if (!recentSearches.includes(card.name)) {
      setRecentSearches((prev) => [card.name, ...prev].slice(0, 3))
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    setSearchResults([])
    onSound("click")
  }

  return (
    <div ref={panelRef} className="space-y-8 relative">
      {/* Card search */}
      <div className="space-y-4 relative z-10">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          SEARCH CARD
        </h3>

        <div ref={searchRef} className="relative z-[100]">
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
              {(isSearching || (searchQuery.length > 2 && searchQuery !== debouncedQuery)) ? (
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
            <div className="absolute z-[9999] w-full mt-2 bg-pikavault-dark/95 border-4 border-pikavault-yellow max-h-[400px] overflow-y-auto shadow-2xl backdrop-blur-sm" style={{ boxShadow: '0 0 20px rgba(246, 255, 0, 0.3)' }}>
              <div className="p-2 border-b border-white/20 flex justify-between items-center">
                <span className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {isSearching ? 'Searching...' : `${searchResults.length} results`}
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
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                      {card.name}
                    </div>
                    {card.originalName && card.originalName !== card.name && (
                      <div className="text-xs text-white/50 italic mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Original: {card.originalName}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{card.set}</span>
                      <span>•</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{card.number}</span>
                      {card.year && (
                        <>
                          <span>•</span>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{card.year}</span>
                        </>
                      )}
                    </div>
                    {card.artist && (
                      <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Artist: {card.artist}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {(card.rarity?.toLowerCase()?.includes("rare holo") || card.rarity?.toLowerCase()?.includes("rare")) && <Star className="w-5 h-5 text-pikavault-yellow" />}
                    {card.rarity?.toLowerCase()?.includes("uncommon") && <Star className="w-5 h-5 text-pikavault-cyan" />}
                    {(card.rarity?.toLowerCase()?.includes("common") || !card.rarity) && <Star className="w-5 h-5 text-white/50" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results or error message */}
          {showResults && searchQuery.length > 1 && searchResults.length === 0 && !isSearching && (
            <div className="absolute z-[9999] w-full mt-2 bg-pikavault-dark/95 border-4 border-white/30 p-4 text-center shadow-2xl backdrop-blur-sm">
              <p className="text-white/70 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                No cards found matching "{searchQuery}"
              </p>
              <p className="text-white/50 text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                The Pokemon TCG API might be experiencing high traffic. Try again in a moment or enter card details manually.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="text-pikavault-cyan text-sm sm:hover:underline"
                  onClick={() => performSearch(searchQuery)}
                  onMouseEnter={() => onSound("hover")}
                >
                  Retry Search
                </button>
                <button
                  className="text-pikavault-yellow text-sm sm:hover:underline"
                  onClick={clearSearch}
                  onMouseEnter={() => onSound("hover")}
                >
                  Clear Search
                </button>
              </div>
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

