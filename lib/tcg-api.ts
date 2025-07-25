// Pokémon TCG API utility functions

interface PokemonCard {
  id: string
  name: string
  supertype: string
  subtypes?: string[]
  number: string
  artist?: string
  rarity: string
  set: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    legalities: Record<string, string>
    ptcgoCode?: string
    releaseDate: string
    updatedAt: string
    images: {
      symbol: string
      logo: string
    }
  }
  images: {
    small: string
    large: string
  }
  tcgplayer?: {
    url: string
    updatedAt: string
    prices?: {
      holofoil?: {
        low: number
        mid: number
        high: number
        market: number
        directLow?: number
      }
      reverseHolofoil?: {
        low: number
        mid: number
        high: number
        market: number
        directLow?: number
      }
      normal?: {
        low: number
        mid: number
        high: number
        market: number
        directLow?: number
      }
    }
  }
  cardmarket?: {
    url: string
    updatedAt: string
    prices: {
      averageSellPrice: number
      lowPrice: number
      trendPrice: number
      germanProLow?: number
      suggestedPrice?: number
      reverseHoloSell?: number
      reverseHoloLow?: number
      reverseHoloTrend?: number
      lowPriceExPlus?: number
      avg1?: number
      avg7?: number
      avg30?: number
      reverseHoloAvg1?: number
      reverseHoloAvg7?: number
      reverseHoloAvg30?: number
    }
  }
}

interface TCGApiResponse {
  data: PokemonCard[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

interface SearchCardsParams {
  name?: string
  set?: string
  rarity?: string
  supertype?: string
  types?: string
  page?: number
  pageSize?: number
  orderBy?: string
}

// Get API key from environment
const getApiKey = () => {
  return process.env.NEXT_PUBLIC_TCG_API || ''
}

// Base API URL
const BASE_URL = 'https://api.pokemontcg.io/v2'

// Create headers with API key
const createHeaders = () => {
  const apiKey = getApiKey()
  return {
    'Content-Type': 'application/json',
    ...(apiKey && { 'X-Api-Key': apiKey })
  }
}

// Search for cards with various filters
export async function searchCards(params: SearchCardsParams = {}): Promise<TCGApiResponse> {
  try {
    const searchParams = new URLSearchParams()
    
    // Build query string from search parameters
    const queries: string[] = []
    
    if (params.name) {
      queries.push(`name:"*${params.name}*"`)
    }
    if (params.set) {
      queries.push(`set.name:"*${params.set}*"`)
    }
    if (params.rarity) {
      queries.push(`rarity:${params.rarity}`)
    }
    if (params.supertype) {
      queries.push(`supertype:${params.supertype}`)
    }
    if (params.types) {
      queries.push(`types:${params.types}`)
    }
    
    if (queries.length > 0) {
      searchParams.append('q', queries.join(' '))
    }
    
    if (params.page) {
      searchParams.append('page', params.page.toString())
    }
    if (params.pageSize) {
      searchParams.append('pageSize', params.pageSize.toString())
    } else {
      searchParams.append('pageSize', '20') // Default page size
    }
    if (params.orderBy) {
      searchParams.append('orderBy', params.orderBy)
    }

    const url = `${BASE_URL}/cards?${searchParams.toString()}`
    console.log('Searching cards with URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders()
    })

    if (!response.ok) {
      throw new Error(`TCG API error: ${response.status} ${response.statusText}`)
    }

    const data: TCGApiResponse = await response.json()
    console.log(`Found ${data.totalCount} cards, returning ${data.data.length} results`)
    
    return data
    
  } catch (error) {
    console.error('Error searching cards:', error)
    throw new Error(`Failed to search cards: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get a specific card by ID
export async function getCardById(id: string): Promise<PokemonCard> {
  try {
    const url = `${BASE_URL}/cards/${id}`
    console.log('Fetching card with ID:', id)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders()
    })

    if (!response.ok) {
      throw new Error(`TCG API error: ${response.status} ${response.statusText}`)
    }

    const data: { data: PokemonCard } = await response.json()
    console.log('Found card:', data.data.name)
    
    return data.data
    
  } catch (error) {
    console.error('Error fetching card by ID:', error)
    throw new Error(`Failed to fetch card: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Search for cards by name (useful for card detection)
export async function searchCardsByName(name: string, limit: number = 10): Promise<PokemonCard[]> {
  try {
    const response = await searchCards({
      name: name,
      pageSize: limit,
      orderBy: 'name'
    })
    
    return response.data
    
  } catch (error) {
    console.error('Error searching cards by name:', error)
    return []
  }
}

// Get suggested market price from card data
export function getMarketPrice(card: PokemonCard, condition: string = 'near mint'): number {
  try {
    // Try TCGPlayer prices first
    if (card.tcgplayer?.prices) {
      const prices = card.tcgplayer.prices
      
      // Determine which price category to use based on card type
      let priceData = prices.normal || prices.holofoil || prices.reverseHolofoil
      
      if (priceData) {
        // Return market price, or fall back to mid price
        return priceData.market || priceData.mid || priceData.high || 0
      }
    }
    
    // Try Cardmarket prices as fallback
    if (card.cardmarket?.prices) {
      const prices = card.cardmarket.prices
      return prices.trendPrice || prices.averageSellPrice || 0
    }
    
    return 0
  } catch (error) {
    console.error('Error getting market price:', error)
    return 0
  }
}

// Clean up card name to extract base Pokemon name
function cleanCardName(name: string): string {
  // Remove possessive names (Ash's, Team Rocket's, etc.)
  let cleanName = name.replace(/^[A-Za-z\s]+\'s\s+/, '')
  
  // Remove prefixes like "Dark", "Light", "Team Rocket's", etc.
  cleanName = cleanName.replace(/^(Dark|Light|Shining|Crystal|Delta Species|Team Rocket's|Rocket's|Giovanni's|Lt\. Surge's|Misty's|Brock's|Erika's|Koga's|Sabrina's|Blaine's|)\s+/, '')
  
  // Remove suffixes like "ex", "GX", "V", "VMAX", etc.
  cleanName = cleanName.replace(/\s+(ex|EX|GX|V|VMAX|VSTAR|Prime|LEGEND|BREAK|Tag Team|&.*)?$/i, '')
  
  // Remove level indicators like "Lv.X"
  cleanName = cleanName.replace(/\s+Lv\.\d+/i, '')
  
  // Remove numbers and special characters at the end
  cleanName = cleanName.replace(/\s+\d+.*$/, '')
  
  // Trim and return
  return cleanName.trim()
}

// Clean up set name to be more readable
function cleanSetName(setName: string): string {
  // Remove "Pokemon " prefix if present
  let cleanSet = setName.replace(/^Pokemon\s+/i, '')
  
  // Simplify common set name patterns
  const setMappings: { [key: string]: string } = {
    'Base Set': 'Base Set',
    'Base Set 2': 'Base Set 2',
    'Jungle': 'Jungle',
    'Fossil': 'Fossil',
    'Team Rocket': 'Team Rocket',
    'Gym Heroes': 'Gym Heroes',
    'Gym Challenge': 'Gym Challenge',
    'Neo Genesis': 'Neo Genesis',
    'Neo Discovery': 'Neo Discovery',
    'Neo Destiny': 'Neo Destiny',
    'Neo Revelation': 'Neo Revelation'
  }
  
  // Check if we have a simplified mapping
  for (const [original, simplified] of Object.entries(setMappings)) {
    if (cleanSet.toLowerCase().includes(original.toLowerCase())) {
      return simplified
    }
  }
  
  // Remove redundant words and shorten long names
  cleanSet = cleanSet.replace(/\s+(Series|Collection|Expansion|Set)$/i, '')
  
  // Limit length for display
  if (cleanSet.length > 25) {
    cleanSet = cleanSet.substring(0, 22) + '...'
  }
  
  return cleanSet
}

// Normalize rarity names
function normalizeRarity(rarity: string): string {
  const rarityMappings: { [key: string]: string } = {
    'common': 'common',
    'uncommon': 'uncommon',
    'rare': 'rare',
    'rare holo': 'rare',
    'rare holo ex': 'rare',
    'rare holo gx': 'rare',
    'rare holo v': 'rare',
    'rare holo vmax': 'rare',
    'rare holo vstar': 'rare',
    'rare prime': 'rare',
    'rare legend': 'legendary',
    'rare ace': 'rare',
    'rare break': 'rare',
    'rare prism star': 'rare',
    'rare rainbow': 'rare',
    'rare secret': 'rare',
    'rare shiny': 'rare',
    'rare shiny gx': 'rare',
    'rare ultra': 'rare',
    'radiant rare': 'rare',
    'amazing rare': 'rare',
    'classic collection': 'rare',
    'double rare': 'rare',
    'hyper rare': 'rare',
    'illustration rare': 'rare',
    'special illustration rare': 'rare',
    'ultra rare': 'rare',
    'promo': 'rare'
  }
  
  const normalizedKey = rarity.toLowerCase()
  return rarityMappings[normalizedKey] || 'common'
}

// Format card data for our application
export function formatCardForApp(card: PokemonCard) {
  const marketPrice = getMarketPrice(card)
  
  return {
    name: cleanCardName(card.name),
    set: cleanSetName(card.set.name),
    number: card.number,
    rarity: normalizeRarity(card.rarity),
    language: "English", // Default, could be enhanced later
    condition: "", // User will specify
    conditionNotes: "",
    price: 0, // User will set
    suggestedPrice: Math.round(marketPrice * 100), // Convert to cents
    listingType: "fixed",
    duration: "7d",
    isGraded: false,
    gradingCompany: "",
    gradingScore: "",
    // Additional metadata
    tcgId: card.id,
    artist: card.artist,
    setId: card.set.id,
    images: card.images,
    originalName: card.name, // Keep original for reference
    originalSet: card.set.name,
    originalRarity: card.rarity
  }
}

// Smart card detection based on text extraction (placeholder for future OCR integration)
export async function detectCardFromText(extractedText: string): Promise<PokemonCard | null> {
  try {
    // This is a simplified version - in a real implementation, you'd use OCR
    // to extract text from the image and then match it against the API
    
    // For now, we'll search for the most likely card based on extracted text
    const words = extractedText.toLowerCase().split(' ').filter(word => word.length > 2)
    
    for (const word of words) {
      const results = await searchCardsByName(word, 5)
      if (results.length > 0) {
        // Return the first match with highest confidence
        return results[0]
      }
    }
    
    return null
  } catch (error) {
    console.error('Error detecting card from text:', error)
    return null
  }
} 