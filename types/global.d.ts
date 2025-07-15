// Global type declarations for NFT-related types
// These types will be available throughout the application without imports

// NFT Attribute type for metadata traits
declare global {
  type NFTAttribute = {
    trait_type: string
    value: string | number
  }

  // Raw NFT metadata structure from IPFS
  type NFTMetadata = {
    name: string
    description: string
    image: string
    attributes?: NFTAttribute[]
    properties?: {
      category?: string
      creators?: Array<{ address: string; share: number }>
    }
  }

  // Base card type from marketplace
  type BaseCardData = {
    id: string
    name: string
    rarity: "common" | "rare" | "epic" | "legendary"
    price: number
    imageUrl: string
    rotation: number
    collection: string
    listingPubkey: string
    nftMint: string
    status: "active" | "sold" | "unlisted"
    ownerAddress: string
  }

  type EnhancedCardData = BaseCardData & {
    description: string
    setName: string
    setNumber: string
    condition: string
    conditionGrade: string
    conditionDescription: string
    priceChange24h: number
    lastSalePrice: number
    lastSaleDate: string
    floorPrice: number
    backImageUrl: string
    holographicImageUrl: string
    authenticated: boolean
    authenticationHash: string
    blockchainTxHash: string
    editionNumber: number
    printRun: number
    artist?: string
    type?: string
    element?: string
    hp?: string
    attack?: string
    defense?: string
    abilities: Array<{ name: string; description: string }>
    owner: {
      address: string
      username: string
      avatar: string
      verified: boolean
    }
    seller: {
      address: string
      username: string
      rating: number
      totalSales: number
    }
    priceHistory: Array<{ date: string; price: number }>
    ownershipHistory: Array<{ owner: string; date: string; price: number; txHash: string }>
    rawAttributes?: NFTAttribute[]
  }

  // Marketplace filter types
  type FilterOption = {
    id: string
    label: string
    active: boolean
  }

  type FilterType = {
    id: string
    label: string
    options: FilterOption[]
  }

  // Transaction states
  type TransactionState = "idle" | "loading" | "success" | "error"

  // Marketplace context types
  type MarketplaceContextType = {
    filters: FilterType[]
    toggleFilter: (filterId: string, optionId: string) => void
    resetFilters: () => void
    cards: BaseCardData[]
    filteredCards: BaseCardData[]
    searchQuery: string
    setSearchQuery: (query: string) => void
    isLoading: boolean
    error: string | null
    refreshListings: () => Promise<void>
    program: any // Wallet-connected program for transactions
  }

  // Hook return types
  type UseNFTMetadataReturn = {
    nftMetadata: NFTMetadata | null
    isLoading: boolean
    error: string | null
    getEnhancedCardData: (card: BaseCardData | null, metadata: NFTMetadata | null, realOwnershipHistory?: Array<{ owner: string; date: string; price: number; txHash: string }>) => EnhancedCardData | null
    getAttributeValue: (attributes: NFTAttribute[] | undefined, traitType: string) => string
    determineRarity: (attributes: NFTAttribute[] | undefined, price: number) => CardRarity
    getConditionDescription: (condition: string) => string
    refetch: () => Promise<void>
  }

  // Wallet connection types
  type WalletData = {
    address: string
    balance: number
    network: string
    usdBalance: number
  }

  // Sound effect types
  type SoundType = "hover" | "click" | "success" | "error"

  // Card view modes
  type CardViewMode = "front" | "back" | "holo"

  // Transaction panel props
  type TransactionPanelProps = {
    isOpen: boolean
    selectedCards: string[]
    onClose: () => void
  }

  // Card rarity levels
  type CardRarity = "common" | "rare" | "epic" | "legendary"

  // Card condition grades
  type CardCondition = "M" | "NM" | "LP" | "MP" | "HP" | "D" | "MINT" | "NEAR MINT" | "LIGHTLY PLAYED" | "MODERATELY PLAYED" | "HEAVILY PLAYED" | "DAMAGED"

  // Marketplace status
  type MarketplaceStatus = "active" | "sold" | "unlisted"
}

// This export is required to make this file a module and enable global declarations
export {} 