"use client"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { initializeMarketplace } from "@/lib/anchor/transactions"
import { Button } from "@/components/ui/button"
import { useAnchorProgram } from "@/lib/anchor/client"

export function InitializeMarketplace() {
  const { publicKey } = useWallet()
  const { program } = useAnchorProgram();
  const [isLoading, setIsLoading] = useState(false)
  const [marketplaceAddress, setMarketplaceAddress] = useState<string | null>(null)

  const handleInitialize = async () => {
    if (!publicKey || !program) return

    try {
      setIsLoading(true)
      // Initialize marketplace with 2% fee (200 basis points)
      const { marketplace } = await initializeMarketplace(program, publicKey, 200)
      setMarketplaceAddress(marketplace.toBase58())
      console.log("Marketplace Address:", marketplace.toBase58())
    } catch (error) {
      console.error("Failed to initialize marketplace:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleInitialize}
        disabled={!publicKey || isLoading}
        className="bg-pikavault-yellow text-pikavault-dark hover:bg-pikavault-yellow/90 text-sm font-bold px-4 py-2 rounded-none"
        style={{ fontFamily: "'Monument Extended', sans-serif" }}
      >
        {isLoading ? "INITIALIZING..." : "INITIALIZE MARKETPLACE"}
      </Button>

      {marketplaceAddress && (
        <div className="p-4 bg-pikavault-dark/90 border-4 border-pikavault-yellow">
          <p className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            MARKETPLACE ADDRESS
          </p>
          <p className="font-mono text-white text-sm break-all">
            {marketplaceAddress}
          </p>
        </div>
      )}
    </div>
  )
} 