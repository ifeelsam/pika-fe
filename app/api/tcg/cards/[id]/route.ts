import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.pokemontcg.io/v2'

// Get API key from environment
const getApiKey = () => {
  return process.env.TCG_API || ''
}

// Create headers with API key
const createHeaders = () => {
  const apiKey = getApiKey()
  return {
    'Content-Type': 'application/json',
    ...(apiKey && { 'X-Api-Key': apiKey })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    const url = `${BASE_URL}/cards/${id}`
    console.log('Proxying TCG API card lookup:', url)

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
    
    // Add cache headers for better performance
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=900, stale-while-revalidate=1200' // Cache for 15 min
      }
    })

  } catch (error) {
    console.error('Error proxying TCG API card lookup:', error)
    return NextResponse.json(
      { error: 'Failed to fetch card from TCG API' }, 
      { status: 500 }
    )
  }
} 