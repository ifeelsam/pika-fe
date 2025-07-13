import { useState, useEffect } from "react"
import { useAnchorProgram } from "@/lib/anchor/client"
import { createUmiInstance, getNFTOwnershipHistory } from "@/lib/anchor/transactions"
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata"
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi"

export const useOwnershipHistory = (nftMint: string | undefined) => {
  const { program } = useAnchorProgram()
  const [ownershipHistory, setOwnershipHistory] = useState<Array<{ owner: string; date: string; price: number; txHash: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOwnershipHistory = async () => {
    if (!nftMint || !program) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching ownership history for NFT:", nftMint)
      const history = await getNFTOwnershipHistory(program, nftMint)
      setOwnershipHistory(history)
    } catch (err: any) {
      console.error("Error fetching ownership history:", err)
      setError(err.message || "Failed to fetch ownership history")
      setOwnershipHistory([]) // Reset to empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (nftMint && program) {
      fetchOwnershipHistory()
    }
  }, [nftMint, program])

  return {
    ownershipHistory,
    isLoading,
    error,
    refetch: fetchOwnershipHistory
  }
}

export const useNFTMetadata = (nftMint: string | undefined): UseNFTMetadataReturn => {
  const { program } = useAnchorProgram()
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAttributeValue = (attributes: NFTAttribute[] | undefined, traitType: string): string => {
    if (!attributes) return ""
    const attribute = attributes.find(attr => 
      attr.trait_type.toLowerCase() === traitType.toLowerCase()
    )
    return attribute ? String(attribute.value) : ""
  }

  const determineRarity = (attributes: NFTAttribute[] | undefined, price: number): CardRarity => {
    const rarityFromAttributes = getAttributeValue(attributes, "rarity")
    if (rarityFromAttributes) {
      const rarity = rarityFromAttributes.toLowerCase()
      if (["legendary", "epic", "rare", "common"].includes(rarity)) {
        return rarity as CardRarity
      }
    }
    
    if (price >= 10) return "legendary"
    if (price >= 5) return "epic"
    if (price >= 1) return "rare"
    return "common"
  }

  const getConditionDescription = (cond: string): string => {
    switch (cond.toUpperCase()) {
      case "M": case "MINT": 
        return "Mint - Perfect condition, no flaws"
      case "NM": case "NEAR MINT": 
        return "Near Mint - Minor edge wear, excellent centering"
      case "LP": case "LIGHTLY PLAYED": 
        return "Lightly Played - Minor wear, good centering"
      case "MP": case "MODERATELY PLAYED": 
        return "Moderately Played - Moderate wear, acceptable condition"
      case "HP": case "HEAVILY PLAYED": 
        return "Heavily Played - Significant wear, poor condition"
      case "D": case "DAMAGED": 
        return "Damaged - Major damage, collectible only"
      default: 
        return "Near Mint - Minor edge wear, excellent centering"
    }
  }

  // Fetch detailed NFT metadata from IPFS
  const fetchDetailedNFTMetadata = async (mintAddress: string): Promise<NFTMetadata | null> => {
    try {
      if (!program?.provider.connection) {
        throw new Error("No connection available")
      }

      setIsLoading(true)
      setError(null)

      // Create UMI instance
      const umi = createUmiInstance(program.provider.connection.rpcEndpoint)
      
      // Convert mint address to UMI public key
      const mintPubkey = umiPublicKey(mintAddress)
      
      // Fetch digital asset (NFT) metadata
      const digitalAsset = await fetchDigitalAsset(umi, mintPubkey)
      
      // Extract metadata
      const metadata = digitalAsset.metadata
      
      // Fetch off-chain metadata if URI exists
      if (metadata.uri) {
        try {
          const response = await fetch(metadata.uri)
          const offChainMetadata: NFTMetadata = await response.json()
          
          console.log("Full NFT Metadata:", offChainMetadata)
          return offChainMetadata
        } catch (error) {
          console.warn("Failed to fetch off-chain metadata:", error)
          throw new Error("Failed to fetch off-chain metadata")
        }
      }
      
      return null
    } catch (error: any) {
      console.error("Error fetching detailed NFT metadata for", mintAddress, ":", error)
      setError(error.message || "Failed to fetch NFT metadata")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Create enhanced card data using real metadata
  const getEnhancedCardData = (card: BaseCardData | null, metadata: NFTMetadata | null, realOwnershipHistory?: Array<{ owner: string; date: string; price: number; txHash: string }>): EnhancedCardData | null => {
    if (!card) return null

    const attributes = metadata?.attributes || []

    // extracting data from attributes
    const condition = getAttributeValue(attributes, "condition") || getAttributeValue(attributes, "card_condition") || "NM"
    const conditionGrade = getAttributeValue(attributes, "grade") || getAttributeValue(attributes, "condition_grade") || "A+"
    const setName = getAttributeValue(attributes, "set") || getAttributeValue(attributes, "collection") || card.collection.toUpperCase()
    const setNumber = getAttributeValue(attributes, "set_number") || getAttributeValue(attributes, "number") || `${Math.abs(card.rotation).toString().padStart(3, '0')}/150`
    const rarity = determineRarity(attributes, card.price)
    const editionNumber = parseInt(getAttributeValue(attributes, "edition")) || parseInt(getAttributeValue(attributes, "print_number")) || parseInt(card.id) || 42
    const printRun = parseInt(getAttributeValue(attributes, "print_run")) || parseInt(getAttributeValue(attributes, "total_supply")) || 1000

    // Use real ownership history if available, otherwise fall back to default
    const ownershipHistory = realOwnershipHistory && realOwnershipHistory.length > 0 
      ? realOwnershipHistory 
      : [
          {
            owner: card.ownerAddress,
            date: new Date().toISOString().split('T')[0],
            price: card.price,
            txHash: `${card.listingPubkey.slice(-8)}...`,
          }
        ]

    return {
      ...card,
      name: metadata?.name || card.name,
      description: metadata?.description || `A rare ${setName} card from the blockchain`,
      setName,
      setNumber,
      rarity,
      condition,
      conditionGrade,
      conditionDescription: getConditionDescription(condition),
      priceChange24h: parseFloat(getAttributeValue(attributes, "price_change_24h")) || Math.random() * 20 - 10,
      lastSalePrice: parseFloat(getAttributeValue(attributes, "last_sale_price")) || card.price * 0.9,
      lastSaleDate: getAttributeValue(attributes, "last_sale_date") || "2025-01-15",
      floorPrice: parseFloat(getAttributeValue(attributes, "floor_price")) || card.price * 0.8,
      backImageUrl: getAttributeValue(attributes, "back_image") || "/electric-pokemon-card-back.png",
      holographicImageUrl: getAttributeValue(attributes, "holo_image") || metadata?.image || card.imageUrl,
      authenticated: true,
      authenticationHash: `0x${card.id}...${card.nftMint.slice(-8)}`,
      blockchainTxHash: `0x${card.listingPubkey.slice(-16)}`,
      editionNumber,
      printRun,
      artist: getAttributeValue(attributes, "artist") || getAttributeValue(attributes, "creator"),
      type: getAttributeValue(attributes, "type") || getAttributeValue(attributes, "card_type"),
      element: getAttributeValue(attributes, "element") || getAttributeValue(attributes, "energy_type"),
      hp: getAttributeValue(attributes, "hp") || getAttributeValue(attributes, "health_points"),
      attack: getAttributeValue(attributes, "attack") || getAttributeValue(attributes, "attack_power"),
      defense: getAttributeValue(attributes, "defense") || getAttributeValue(attributes, "defense_power"),
      abilities: attributes.filter(attr => attr.trait_type.toLowerCase().includes("ability")).map(attr => ({
        name: attr.trait_type,
        description: String(attr.value)
      })),
      owner: {
        address: card.ownerAddress,
        username: `User_${card.ownerAddress.slice(0, 6)}`,
        avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${card.ownerAddress}`,
        verified: true,
      },
      seller: {
        address: card.ownerAddress,
        username: `Trader_${card.ownerAddress.slice(-6)}`,
        rating: 4.5 + Math.random() * 0.5,
        totalSales: Math.floor(Math.random() * 500) + 50,
      },
      priceHistory: [
        { date: "2025-01-01", price: card.price * 0.8 },
        { date: "2025-01-05", price: card.price * 0.85 },
        { date: "2025-01-10", price: card.price * 0.95 },
        { date: "2025-01-15", price: card.price * 0.9 },
        { date: "2025-01-20", price: card.price },
      ],
      ownershipHistory,
      rawAttributes: attributes,
    }
  }

  // Fetch metadata when nftMint changes
  useEffect(() => {
    if (nftMint && program) {
      fetchDetailedNFTMetadata(nftMint).then(setNftMetadata)
    }
  }, [nftMint, program])

  // Reset state when nftMint changes
  useEffect(() => {
    if (!nftMint) {
      setNftMetadata(null)
      setError(null)
      setIsLoading(false)
    }
  }, [nftMint])

  return {
    nftMetadata,
    isLoading,
    error,
    getEnhancedCardData,
    getAttributeValue,
    determineRarity,
    getConditionDescription,
    refetch: () => nftMint ? fetchDetailedNFTMetadata(nftMint).then(setNftMetadata) : Promise.resolve(),
  }
} 
