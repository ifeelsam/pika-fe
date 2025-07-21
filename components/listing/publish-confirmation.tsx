"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Check, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PublishConfirmationProps {
  cardData: any
  uploadedImages: string[]
  transactionSignature?: string | null
  nftMintAddress?: string | null
}

export function PublishConfirmation({ 
  cardData, 
  uploadedImages, 
  transactionSignature, 
  nftMintAddress 
}: PublishConfirmationProps) {
  const confirmationRef = useRef<HTMLDivElement>(null)

  // Animation for confirmation
  useEffect(() => {
    if (confirmationRef.current) {
      gsap.from(confirmationRef.current.children, {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      })
    }
  }, [])

  // Create explorer URLs
  const txExplorerUrl = transactionSignature 
    ? `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    : null
    
  const nftExplorerUrl = nftMintAddress
    ? `https://explorer.solana.com/address/${nftMintAddress}?cluster=devnet`
    : null

  return (
    <div ref={confirmationRef} className="max-w-3xl mx-auto text-center space-y-12">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-pikavault-yellow rounded-full flex items-center justify-center mb-8">
          <Check className="w-12 h-12 text-pikavault-dark" />
        </div>

        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          CARD TOKENIZED!
        </h2>

        <p className="text-xl text-white/70 max-w-2xl mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Your card has been successfully tokenized and listed on the PikaVault marketplace. You can view your listing
          and track its status in your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border-4 border-white/30 p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            CARD DETAILS
          </h3>

          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Card Name</span>
              <span className="font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                {cardData.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Set</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{cardData.set}</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Condition</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{cardData.condition}</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Price</span>
              <span className="text-pikavault-pink font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                ${cardData.price || cardData.suggestedPrice}
              </span>
            </div>
            {uploadedImages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Preview</p>
                <div className="aspect-square w-full max-w-[120px] overflow-hidden">
                  <img src={uploadedImages[0]} alt="Card" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border-4 border-white/30 p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            BLOCKCHAIN DETAILS
          </h3>

          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Status</span>
              <span className="text-pikavault-cyan font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {transactionSignature ? "Confirmed" : "Pending"}
              </span>
            </div>
            
            <div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Transaction</span>
              {txExplorerUrl ? (
                <a
                  href={txExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-white/70 sm:hover:text-pikavault-yellow transition-colors mt-1 break-all"
                >
                  <span className="font-mono text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {transactionSignature}
                  </span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 ml-1" />
                </a>
              ) : (
                <div className="text-white/50 font-mono text-xs mt-1">Transaction pending...</div>
              )}
            </div>
            
            <div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NFT Mint</span>
              {nftExplorerUrl ? (
                <a
                  href={nftExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-white/70 sm:hover:text-pikavault-yellow transition-colors mt-1 break-all"
                >
                  <span className="font-mono text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {nftMintAddress}
                  </span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 ml-1" />
                </a>
              ) : (
                <div className="text-white/50 font-mono text-xs mt-1">Mint address pending...</div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Network</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Solana Devnet</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Timestamp</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Link
          href={`/card/${nftMintAddress}`}
          className="inline-block px-8 py-4 bg-pikavault-yellow text-pikavault-dark font-bold text-lg"
          style={{ fontFamily: "'Monument Extended', sans-serif" }}
        >
          VIEW LISTING
        </Link>

        <div className="flex justify-center space-x-6 mt-4">
          <Link
            href="/marketplace"
            className="text-white/70 sm:hover:text-pikavault-yellow transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Go to Marketplace
          </Link>
          <Link
            href="/collection"
            className="text-white/70 sm:hover:text-pikavault-yellow transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            View My Collection
          </Link>
        </div>
      </div>
    </div>
  )
}
