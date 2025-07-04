"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAnchorProgram } from "@/lib/anchor/client"
import { getUserOwnedNFTs, listNFT, delistNFT, findMarketplacePDA } from "@/lib/anchor/transactions"
import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_ADMIN } from "@/lib/anchor/config"

type SortOption = "name" | "value" | "rarity" | "date"
type ViewMode = "grid" | "list"
type SortDirection = "asc" | "desc"

type FilterType = {
  id: string
  label: string
  options: {
    id: string
    label: string
    active: boolean
  }[]
}

export type CardType = {
  id: string
  name: string
  rarity: "common" | "rare" | "epic" | "legendary"
  value: number
  floorPrice: number
  priceChange: number
  imageUrl: string
  rotation: number
  acquiredDate: string
  collection: string
  nftMint: string
  isListed: boolean
  listingInfo?: {
    listingPubkey: string
    price: number
    status: "active" | "sold" | "unlisted"
  }
}

type CollectionContextType = {
  cards: CardType[]
  filteredCards: CardType[]
  filters: FilterType[]
  toggleFilter: (filterId: string, optionId: string) => void
  resetFilters: () => void
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
  sortDirection: SortDirection
  setSortDirection: (direction: SortDirection) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  totalValue: number
  isLoading: boolean
  error: string | null
  refreshNFTs: () => Promise<void>
  listNFTs: (cardIds: string[], price: number) => Promise<void>
  delistNFTs: (cardIds: string[]) => Promise<void>
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const { program } = useAnchorProgram()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<CardType[]>([])

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
      id: "value",
      label: "VaLuE",
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
        { id: "listed", label: "LISTED", active: false },
        { id: "unlisted", label: "UNLISTED", active: false },
        { id: "sold", label: "SOLD", active: false },
      ],
    },
  ])

  const [sortOption, setSortOption] = useState<SortOption>("value")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Helper functions
  const getAttributeValue = (attributes: NFTAttribute[] | undefined, traitType: string): string => {
    if (!attributes) return ""
    const attribute = attributes.find(attr => 
      attr.trait_type.toLowerCase() === traitType.toLowerCase()
    )
    return attribute ? String(attribute.value) : ""
  }

  const determineRarity = (attributes: NFTAttribute[] | undefined, price: number): CardType["rarity"] => {
    const rarityFromAttributes = getAttributeValue(attributes, "rarity")
    if (rarityFromAttributes) {
      const rarity = rarityFromAttributes.toLowerCase()
      if (["legendary", "epic", "rare", "common"].includes(rarity)) {
        return rarity as CardType["rarity"]
      }
    }
    
    // Fallback to price-based rarity
    if (price >= 10) return "legendary"
    if (price >= 5) return "epic"
    if (price >= 1) return "rare"
    return "common"
  }

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

  // Load user's NFTs
  const loadUserNFTs = async () => {
    if (!program || !publicKey) {
      setCards([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log("Loading NFTs for user:", publicKey.toString())
      
      const userNFTs = await getUserOwnedNFTs(program, publicKey)
      
      console.log("User NFTs:", userNFTs)
      
      const formattedCards: CardType[] = userNFTs.map((nft, index) => {
        const price = nft.listingInfo?.price || 1 // Default value for unlisted NFTs
        const rarity = determineRarity(nft.metadata.attributes, price)
        const collection = determineCollection(nft.nftMint)
        
        return {
          id: nft.nftMint.slice(0, 8),
          name: nft.metadata.name,
          rarity,
          value: price,
          floorPrice: price * 0.9, // Estimated floor price
          priceChange: Math.random() * 20 - 10, // Random price change for demo
          imageUrl: nft.metadata.image,
          rotation: generateRotation(nft.nftMint),
          acquiredDate: new Date().toISOString().split('T')[0], // Today's date as placeholder
          collection,
          nftMint: nft.nftMint,
          isListed: nft.isListed,
          listingInfo: nft.listingInfo
        }
      })
      
      setCards(formattedCards)
      
    } catch (err: any) {
      console.error("Error loading user NFTs:", err)
      
      // Provide more specific error messages
      let errorMessage = "Failed to load NFTs"
      
      if (err.message?.includes("Failed to fetch") || err.message?.includes("fetch")) {
        errorMessage = "Network connection failed. Please check your internet connection and try again."
      } else if (err.message?.includes("timeout")) {
        errorMessage = "Request timed out. The network might be slow. Please try again."
      } else if (err.message?.includes("insufficient funds") || err.message?.includes("0x1")) {
        errorMessage = "Insufficient SOL for transaction fees. Please add SOL to your wallet."
      } else if (err.message?.includes("User rejected")) {
        errorMessage = "Transaction was cancelled by user."
      } else if (err.message?.includes("RPC")) {
        errorMessage = "Solana network is experiencing issues. Please try again in a few moments."
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh NFTs with retry logic
  const refreshNFTs = async (retryCount = 0) => {
    try {
      await loadUserNFTs()
    } catch (error) {
      if (retryCount < 2) {
        console.log(`Retrying NFT fetch (attempt ${retryCount + 1})...`)
        setTimeout(() => refreshNFTs(retryCount + 1), 2000)
      } else {
        console.error("Failed to refresh NFTs after retries")
      }
    }
  }

  // List NFTs on marketplace
  const listNFTs = async (cardIds: string[], price: number) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected")
    }

    try {
      const [marketplace] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)
      const priceInLamports = Math.floor(price * 1000000000) // Convert SOL to lamports

      // Find cards to list
      const cardsToList = cards.filter(card => cardIds.includes(card.id) && !card.isListed)
      
      if (cardsToList.length === 0) {
        throw new Error("No unlisted cards selected")
      }

      // List each NFT (could be batched in the future)
      for (const card of cardsToList) {
        console.log(`Listing NFT ${card.nftMint} for ${price} SOL`)
        
        try {
          await listNFT(
            program,
            publicKey,
            marketplace,
            new PublicKey(card.nftMint),
            priceInLamports
          )
        } catch (listError: any) {
          console.error(`Failed to list NFT ${card.nftMint}:`, listError)
          
          // Provide specific error messages for listing failures
          if (listError.message?.includes("insufficient funds")) {
            throw new Error(`Insufficient SOL to pay transaction fees for listing ${card.name}`)
          } else if (listError.message?.includes("User rejected")) {
            throw new Error("Transaction was cancelled by user")
          } else {
            throw new Error(`Failed to list ${card.name}: ${listError.message || "Unknown error"}`)
          }
        }
      }

      // Refresh the NFT list
      await refreshNFTs()
      
    } catch (error: any) {
      console.error("Error listing NFTs:", error)
      throw error
    }
  }

  // Delist NFTs from marketplace  
  const delistNFTs = async (cardIds: string[]) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected")
    }

    try {
      const [marketplace] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)

      // Find cards to delist
      const cardsToDelisted = cards.filter(card => 
        cardIds.includes(card.id) && 
        card.isListed && 
        card.listingInfo?.status === "active"
      )
      
      if (cardsToDelisted.length === 0) {
        throw new Error("No active listings selected")
      }

      // Delist each NFT
      for (const card of cardsToDelisted) {
        if (!card.listingInfo) continue
        
        console.log(`Delisting NFT ${card.nftMint}`)
        
        try {
          await delistNFT(
            program,
            publicKey,
            marketplace,
            new PublicKey(card.nftMint),
            new PublicKey(card.listingInfo.listingPubkey)
          )
        } catch (delistError: any) {
          console.error(`Failed to delist NFT ${card.nftMint}:`, delistError)
          
          // Provide specific error messages for delisting failures
          if (delistError.message?.includes("insufficient funds")) {
            throw new Error(`Insufficient SOL to pay transaction fees for delisting ${card.name}`)
          } else if (delistError.message?.includes("User rejected")) {
            throw new Error("Transaction was cancelled by user")
          } else {
            throw new Error(`Failed to delist ${card.name}: ${delistError.message || "Unknown error"}`)
          }
        }
      }

      // Refresh the NFT list
      await refreshNFTs()
      
    } catch (error: any) {
      console.error("Error delisting NFTs:", error)
      throw error
    }
  }

  // Load NFTs when wallet connects or program changes
  useEffect(() => {
    if (publicKey && program) {
      loadUserNFTs()
    } else {
      setCards([])
      setIsLoading(false)
      setError(null)
    }
  }, [publicKey, program])

  // Calculate total value
  const totalValue = cards.reduce((sum, card) => sum + card.value, 0)

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
          active: false,
        })),
      })),
    )
  }

  // Apply filters and sorting to cards
  const filteredCards = cards
    .filter((card) => {
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
        } else if (filter.id === "value") {
          const matchesValue = activeOptions.some((option) => {
            if (option.id === "under-1") return card.value < 1
            if (option.id === "1-5") return card.value >= 1 && card.value <= 5
            if (option.id === "5-10") return card.value > 5 && card.value <= 10
            if (option.id === "over-10") return card.value > 10
            return false
          })

          if (!matchesValue) {
            return false
          }
        } else if (filter.id === "status") {
          const matchesStatus = activeOptions.some((option) => {
            if (option.id === "listed") return card.isListed && card.listingInfo?.status === "active"
            if (option.id === "unlisted") return !card.isListed
            if (option.id === "sold") return card.isListed && card.listingInfo?.status === "sold"
            return false
          })

          if (!matchesStatus) {
            return false
          }
        }
      }

      return true
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortOption === "name") {
        return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortOption === "value") {
        return sortDirection === "asc" ? a.value - b.value : b.value - a.value
      } else if (sortOption === "rarity") {
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 }
        return sortDirection === "asc"
          ? rarityOrder[a.rarity] - rarityOrder[b.rarity]
          : rarityOrder[b.rarity] - rarityOrder[a.rarity]
      } else if (sortOption === "date") {
        return sortDirection === "asc"
          ? new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime()
          : new Date(b.acquiredDate).getTime() - new Date(a.acquiredDate).getTime()
      }
      return 0
    })

  return (
    <CollectionContext.Provider
      value={{
        cards,
        filteredCards,
        filters,
        toggleFilter,
        resetFilters,
        sortOption,
        setSortOption,
        sortDirection,
        setSortDirection,
        viewMode,
        setViewMode,
        totalValue,
        isLoading,
        error,
        refreshNFTs,
        listNFTs,
        delistNFTs,
      }}
    >
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const context = useContext(CollectionContext)
  if (context === undefined) {
    throw new Error("useCollection must be used within a CollectionProvider")
  }
  return context
}
