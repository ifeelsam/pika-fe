"use client"

import { useRef, useEffect, useState } from "react"
import { Copy, Grid, List } from "lucide-react"
import { useCollection } from "./collection-context"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useWallet } from "@solana/wallet-adapter-react"

export function CollectionHeader() {
  const { publicKey } = useWallet();
  const { totalValue, viewMode, setViewMode } = useCollection()
  const headerRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const [isCopied, setIsCopied] = useState(false)

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Animate total value counter
  useEffect(() => {
    const duration = 1.5
    const start = displayValue
    const end = totalValue
    const startTime = Date.now()

    const updateValue = () => {
      const now = Date.now()
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)

      // Use easeOutExpo for a more dramatic counting effect
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)

      const currentValue = Math.floor(start + (end - start) * easeOutExpo)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }

    updateValue()
  }, [totalValue])

  // Copy address to clipboard
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }
  }

  // Header animations
  useEffect(() => {
    if (headerRef.current) {
      const title = headerRef.current.querySelector("h1")
      const wallet = headerRef.current.querySelector(".wallet-address")
      const value = headerRef.current.querySelector(".value-counter")
      const toggle = headerRef.current.querySelector(".view-toggle")

      // Set initial state - hidden
      gsap.set(title, {
        y: 50,
        opacity: 0,
      })

      gsap.set([wallet, value, toggle], {
        y: 30,
        opacity: 0,
      })

      // Animate elements into view
      gsap.to(title, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      })

      gsap.to([wallet, value, toggle], {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.3,
        ease: "power3.out",
      })
    }
  }, [])

  // Split text for kerning disruption
  const splitText = (text: string) => {
    const letters = text.split("")
    return letters.map((letter, index) => {
      // Apply random kerning to some letters
      const randomKerning = index % 3 === 0 ? "tracking-tighter" : index % 3 === 1 ? "tracking-wider" : ""
      return (
        <span key={index} className={`inline-block ${randomKerning}`}>
          {letter}
        </span>
      )
    })
  }

  return (
    <div ref={headerRef} className="mb-12">
      <h1
        className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight font-monument"
      >
        {splitText("YOUR")} <span className="text-pikavault-yellow">{splitText("COLLECTION")}</span>
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-col space-y-2">
          <div className="wallet-address flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-pikavault-yellow to-pikavault-pink"></div>
            <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {publicKey && truncateAddress(publicKey?.toString())}
            </p>
            <button onClick={copyAddress} className="p-1 text-white/50 hover:text-pikavault-yellow transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            {isCopied && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-pikavault-yellow"
              >
                Copied!
              </motion.span>
            )}
          </div>

          <div className="value-counter">
            <p className="text-2xl font-black font-monument">
              <span className="text-white/50">TOTAL VALUE:</span>{" "}
              <span className="text-pikavault-yellow">${displayValue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="view-toggle flex items-center space-x-4">
          <Button
            onClick={() => setViewMode("grid")}
            className={`p-3 border-4 ${
              viewMode === "grid"
                ? "bg-pikavault-yellow/10 border-pikavault-yellow text-pikavault-yellow"
                : "bg-transparent border-white/20 text-white/70 hover:border-white/40"
            }`}
          >
            <Grid className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => setViewMode("list")}
            className={`p-3 border-4 ${
              viewMode === "list"
                ? "bg-pikavault-yellow/10 border-pikavault-yellow text-pikavault-yellow"
                : "bg-transparent border-white/20 text-white/70 hover:border-white/40"
            }`}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
