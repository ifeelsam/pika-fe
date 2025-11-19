"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"

type SellerOrder = {
  id: string
  listingPubkey: string
  status: string
  cardId?: string | null
}

export function SellerNotificationBanner() {
  const { publicKey } = useWallet()
  const router = useRouter()
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      if (!publicKey) {
        setOrders([])
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ seller: publicKey.toString() })
        const response = await fetch(`/api/orders?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Unable to load notifications.")
        }

        const data = await response.json()
        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (err) {
        console.error("Failed to fetch seller notifications:", err)
        setError("Could not load shipment notifications.")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [publicKey])

  if (!publicKey) return null
  if (isLoading) {
    return (
      <div className="border border-white/15 bg-pikavault-dark/60 px-4 py-3 text-white font-space-grotesk text-sm">
        Checking for pending shipments...
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-pikavault-pink bg-pikavault-pink/10 px-4 py-3 text-pikavault-pink font-space-grotesk text-sm">
        {error}
      </div>
    )
  }

  const pendingOrders = orders.filter((order) => order.status === "PENDING_SHIPMENT")
  if (pendingOrders.length === 0) return null

  return (
    <button
      onClick={() => router.push("/orders")}
      className="w-full text-left border border-pikavault-cyan bg-pikavault-cyan/10 hover:bg-pikavault-cyan/20 px-4 py-3 text-white font-space-grotesk text-sm flex flex-col gap-1 transition-colors cursor-pointer"
    >
      <span className="font-monument text-xs tracking-[0.2em] text-pikavault-cyan">
        NEW SALE
      </span>
      <p>
        {pendingOrders.length === 1
          ? "1 card needs to be shipped. Click to view buyer contact info and release escrow."
          : `${pendingOrders.length} cards need to be shipped. Click to manage your sales.`}
      </p>
      <div className="text-white/70 text-xs">
        Click here to go to your seller dashboard →
      </div>
    </button>
  )
}

