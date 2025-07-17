"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { Copy, Heart, Share2, MessageCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NETWORK } from "@/lib/anchor/config"

interface InformationPanelProps {
  card: any
  isWatchlisted: boolean
  onWatchlistToggle: () => void
  onSound: (soundType: "hover" | "click" | "success") => void
}

export function InformationPanel({ card, isWatchlisted, onWatchlistToggle, onSound }: InformationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "#F6FF00"
      case "epic":
        return "#FF2D55"
      case "rare":
        return "#00F5FF"
      default:
        return "#FFFFFF"
    }
  }

  const rarityColor = getRarityColor(card.rarity)

  // Panel entrance animation
  useEffect(() => {
    if (panelRef.current) {
      gsap.set(panelRef.current, {
        x: 100,
        opacity: 0,
      })

      gsap.to(panelRef.current, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: 0.8,
      })
    }
  }, [])

  // Price update animation
  useEffect(() => {
    if (priceRef.current) {
      gsap.fromTo(
        priceRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        },
      )
    }
  }, [card.price])

  // Copy hash function
  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    onSound("success")
    setTimeout(() => setCopied(false), 2000)
  }

  // Share function with native sharing support
  const handleShare = async () => {
    const shareData = {
      title: `${card.name} #${card.setNumber || card.id}`,
      text: `Check out this ${card.rarity} ${card.name} ${card.setName ? `from ${card.setName}` : ''} - ${parseFloat(card.price)} SOL on PikaVault!`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        onSound("success")
      } else {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        onSound("success")
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        onSound("success")
        setTimeout(() => setCopied(false), 2000)
      } catch (clipboardError) {
        console.error("Sharing failed:", error)
      }
    }
  }

  // Truncate hash
  const truncateHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-8)}`

  return (
    <div ref={panelRef} className="relative h-full flex flex-col justify-center space-y-8">
      {/* Primary Information Block */}
      <div className="space-y-6">
        {/* Card name */}
        <div className="relative">
          <h1
            className="text-4xl md:text-5xl font-black leading-tight"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            <span className="text-white">{card.name}</span>
            <span className="text-pikavault-yellow ml-4">#{card.setNumber.toString()}</span>
          </h1>

          {/* Rarity indicator */}
          <div
            className="absolute -top-2 -right-4 w-24 h-6 transform rotate-12"
            style={{
              background: `linear-gradient(45deg, ${rarityColor}, ${rarityColor}80)`,
            }}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-xs font-bold text-pikavault-dark font-monument"
              >
                {card.rarity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Set name */}
        <p className="text-xl text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {card.setName}
        </p>

        {/* Price */}
        <div ref={priceRef} className="space-y-2">
          <div className="flex items-baseline space-x-4">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black text-pikavault-pink font-monument"
            >
              {parseFloat(card.price)} SOL
            </h2>
            <div
              className={`text-xl font-bold ${card.priceChange24h >= 0 ? "text-pikavault-cyan" : "text-pikavault-pink"}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {card.priceChange24h >= 0 ? "+" : ""}
              {card.priceChange24h.toFixed(2)}%
            </div>
          </div>

          <div className="flex items-center space-x-4 text-white/50">
            <span className="font-space-grotesk">Floor: {card.floorPrice.toFixed(3)} SOL</span>
            <span className="font-space-grotesk">Last: {card.lastSalePrice.toFixed(3)} SOL</span>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="space-y-4 border-l-4 border-white/20 pl-6">
        <h3 className="text-xl font-bold font-monument text-white/70">
          SPECIFICATIONS
        </h3>

        <div className="space-y-3">
          {/* Condition */}
          <div className="flex justify-between items-center">
            <span className="font-space-grotesk">Condition</span>
            <div className="flex items-center space-x-2">
              <span
                className="text-2xl font-black"
                style={{ fontFamily: "'Monument Extended', sans-serif", color: rarityColor }}
              >
                {card.conditionGrade}
              </span>
              <span className="text-white/70 font-space-grotesk">
                ({card.condition})
              </span>
            </div>
          </div>

          {/* Edition */}
          <div className="flex justify-between items-center">
            <span className="font-space-grotesk">Edition</span>
            <span className="font-mono text-[#00FF85]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {card.editionNumber}/{card.printRun}
            </span>
          </div>

          {/* Authentication */}
          <div className="flex justify-between items-center">
            <span className="font-space-grotesk">NFT Mint</span>
            <button
              onClick={() => copyHash(card.nftMint)}
              className="flex items-center space-x-2 text-white/70 md:hover:text-pikavault-yellow transition-colors"
            >
              <span className="font-mono text-sm">{truncateHash(card.nftMint)}</span>
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Blockchain verification */}
          <div className="flex justify-between items-center">
            <span className="font-space-grotesk">Blockchain</span>
            <a
              href={`https://explorer.solana.com/address/${card.nftMint}?cluster=${NETWORK}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-pikavault-cyan md:hover:text-pikavault-cyan/80 transition-colors"
            >
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Verified</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Action Interface */}
      <div className="space-y-4">
        {/* Primary CTA */}
        <Button
          className="w-full bg-pikavault-yellow md:hover:bg-pikavault-yellow/90 text-pikavault-dark text-xl font-black font-monument py-6 rounded-none transition-all duration-300 md:hover:scale-105"
          onClick={() => onSound("click")}
          onMouseEnter={() => onSound("hover")}
        >
          BUY NOW
        </Button>

        {/* Secondary CTA */}
        {/* <Button
          className="w-full bg-transparent border-4 border-pikavault-pink md:hover:bg-pikavault-pink/10 text-white text-lg font-bold py-4 rounded-none transition-all duration-300"
          style={{ fontFamily: "'Monument Extended', sans-serif" }}
          onClick={() => onSound("click")}
          onMouseEnter={() => onSound("hover")}
        >
          MAKE OFFER
        </Button> */}

        {/* Utility actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => {
              onWatchlistToggle()
              onSound("click")
            }}
            className={`p-4 border-2 transition-all duration-300 ${
              isWatchlisted
                ? "bg-pikavault-pink/20 border-pikavault-pink text-pikavault-pink"
                : "bg-transparent border-white/30 text-white md:hover:border-white/60"
            }`}
          >
            <Heart className={`w-5 h-5 ${isWatchlisted ? "fill-current" : ""}`} />
          </Button>

          <Button
            onClick={() => {
              handleShare()
              onSound("click")
            }}
            className="p-4 bg-transparent border-2 border-white/30 text-white md:hover:border-white/60 transition-all duration-300"
          >
            <Share2 className="w-5 h-5" />
          </Button>

          {/* <Button
            onClick={() => onSound("click")}
            className="p-4 bg-transparent border-2 border-white/30 text-white md:hover:border-white/60 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
          </Button> */}
        </div>
      </div>

      {/* Seller information */}
      <div className="border-t border-white/20 pt-6">
        <h4 className="text-lg font-bold mb-4 font-monument">
          SELLER
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold font-space-grotesk">
              {card.seller.username}
            </p>
            <p className="text-white/70 text-sm font-space-grotesk">
              {card.seller.rating}/5 • {card.seller.totalSales} sales
            </p>
          </div>

          <Button
            onClick={() => onSound("click")}
            className="bg-pikavault-cyan md:hover:bg-pikavault-cyan/90 text-pikavault-dark font-bold px-6 py-2 rounded-none"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            CONTACT
          </Button>
        </div>
      </div>

      {/* Copy notification */}
      {copied && (
        <div className="fixed top-24 right-8 bg-[#00FF85] text-pikavault-dark px-4 py-2 font-bold z-50">
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}
