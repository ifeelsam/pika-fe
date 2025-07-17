import type { Metadata } from 'next'
import { CardDetailClient } from "@/components/card-detail/card-detail-client"

interface CardDetailPageProps {
  params: Promise<{ id: string }>
}

// Generate dynamic metadata for Open Graph sharing
export async function generateMetadata({ params }: CardDetailPageProps): Promise<Metadata> {
  const { id: nft_address } = await params

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pikavault.com'

  try {
    // Try to fetch card data server-side
    const { getCardDataForOG } = await import('@/lib/utils')
    const cardData = await getCardDataForOG(nft_address)

    if (cardData) {
      const title = `${cardData.name} ${cardData.price ? `- ${cardData.price.toFixed(2)} SOL` : ''} | PikaVault`
      const description = `${cardData.description} ${cardData.price ? `Listed for ${cardData.price.toFixed(2)} SOL on PikaVault.` : ''}`

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/card/${nft_address}`,
          siteName: 'PikaVault',
          images: [
            {
              url: cardData.image.startsWith('http') ? cardData.image : `${baseUrl}${cardData.image}`,
              width: 400,
              height: 600,
              alt: cardData.name,
            },
          ],
          locale: 'en_US',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [cardData.image.startsWith('http') ? cardData.image : `${baseUrl}${cardData.image}`],
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata for card:', error)
  }

  // metadata if card data fetch fails 
  return {
    title: `Card Details - PikaVault`,
    description: 'View detailed information about this digital card on PikaVault',
    openGraph: {
      title: `Card Details - PikaVault`,
      description: 'View detailed information about this digital card on PikaVault',
      url: `${baseUrl}/card/${nft_address}`,
      siteName: 'PikaVault',
      images: [
        {
          url: `${baseUrl}/placeholder-oai5n.png`,
          width: 400,
          height: 600,
          alt: 'Card Image',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Card Details - PikaVault`,
      description: 'View detailed information about this digital card on PikaVault',
      images: [`${baseUrl}/placeholder-oai5n.png`],
    },
  }
}

export default function CardDetailPage({ params }: CardDetailPageProps) {
  return <CardDetailClient params={params} />
}
