"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletConnection } from "@/components/wallet-connection"
import { HamburgerNav } from "@/components/ui/hamburger"
import { gsap } from "gsap"

type SellerOrder = {
  id: string
  listingPubkey: string
  status: string
  cardId?: string | null
}

export function Navigation() {
  const { publicKey } = useWallet()
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hasPendingOrders, setHasPendingOrders] = useState(false)
  const [notificationViewed, setNotificationViewed] = useState(false)
  const ordersLinkRef = useRef<HTMLAnchorElement>(null)
  const underlineRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check for pending orders
  useEffect(() => {
    const checkPendingOrders = async () => {
      if (!publicKey) {
        setHasPendingOrders(false)
        return
      }

      try {
        const params = new URLSearchParams({ seller: publicKey.toString() })
        const response = await fetch(`/api/orders?${params.toString()}`)
        if (!response.ok) {
          return
        }

        const data = await response.json()
        const orders = Array.isArray(data.orders) ? data.orders : []
        const pendingOrders = orders.filter((order: SellerOrder) => order.status === "PENDING_SHIPMENT")
        
        const viewedKey = `seller_notification_viewed_${publicKey.toString()}`
        const wasViewed = localStorage.getItem(viewedKey) === "true"
        
        setHasPendingOrders(pendingOrders.length > 0)
        setNotificationViewed(wasViewed)
      } catch (err) {
        console.error("Failed to check pending orders:", err)
      }
    }

    checkPendingOrders()
    // Poll for new orders every 30 seconds
    const interval = setInterval(checkPendingOrders, 30000)
    return () => clearInterval(interval)
  }, [publicKey])

  // Listen for notification viewed event
  useEffect(() => {
    const handleNotificationViewed = () => {
      setNotificationViewed(true)
    }

    window.addEventListener("sellerNotificationViewed", handleNotificationViewed)
    return () => {
      window.removeEventListener("sellerNotificationViewed", handleNotificationViewed)
    }
  }, [])

  // Animate underline when there are pending orders and notification hasn't been viewed
  useEffect(() => {
    if (underlineRef.current && ordersLinkRef.current) {
      // Clean up previous animation
      if (animationRef.current) {
        animationRef.current.kill()
        animationRef.current = null
      }

      if (hasPendingOrders && !notificationViewed) {
        const linkWidth = ordersLinkRef.current.offsetWidth
        
        // Create continuous loop animation: left to right, then right to left
        const tl = gsap.timeline({ repeat: -1 })
        
        // Left to right
        tl.to(underlineRef.current, {
          width: linkWidth,
          duration: 1,
          ease: "power2.inOut",
        })
        // Right to left
        .to(underlineRef.current, {
          width: 0,
          duration: 1,
          ease: "power2.inOut",
        })

        animationRef.current = tl
      } else {
        // Reset to 0 width when no pending orders or notification viewed
        gsap.set(underlineRef.current, { width: 0 })
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
        animationRef.current = null
      }
    }
  }, [hasPendingOrders, notificationViewed])

  const navItems = [
    { name: "COLLECTION", href: "/collection" },
    { name: "MARKETPLACE", href: "/marketplace" },
    { name: "ORDERS", href: "/orders" },
    { name: "ABOUT", href: "/about" },
    { name: "LIST", href: "/list" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrollPosition > 50 ? "bg-pikavault-dark/90 backdrop-blur-md py-3" : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-black text-pikavault-yellow sm:hover:text-white tracking-wider relative group font-monument"
        >
          PIKA
          <span className="text-white sm:group-hover:text-pikavault-yellow">VAULT</span>
          <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-pikavault-yellow sm:group-hover:w-full transition-all duration-300"></span>
        </Link>

        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => {
            const isOrders = item.name === "ORDERS"
            const handleOrdersClick = () => {
              if (isOrders && publicKey && hasPendingOrders && !notificationViewed) {
                const viewedKey = `seller_notification_viewed_${publicKey.toString()}`
                localStorage.setItem(viewedKey, "true")
                setNotificationViewed(true)
                window.dispatchEvent(new CustomEvent("sellerNotificationViewed"))
              }
            }
            return (
              <Link
                key={item.name}
                ref={isOrders ? ordersLinkRef : null}
                href={item.href}
                onClick={handleOrdersClick}
                className="text-white sm:hover:text-pikavault-yellow relative group text-lg font-medium tracking-wider font-space-grotesk"
              >
                {item.name}
                {isOrders ? (
                  <>
                    {/* Animated underline for pending orders */}
                    <span
                      ref={underlineRef}
                      className="absolute -bottom-1 left-0 h-[2px] bg-pikavault-yellow"
                      style={{ width: 0 }}
                    />
                    {/* Hover underline (only shows on hover when no animation) */}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-pikavault-yellow sm:group-hover:w-full transition-all duration-300" 
                      style={{ 
                        display: hasPendingOrders && !notificationViewed ? 'none' : 'block' 
                      }}
                    />
                  </>
                ) : (
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-pikavault-yellow sm:group-hover:w-full transition-all duration-300"></span>
                )}
              </Link>
            )
          })}

          <WalletConnection />
        </nav>

        <div className="flex items-center space-x-4 lg:hidden">
          <HamburgerNav />
        </div>
      </div>
    </header>
  )
}