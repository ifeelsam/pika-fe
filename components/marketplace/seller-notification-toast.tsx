"use client"

import { useEffect, useRef, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { X } from "lucide-react"

type SellerOrder = {
  id: string
  listingPubkey: string
  status: string
  cardId?: string | null
}

export function SellerNotificationToast() {
  const { publicKey } = useWallet()
  const router = useRouter()
  const toastRef = useRef<HTMLDivElement>(null)
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      if (!publicKey) {
        setOrders([])
        setIsVisible(false)
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams({ seller: publicKey.toString() })
        const response = await fetch(`/api/orders?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Unable to load notifications.")
        }

        const data = await response.json()
        const fetchedOrders = Array.isArray(data.orders) ? data.orders : []
        const pendingOrders = fetchedOrders.filter((order: SellerOrder) => order.status === "PENDING_SHIPMENT")
        
        // Check if there are new pending orders (count increased)
        const viewedKey = `seller_notification_viewed_${publicKey.toString()}`
        const viewedPendingCountKey = `seller_notification_viewed_count_${publicKey.toString()}`
        const lastViewedCount = parseInt(localStorage.getItem(viewedPendingCountKey) || "0", 10)
        
        // If pending orders count increased, reset viewed state
        if (pendingOrders.length > lastViewedCount) {
          localStorage.removeItem(viewedKey)
        }
        
        setOrders(fetchedOrders)
        const wasViewed = localStorage.getItem(viewedKey) === "true"
        
        if (pendingOrders.length > 0 && !wasViewed) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      } catch (err) {
        console.error("Failed to fetch seller notifications:", err)
        setIsVisible(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
    // Poll for new orders every 30 seconds
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [publicKey])

  // Listen for notification viewed event
  useEffect(() => {
    const handleNotificationViewed = () => {
      if (toastRef.current && isVisible) {
        gsap.to(toastRef.current, {
          x: 400,
          y: -100,
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setIsVisible(false)
          },
        })
      }
    }

    window.addEventListener("sellerNotificationViewed", handleNotificationViewed)
    return () => {
      window.removeEventListener("sellerNotificationViewed", handleNotificationViewed)
    }
  }, [isVisible])

  useEffect(() => {
    if (toastRef.current && isVisible) {
      // Entrance animation from top-right
      gsap.fromTo(
        toastRef.current,
        {
          x: 400,
          y: -100,
          opacity: 0,
          scale: 0.8,
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
        },
      )
    }
  }, [isVisible])

  const handleClose = () => {
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        x: 400,
        y: -100,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setIsVisible(false)
          if (publicKey) {
            const viewedKey = `seller_notification_viewed_${publicKey.toString()}`
            const viewedPendingCountKey = `seller_notification_viewed_count_${publicKey.toString()}`
            const pendingOrders = orders.filter((order) => order.status === "PENDING_SHIPMENT")
            localStorage.setItem(viewedKey, "true")
            localStorage.setItem(viewedPendingCountKey, pendingOrders.length.toString())
            // Notify navigation to stop animation
            window.dispatchEvent(new CustomEvent("sellerNotificationViewed"))
          }
        },
      })
    }
  }

  const handleClick = () => {
    if (publicKey) {
      const viewedKey = `seller_notification_viewed_${publicKey.toString()}`
      const viewedPendingCountKey = `seller_notification_viewed_count_${publicKey.toString()}`
      const pendingOrders = orders.filter((order) => order.status === "PENDING_SHIPMENT")
      localStorage.setItem(viewedKey, "true")
      localStorage.setItem(viewedPendingCountKey, pendingOrders.length.toString())
      window.dispatchEvent(new CustomEvent("sellerNotificationViewed"))
    }
    router.push("/orders")
    handleClose()
  }

  const pendingOrders = orders.filter((order) => order.status === "PENDING_SHIPMENT")
  
  if (!publicKey || isLoading || !isVisible || pendingOrders.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div
        ref={toastRef}
        onClick={handleClick}
        className="relative w-[400px] max-w-[calc(100vw-2rem)] cursor-pointer transition-all duration-300 border border-pikavault-cyan bg-pikavault-cyan/10 hover:bg-pikavault-cyan/20 backdrop-blur-sm shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-white hover:text-pikavault-cyan transition-colors z-10"
        >
          <X className="w-4 h-4" strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          <span className="font-monument text-xs tracking-[0.2em] text-pikavault-cyan">
            NEW SALE
          </span>
          <p className="text-white font-space-grotesk text-sm">
            {pendingOrders.length === 1
              ? "1 card needs to be shipped. Click to view buyer contact info and release escrow."
              : `${pendingOrders.length} cards need to be shipped. Click to manage your sales.`}
          </p>
          <div className="text-white/70 text-xs font-space-grotesk">
            Click here to go to your seller dashboard →
          </div>
        </div>
      </div>
    </div>
  )
}

