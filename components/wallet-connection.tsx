"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Copy, ExternalLink, Check } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { WalletMobileSheet } from "./wallet-mobile-sheet"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { CustomWalletButton } from "./ui/custom-wallet-button"

export function WalletConnection() {
  const { publicKey, connected, disconnect } = useWallet()
  const { connection } = useConnection()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isDisconnectHovered, setIsDisconnectHovered] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  // Fetch balance when wallet is connected
  useEffect(() => {
    if (!publicKey) return

    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
      } catch (e) {
        console.error("Error fetching balance:", e)
      }
    }

    fetchBalance()

    // Subscribe to balance changes
    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        setBalance(accountInfo.lamports / LAMPORTS_PER_SOL)
      },
      "confirmed"
    )

    return () => {
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [publicKey, connection])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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

  // Sound effects
  const playSound = (type: "hover" | "click" | "success") => {
    // In a real app, you would implement actual sound effects here
    console.log(`Playing ${type} sound`)
  }

  // Truncate wallet address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!connected) {
    return <CustomWalletButton className="wallet-adapter-button-trigger"/>
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Connect Button */}
      <button
         onClick={() => {
          if (isMobile) {
            setIsMobileSheetOpen(!isMobileSheetOpen)
          } else {
            setIsDropdownOpen(!isDropdownOpen)
          }
          playSound("click")
        }}
        onMouseEnter={() => playSound("hover")}
        className="relative overflow-hidden font-bold py-2 px-4 md:py-3 md:px-6 bg-pikavault-cyan text-pikavault-dark transition-all duration-300"
        style={{ fontFamily: "'Monument Extended', sans-serif" }}
      >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-pikavault-yellow"></div>
          <span className="font-mono">{publicKey && truncateAddress(publicKey.toString())}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
      </button>

      {/* Dropdown for desktop */}
      {!isMobile && isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-pikavault-dark/95 border-4 border-pikavault-cyan z-50"
          style={{
            clipPath: "polygon(0 0, 100% 0, 95% 95%, 5% 100%)",
            animation: "fadeIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
          }}
        >
          <div className="p-4 space-y-4">
            {/* Wallet Address */}
            <div className="space-y-1">
              <p className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                WALLET ADDRESS
              </p>
              <div className="flex items-center justify-between bg-pikavault-dark border border-white/20 p-2">
                <p className="font-mono text-white text-sm truncate">{publicKey?.toString()}</p>
                <button
                  onClick={copyAddress}
                  className="p-1 sm:hover:text-pikavault-yellow transition-colors"
                  onMouseEnter={() => playSound("hover")}
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Network Status */}
            <div className="flex justify-between items-center">
              <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                NETWORK
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Solana Devnet
                </p>
              </div>
            </div>

            {/* Balance */}
            <div className="space-y-1">
              <p className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                BALANCE
              </p>
              <div className="flex justify-between items-baseline">
                <p
                  className="text-2xl font-black text-pikavault-yellow"
                  style={{ fontFamily: "'Monument Extended', sans-serif" }}
                >
                  {balance.toFixed(4)} SOL
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-white/20">
              <button
                className="w-full p-2 bg-transparent border-2 border-white/30 text-white sm:hover:border-white/60 transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={() => playSound("hover")}
                onClick={() => {
                  window.open(`https://explorer.solana.com/address/${publicKey?.toString()}?cluster=devnet`, "_blank")
                  playSound("click")
                }}
              >
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VIEW ON EXPLORER</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                className={`
                  w-full p-2 transition-colors flex items-center justify-center
                  ${isDisconnectHovered
                    ? "bg-pikavault-pink text-white"
                    : "bg-transparent border-2 border-pikavault-pink text-pikavault-pink"
                  }
                `}
                onMouseEnter={() => {
                  setIsDisconnectHovered(true)
                  playSound("hover")
                }}
                onMouseLeave={() => setIsDisconnectHovered(false)}
                onClick={() => {
                  disconnect()
                  setIsDropdownOpen(false)
                  playSound("click")
                }}
              >
                <span style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                  {isDisconnectHovered ? "SURE?" : "DISCONNECT"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sheet */}
      {isMobile && (
        <WalletMobileSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          walletData={{
            address: publicKey?.toString() || "",
            balance: balance,
            network: "Solana Devnet",
            usdBalance: 0,
          }}
          onDisconnect={() => {
            disconnect()
            setIsMobileSheetOpen(false)
          }}
          onCopy={copyAddress}
          isCopied={isCopied}
        />
      )}
    </div>
  )
}
