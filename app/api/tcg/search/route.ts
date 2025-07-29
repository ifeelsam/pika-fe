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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const pageSize = searchParams.get('pageSize') || '10'
    const orderBy = searchParams.get('orderBy') || 'name'

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
    }

    // Build the search query
    const query = `name:"*${name}*"`
    const url = `${BASE_URL}/cards?q=${encodeURIComponent(query)}&pageSize=${pageSize}&orderBy=${orderBy}`

    console.log('Proxying TCG API request:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders()
    })

    if (!response.ok) {
      console.error('TCG API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `TCG API error: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // cache headers for performance + debug info
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=600', 
        'X-Cache-Status': 'MISS', // This request hit the API
        'X-Cache-Time': new Date().toISOString(),
        'X-API-Source': 'Pokemon-TCG-API'
      }
    })

  } catch (error) {
    console.error('Error proxying TCG API request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards from TCG API' }, 
      { status: 500 }
    )
  }
} 
