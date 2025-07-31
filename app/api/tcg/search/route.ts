import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.pokemontcg.io/v2'

// Get API key from environment
const getApiKey = () => {
  return process.env.TCG_API || ''
}

const createHeaders = () => {
  const apiKey = getApiKey()
  return {
    'Content-Type': 'application/json',
    ...(apiKey && { 'X-Api-Key': apiKey })
  }
}

// Helper function to try different search patterns
async function searchWithPattern(searchTerm: string, pageSize: string, orderBy: string): Promise<any> {
  const headers = createHeaders()
  
  // Define multiple search strategies in order of preference
  const searchStrategies = [
    // 1. Exact name match (highest priority)
    `name:"${searchTerm}"`,
    // 2. Case-insensitive exact match
    `name:"${searchTerm.toLowerCase()}"`,
    `name:"${searchTerm.toUpperCase()}"`,
    `name:"${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase()}"`,
    // 3. Wildcard searches
    `name:"*${searchTerm}*"`,
    `name:"*${searchTerm.toLowerCase()}*"`,
    `name:"*${searchTerm.toUpperCase()}*"`,
    `name:"*${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase()}*"`,
    // 4. Starts with patterns
    `name:"${searchTerm}*"`,
    `name:"${searchTerm.toLowerCase()}*"`,
    `name:"${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase()}*"`,
    // 5. Contains patterns (fallback)
    `name:*${searchTerm}*`,
    `name:*${searchTerm.toLowerCase()}*`,
    `name:*${searchTerm.toUpperCase()}*`
  ]

  let allResults: any[] = []
  let bestResponse = null

  for (const query of searchStrategies) {
    try {
      const url = `${BASE_URL}/cards?q=${encodeURIComponent(query)}&pageSize=${pageSize}&orderBy=${orderBy}`
      console.log(`Trying search pattern: ${query}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.data && data.data.length > 0) {
          console.log(`Found ${data.data.length} results with pattern: ${query}`)
          
          // If this is our first successful result, save it as best
          if (!bestResponse) {
            bestResponse = data
          }
          
          // Collect unique results
          for (const card of data.data) {
            if (!allResults.find(existing => existing.id === card.id)) {
              allResults.push(card)
            }
          }
          
          // If we found exact matches, prioritize them
          const exactMatches = data.data.filter((card: any) => 
            card.name.toLowerCase() === searchTerm.toLowerCase()
          )
          
          if (exactMatches.length > 0) {
            console.log(`Found ${exactMatches.length} exact matches, using those`)
            return {
              data: exactMatches,
              page: 1,
              pageSize: parseInt(pageSize),
              count: exactMatches.length,
              totalCount: exactMatches.length
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error with pattern ${query}:`, error)
      continue
    }
  }

  // Return the best results we found
  if (allResults.length > 0) {
    // Sort by relevance (exact matches first, then by name similarity)
    allResults.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm.toLowerCase()
      const bExact = b.name.toLowerCase() === searchTerm.toLowerCase()
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // If both or neither are exact, sort by name similarity
      const aIncludes = a.name.toLowerCase().includes(searchTerm.toLowerCase())
      const bIncludes = b.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (aIncludes && !bIncludes) return -1
      if (!aIncludes && bIncludes) return 1
      
      return a.name.localeCompare(b.name)
    })
    
    // Limit results to requested page size
    const limitedResults = allResults.slice(0, parseInt(pageSize))
    
    return {
      data: limitedResults,
      page: 1,
      pageSize: parseInt(pageSize),
      count: limitedResults.length,
      totalCount: allResults.length
    }
  }

  return bestResponse
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const pageSize = searchParams.get('pageSize') || '10'
    const orderBy = searchParams.get('orderBy') || 'name'

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
    }

    console.log(`Starting fuzzy search for: "${name}"`)

    // Use the enhanced fuzzy search
    const data = await searchWithPattern(name, pageSize, orderBy)
    
    if (!data) {
      console.log(`No results found for query: ${name}`)
      return NextResponse.json({
        data: [],
        page: 1,
        pageSize: parseInt(pageSize),
        count: 0,
        totalCount: 0
      }, {
        headers: {
          'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400',
          'X-Cache-Status': 'MISS',
          'X-Cache-Time': new Date().toISOString(),
          'X-API-Source': 'Pokemon-TCG-API',
          'X-Search-Type': 'fuzzy-no-results'
        }
      })
    }
    
    console.log(`Fuzzy search completed for "${name}": found ${data.totalCount} total results, returning ${data.count}`)
    
    // Add cache headers for better performance + debug info
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400', 
        'X-Cache-Status': 'MISS', // This request hit the API
        'X-Cache-Time': new Date().toISOString(),
        'X-API-Source': 'Pokemon-TCG-API',
        'X-Search-Type': 'fuzzy-enhanced'
      }
    })

  } catch (error) {
    console.error('Error in fuzzy search:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards from TCG API' }, 
      { status: 500 }
    )
  }
} 
