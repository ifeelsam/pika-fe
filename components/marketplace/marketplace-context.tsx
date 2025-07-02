"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAnchorProgram } from "@/lib/anchor/client"
import { getAllListings, createUmiInstance } from "@/lib/anchor/transactions"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata"
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi"

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const { program } = useAnchorProgram()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter data
  const [filters, setFilters] = useState<FilterType[]>([
    {
      id: "rarity",
      label: "RaRiTy",
      options: [
        { id: "common", label: "COMMON", active: false },
        { id: "rare", label: "RARE", active: false },
        { id: "epic", label: "EPIC", active: false },
        { id: "legendary", label: "LEGENDARY", active: false },
      ],
    },
    {
      id: "collection",
      label: "CoLlEcTiOn",
      options: [
        { id: "neo-thunder", label: "NEO THUNDER", active: false },
        { id: "pixel-pulse", label: "PIXEL PULSE", active: false },
        { id: "void-runners", label: "VOID RUNNERS", active: false },
        { id: "pokevault", label: "POKEVAULT", active: false },
      ],
    },
    {
      id: "price",
      label: "PrIcE",
      options: [
        { id: "under-1", label: "< 1 SOL", active: false },
        { id: "1-5", label: "1-5 SOL", active: false },
        { id: "5-10", label: "5-10 SOL", active: false },
        { id: "over-10", label: "> 10 SOL", active: false },
      ],
    },
    {
      id: "status",
      label: "StAtUs",
      options: [
        { id: "active", label: "ACTIVE", active: true },
        { id: "sold", label: "SOLD", active: false },
        { id: "unlisted", label: "UNLISTED", active: false },
      ],
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [cards, setCards] = useState<BaseCardData[]>([])

  // Helper function to determine rarity based on price
  const determineRarity = (price: number): CardRarity => {
    if (price >= 10) return "legendary"
    if (price >= 5) return "epic"
    if (price >= 1) return "rare"
    return "common"
  }

  // Helper function to determine collection
  const determineCollection = (nftMint: string): string => {
    // Simple hash-based assignment for consistent collection grouping
    const hash = nftMint.slice(-4)
    const hashNum = parseInt(hash, 16) % 4
    switch (hashNum) {
      case 0: return "neo-thunder"
      case 1: return "pixel-pulse"
      case 2: return "void-runners"
      default: return "pokevault"
    }
  }

  // Generate random rotation for each card
  const generateRotation = (id: string): number => {
    const hash = id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
    return (hash % 7) - 3 // Random rotation between -3 and 3
  }

  // Helper function to fetch NFT metadata using UMI
  const fetchNFTMetadata = async (nftMint: string): Promise<{ name: string; image: string; description?: string }> => {
    try {
      if (!program?.provider.connection) {
        throw new Error("No connection available")
      }

      // Create UMI instance
      const umi = createUmiInstance(program.provider.connection.rpcEndpoint)
      
      // Convert mint address to UMI public key
      const mintPubkey = umiPublicKey(nftMint)
      
      // Fetch digital asset (NFT) metadata
      const digitalAsset = await fetchDigitalAsset(umi, mintPubkey)
      
      // Extract metadata
      const metadata = digitalAsset.metadata
      const name = metadata.name || `NFT #${nftMint.slice(0, 6).toUpperCase()}`
      
      let imageUrl = `/placeholder-1.png`
      
      // Fetch off-chain metadata if URI exists
      if (metadata.uri) {
        try {
          const response = await fetch(metadata.uri)
          const offChainMetadata = await response.json()
          imageUrl = offChainMetadata.image || imageUrl
        } catch (error) {
          console.warn("Failed to fetch off-chain metadata:", error)
        }
      }
      
      return {
        name,
        image: imageUrl,
        description: metadata.uri ? undefined : undefined // Will be fetched from off-chain if needed
      }
    } catch (error) {
      console.error("Error fetching NFT metadata for", nftMint, ":", error)
      return {
        name: `NFT #${nftMint.slice(0, 6).toUpperCase()}`,
        image: `/placeholder-1.png`
      }
    }
  }

  // Load listings from blockchain
  const loadListings = async () => {
    if (!program) return

    try {
      setIsLoading(true)
      setError(null)

      const listings = await getAllListings(program)
      
      // Fetch metadata for all NFTs in parallel
      const metadataPromises = listings.map(listing => 
        fetchNFTMetadata(listing.account.nftAddress.toString())
      )
      
      const metadataResults = await Promise.allSettled(metadataPromises)
      
      const formattedCards: BaseCardData[] = listings.map((listing, index) => {
        const priceInSol = parseInt(listing.account.listingPrice.toString()) / LAMPORTS_PER_SOL
        const rarity = determineRarity(priceInSol)
        const collection = determineCollection(listing.account.nftAddress.toString())
        
        // Determine status
        let status: MarketplaceStatus = "unlisted"
        if (listing.account.status.active) status = "active"
        else if (listing.account.status.sold) status = "sold"

        // Get metadata or fallback
        const metadataResult = metadataResults[index]
        const metadata = metadataResult.status === 'fulfilled' 
          ? metadataResult.value 
          : { 
              name: `NFT #${listing.account.nftAddress.toString().slice(0, 6).toUpperCase()}`, 
              image: `/placeholder-${(index % 5) + 1}.png` 
            }

        return {
          id: listing.account.nftAddress.toString().slice(0, 8),
          name: metadata.name,
          rarity,
          price: priceInSol,
          imageUrl: metadata.image,
          rotation: generateRotation(listing.publicKey.toString()),
          ownerAddress: listing.account.owner.toString(),
          collection,
          listingPubkey: listing.publicKey.toString(),
          nftMint: listing.account.nftAddress.toString(),
          status
        }
      })

      setCards(formattedCards)
    } catch (err) {
      console.error("Error loading listings:", err)
      setError(err instanceof Error ? err.message : "Failed to load listings")
      // Fallback to empty array on error
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh listings function
  const refreshListings = async () => {
    await loadListings()
  }

  // Load listings on mount and when program changes
  useEffect(() => {
    loadListings()
  }, [program])

  // Toggle filter option
  const toggleFilter = (filterId: string, optionId: string) => {
    setFilters(
      filters.map((filter) => {
        if (filter.id === filterId) {
          return {
            ...filter,
            options: filter.options.map((option) => {
              if (option.id === optionId) {
                return { ...option, active: !option.active }
              }
              return option
            }),
          }
        }
        return filter
      }),
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters(
      filters.map((filter) => ({
        ...filter,
        options: filter.options.map((option) => ({
          ...option,
          active: filter.id === "status" && option.id === "active", // Keep active status selected by default
        })),
      })),
    )
    setSearchQuery("")
  }

  // Apply filters to cards
  const filteredCards = cards.filter((card) => {
    // Check if card matches search query
    if (
      searchQuery &&
      !card.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !card.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !card.nftMint.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Check if card matches active filters
    for (const filter of filters) {
      const activeOptions = filter.options.filter((option) => option.active)

      // Skip filter if no options are active
      if (activeOptions.length === 0) continue

      // Check if card matches any active option in this filter
      if (filter.id === "rarity") {
        if (!activeOptions.some((option) => option.id === card.rarity)) {
          return false
        }
      } else if (filter.id === "collection") {
        if (!activeOptions.some((option) => option.id === card.collection)) {
          return false
        }
      } else if (filter.id === "status") {
        if (!activeOptions.some((option) => option.id === card.status)) {
          return false
        }
      } else if (filter.id === "price") {
        const matchesPrice = activeOptions.some((option) => {
          if (option.id === "under-1") return card.price < 1
          if (option.id === "1-5") return card.price >= 1 && card.price <= 5
          if (option.id === "5-10") return card.price > 5 && card.price <= 10
          if (option.id === "over-10") return card.price > 10
          return false
        })

        if (!matchesPrice) {
          return false
        }
      }
    }

    return true
  })

  return (
    <MarketplaceContext.Provider
      value={{
        filters,
        toggleFilter,
        resetFilters,
        cards,
        filteredCards,
        searchQuery,
        setSearchQuery,
        isLoading,
        error,
        refreshListings,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider")
  }
  return context
}
